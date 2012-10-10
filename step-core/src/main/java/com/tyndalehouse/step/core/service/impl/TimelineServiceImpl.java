/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.utils.ConversionUtils.epochMinutesStringToLocalDateTime;
import static com.tyndalehouse.step.core.utils.ConversionUtils.localDateTimeToEpochMinutes;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static org.apache.lucene.search.NumericRangeQuery.newLongRange;

import java.util.Arrays;
import java.util.Comparator;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.MatchAllDocsQuery;
import org.apache.lucene.search.NumericRangeQuery;
import org.joda.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.entities.aggregations.TimelineEventsAndDate;
import com.tyndalehouse.step.core.models.EnhancedTimelineEvent;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.TimelineService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * The implementation of the timeline service, based on JDBC and ORM Lite to access the database.
 * 
 * @author chrisburrell
 */
@Singleton
public class TimelineServiceImpl implements TimelineService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TimelineServiceImpl.class);
    private final JSwordPassageService jsword;
    private final EntityIndexReader hotspots;
    private final EntityIndexReader timelineEvents;

    /**
     * @param manager the entity manager
     * @param jsword the jsword service
     */
    @Inject
    public TimelineServiceImpl(final EntityManager manager, final JSwordPassageService jsword) {
        this.jsword = jsword;
        this.hotspots = manager.getReader("hotspot");
        this.timelineEvents = manager.getReader("timelineEvent");
    }

    @Override
    public EntityDoc[] getTimelineConfiguration() {
        return this.hotspots.search(new MatchAllDocsQuery());
    }

    @Override
    public TimelineEventsAndDate getEventsFromScripture(final String reference) {
        final TimelineEventsAndDate timelineEventsAndDate = new TimelineEventsAndDate();

        final EntityDoc[] matchingTimelineEvents = lookupEventsMatchingReference(reference);
        timelineEventsAndDate.setEvents(matchingTimelineEvents);

        timelineEventsAndDate.setDateTime(getDateForEvents(matchingTimelineEvents));

        return timelineEventsAndDate;

    }

    /**
     * Gets the date which is most appropriate for centering around these events, i.e. the median?
     * 
     * @param matchingTimelineEvents the number of events
     * @return the localDateTime of the median event, if a duration, then of the start point
     */
    private LocalDateTime getDateForEvents(final EntityDoc[] matchingTimelineEvents) {
        if (matchingTimelineEvents.length == 0) {
            return null;
        }

        // copy list to new list that can be sorted

        Arrays.sort(matchingTimelineEvents, new Comparator<EntityDoc>() {

            @Override
            public int compare(final EntityDoc o1, final EntityDoc o2) {
                final String o1StartString = o1.get("fromDate");
                final String o2StartString = o2.get("fromDate");

                final boolean blankO1 = isBlank(o1StartString);
                final boolean blankO2 = isBlank(o2StartString);
                if (blankO1 && blankO2) {
                    return 0;
                }

                if (blankO1) {
                    return 1;
                }

                if (blankO2) {
                    return -1;
                }

                final long o1Start = Long.parseLong(o1StartString);
                final long o2Start = Long.parseLong(o2StartString);
                return Long.compare(o1Start, o2Start);
            }
        });

        // now we simply return the median element
        return epochMinutesStringToLocalDateTime(matchingTimelineEvents[matchingTimelineEvents.length / 2]
                .get("fromDate"));
    }

    /**
     * This method simply takes a reference, resolves it to the kjv versification, and then manages to output
     * all events that match
     * 
     * @param reference the reference we are looking for
     * @return the list of events matching the reference
     */
    @Override
    public EntityDoc[] lookupEventsMatchingReference(final String reference) {
        // first get the kjv reference
        final String allReferences = this.jsword.getAllReferences(reference, "ESV");

        if (isBlank(allReferences)) {
            return new EntityDoc[0];
        }

        // let's assume for now we look up all references
        LOGGER.debug("Finding events for [{}]", allReferences);
        return this.timelineEvents.searchSingleColumn("references", allReferences);
    }

    @Override
    public EntityDoc[] getTimelineEvents(final LocalDateTime from, final LocalDateTime to) {
        final long startMinutes = localDateTimeToEpochMinutes(from);
        final long endMinutes = localDateTimeToEpochMinutes(to);

        // start within range
        final NumericRangeQuery<Long> startInRange = newLongRange("fromDate", startMinutes, endMinutes, true,
                true);

        // events that don't have a to date
        final NumericRangeQuery<Long> haveToDates = newLongRange("toDate", null, null, false, false);

        // point events should be within range and not have a to date.
        final BooleanQuery pointEventsInRage = new BooleanQuery();
        pointEventsInRage.add(startInRange, Occur.MUST);
        pointEventsInRage.add(haveToDates, Occur.MUST_NOT);

        // we want to match those documents that have a from date before the end of the given range, i.e. if
        // an event finishes 1299BC we want to include it in the range (1300BC, xyz)
        final NumericRangeQuery<Long> fromIsBeforeEnd = newLongRange("fromDate", null, endMinutes, false,
                true);

        // now we also want those that start after the given range
        final NumericRangeQuery<Long> toIsAfterStart = newLongRange("toDate", startMinutes, null, false, true);

        // combine the above two queries
        final BooleanQuery durationsInRange = new BooleanQuery();
        durationsInRange.add(fromIsBeforeEnd, Occur.MUST);
        durationsInRange.add(toIsAfterStart, Occur.MUST);

        // combine the two queries
        final BooleanQuery docsInRange = new BooleanQuery();
        docsInRange.add(pointEventsInRage, Occur.SHOULD);
        docsInRange.add(durationsInRange, Occur.SHOULD);

        return this.timelineEvents.search(docsInRange);
    }

    @Override
    public EnhancedTimelineEvent getTimelineEvent(final String id, final String version) {
        final EntityDoc[] results = this.timelineEvents.searchExactTermBySingleField("id", 1, id);
        if (results.length == 0) {
            return null;
        }

        final EnhancedTimelineEvent ete = new EnhancedTimelineEvent(results[0]);

        final String references = ete.getEvent().get("storedReferences");
        final String[] refs = StringUtils.split(references);
        for (final String r : refs) {
            final OsisWrapper osisText = this.jsword.peakOsisText(version, KEYED_REFERENCE_VERSION, r);
            ete.add(osisText);
        }
        return ete;
    }
}
