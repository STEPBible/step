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

import static com.tyndalehouse.step.core.data.entities.reference.TargetType.TIMELINE_EVENT;
import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.joda.time.LocalDateTime;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.data.entities.aggregations.TimelineEventsAndDate;
import com.tyndalehouse.step.core.data.entities.reference.TargetType;
import com.tyndalehouse.step.core.service.TimelineService;

/**
 * tests the timeline service
 * 
 * @author chrisburrell
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class TimelineServiceImplTest extends DataDrivenTestExtension {
    private static final Logger LOG = LoggerFactory.getLogger(FavouritesServiceImpl.class);
    private TimelineService ts;

    @Mock
    private JSwordServiceImpl jsword;

    /**
     * sets up a few things to be able to test properly
     */
    @Before
    public void setUp() {

        this.ts = new TimelineServiceImpl(getEbean(), this.jsword);
    }

    /**
     * tests looking up scripture from a reference
     */
    @Test
    public void testGetEventsFromScriptureTimelineEvent() {
        final List<ScriptureReference> testReferences = saveEventWithVerses(TIMELINE_EVENT, 5, 10);

        // ensure we return the references that we've set up
        when(this.jsword.getPassageReferences(anyString(), any(TargetType.class), anyString())).thenReturn(
                testReferences);

        final TimelineEventsAndDate eventsForPassage = this.ts.getEventsFromScripture("");

        // check that we have our 1 event back
        assertEquals(1, eventsForPassage.getEvents().size());
    }

    /**
     * tests looking up scripture from a reference
     */
    @Test
    public void testGetEventsFromScriptureNoPastOrFuture() {
        final List<ScriptureReference> testReferences = saveEventWithVerses(TargetType.TIMELINE_EVENT, 5, 10);
        saveEventWithVerses(TargetType.TIMELINE_EVENT, 1, 4);
        saveEventWithVerses(TargetType.TIMELINE_EVENT, 11, 13);

        // ensure we return the references that we've set up
        when(this.jsword.getPassageReferences(anyString(), any(TargetType.class), anyString())).thenReturn(
                testReferences);

        final TimelineEventsAndDate eventsForPassage = this.ts.getEventsFromScripture("");

        // check that we have our 1 event back
        assertEquals(1, eventsForPassage.getEvents().size());
    }

    /**
     * tests looking up scripture from a reference
     */
    @Test
    public void testGetEventsFromScriptureNotOtherTypes() {
        final List<ScriptureReference> testReferences = saveEventWithVerses(TargetType.GEO_PLACE, 5, 10);

        // ensure we return the references that we've set up
        when(this.jsword.getPassageReferences(anyString(), any(TargetType.class), anyString())).thenReturn(
                testReferences);

        final TimelineEventsAndDate eventsForPassage = this.ts.getEventsFromScripture("");

        // check that we have our no events
        assertEquals(0, eventsForPassage.getEvents().size());
    }

    /**
     * tests that the syntax of the query is correct
     */
    @Test
    public void testGetEventsInPeriodInRangePointInTime() {
        final TimelineEvent inRange = createEventAndPersist(1000, "A");
        final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(0),
                new LocalDateTime(2000));

        LOG.debug("Event 1: [{}]", timelineEvents.get(0).getSummary());

        assertEquals(timelineEvents.size(), 1);
        assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    }

    /**
     * tests that out of range events before/after do not get retrieved
     */
    @Test
    public void testGetEventsInPeriodOutOfRangePointInTime() {
        createEventAndPersist(1000, "A");
        createEventAndPersist(2001, "B");
        final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1001),
                new LocalDateTime(2000));

        assertEquals(timelineEvents.size(), 0);
    }

    /**
     * tests that out of range events before/after do not get retrieved
     */
    @Test
    public void testGetEventsInPeriodOverlapStartDuration() {
        final TimelineEvent inRange = createEvent(500, 1100, "A");
        final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
                new LocalDateTime(2000));

        assertEquals(timelineEvents.size(), 1);
        assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    }

    /**
     * tests that out of range events before/after do not get retrieved
     */
    @Test
    public void testGetEventsInPeriodOverlapEndDuration() {
        final TimelineEvent inRange = createEvent(1500, 2100, "A");
        final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
                new LocalDateTime(2000));

        assertEquals(timelineEvents.size(), 1);
        assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    }

    /**
     * tests that out of range events before/after do not get retrieved
     */
    @Test
    public void testGetEventsInPeriodContainedDuration() {
        final TimelineEvent inRange = createEvent(1500, 1700, "A");
        final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
                new LocalDateTime(2000));

        assertEquals(timelineEvents.size(), 1);
        assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    }

    /**
     * tests that out of range events before/after do not get retrieved
     */
    @Test
    public void testGetEventsInPeriodOverflowDuration() {
        final TimelineEvent inRange = createEvent(200, 2100, "A");
        final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
                new LocalDateTime(2000));

        assertEquals(timelineEvents.size(), 1);
        assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    }

    /**
     * tests that out of range events before/after do not get retrieved
     */
    @Test
    public void testGetEventsOutOfRangeDuration() {
        createEvent(200, 700, "A");
        createEvent(2200, 2700, "B");
        final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
                new LocalDateTime(2000));

        assertEquals(timelineEvents.size(), 0);

    }

    /**
     * creates a duration event
     * 
     * @param startTime start of event
     * @param endTime end of event
     * @param summary summary of event
     * @return a single timeline event
     */
    private TimelineEvent createEvent(final int startTime, final int endTime, final String summary) {
        final TimelineEvent te = createEvent(startTime, summary);
        te.setToDate(new LocalDateTime(endTime));
        getEbean().save(te);
        return te;
    }

    /**
     * a helper method to create an event
     * 
     * @param startTime the time of creation
     * @param summary the summary
     * @return the event that was creates and persisted
     */
    private TimelineEvent createEventAndPersist(final int startTime, final String summary) {
        final TimelineEvent te = createEvent(startTime, summary);
        getEbean().save(te);
        return te;
    }

    /**
     * creates the event without persisting
     * 
     * @param startTime the start time of the event
     * @param summary the summary
     * @return the event created
     */
    private TimelineEvent createEvent(final int startTime, final String summary) {
        final TimelineEvent te = new TimelineEvent();
        te.setFromDate(new LocalDateTime(startTime));
        te.setSummary(summary);
        return te;
    }

    /**
     * returns a list of scripture references, containing 1 reference
     * 
     * @param targetType the type of scripture reference
     * @param start the start
     * @param end the end
     * @return the list containing the one element required
     */
    private List<ScriptureReference> getListScriptureReferences(final TargetType targetType, final int start,
            final int end) {
        final List<ScriptureReference> testReferences = new ArrayList<ScriptureReference>();

        final ScriptureReference sr = new ScriptureReference();
        sr.setStartVerseId(start);
        sr.setEndVerseId(end);
        sr.setTargetType(targetType);
        testReferences.add(sr);
        return testReferences;
    }

    /**
     * creates an event with a particular list of references
     * 
     * @param target the type of event
     * @param start the verse start
     * @param end the verse end
     * @return a timeline event
     */
    private List<ScriptureReference> saveEventWithVerses(final TargetType target, final int start,
            final int end) {
        // set up an event with references
        final List<ScriptureReference> testReferences = getListScriptureReferences(target, start, end);

        final TimelineEvent event = createEvent(100, "Some event");
        event.setReferences(testReferences);
        getEbean().save(event);

        return testReferences;
    }

}
