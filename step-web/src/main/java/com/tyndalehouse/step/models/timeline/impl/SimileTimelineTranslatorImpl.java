package com.tyndalehouse.step.models.timeline.impl;

import java.util.ArrayList;
import java.util.List;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;
import com.tyndalehouse.step.models.timeline.TimelineTranslator;

/**
 * provides a way of
 * 
 * @author Chris
 * 
 */
public class SimileTimelineTranslatorImpl implements TimelineTranslator {
    private static final String SIMILE_DEFAULT_TIME_FORMAT = "iso8601";

    @Override
    public DigestableTimeline toDigestableTimeline(final List<TimelineEvent> events) {
        final SimileTimelineImpl timeline = new SimileTimelineImpl();

        timeline.setDateTimeFormat(SIMILE_DEFAULT_TIME_FORMAT);

        final List<SimileEvent> eventList = new ArrayList<SimileEvent>();
        for (final TimelineEvent te : events) {
            final SimileEvent e = new SimileEvent();
            e.setTitle(te.getSummary());
            e.setDescription(te.getSummary());
            e.setStart(te.getFromDate().toString());

            final LocalDateTime toDate = te.getToDate();
            if (toDate != null) {
                e.setEnd(te.getToDate().toString());
                e.setDuration(true);
            } else {
                e.setDuration(false);
            }

            eventList.add(e);
        }

        timeline.setEvents(eventList);
        return timeline;
    }
}
