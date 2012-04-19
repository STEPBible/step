package com.tyndalehouse.step.models.timeline.simile;

import java.util.ArrayList;
import java.util.List;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.models.UserInterfaceTranslator;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;

/**
 * provides a way of
 * 
 * @author Chris
 * 
 */
public class SimileTimelineTranslatorImpl implements
        UserInterfaceTranslator<TimelineEvent, DigestableTimeline> {
    private static final String SIMILE_DEFAULT_TIME_FORMAT = "iso8601";

    @Override
    public DigestableTimeline toDigestableForm(final List<TimelineEvent> events,
            final LocalDateTime suggestedDate) {
        final SimileTimelineImpl timeline = new SimileTimelineImpl();

        timeline.setDateTimeFormat(SIMILE_DEFAULT_TIME_FORMAT);

        final List<SimileEvent> eventList = new ArrayList<SimileEvent>();
        for (final TimelineEvent te : events) {
            final SimileEvent e = new SimileEvent();
            e.setTitle(te.getSummary());
            e.setDescription(te.getSummary());
            e.setStart(te.getFromDate().toString());
            e.setEventId(te.getId());

            if (te.getHotSpot() != null) {
                e.setHotSpotId(te.getHotSpot().getId());
            }

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

        if (suggestedDate != null) {
            timeline.setSuggestedDate(suggestedDate.toString());
        }
        return timeline;
    }
}
