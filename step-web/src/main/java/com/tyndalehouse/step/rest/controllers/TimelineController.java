package com.tyndalehouse.step.rest.controllers;

import java.util.List;

import org.joda.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.HotSpot;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.data.entities.aggregations.TimelineEventsAndDate;
import com.tyndalehouse.step.core.service.TimelineService;
import com.tyndalehouse.step.models.UserInterfaceTranslator;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;
import com.tyndalehouse.step.rest.framework.Cacheable;

/**
 * The timeline controller retrieves information about past events
 * 
 * @author Chris
 * 
 */
@Singleton
public class TimelineController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TimelineController.class);
    private final TimelineService timelineService;
    private final UserInterfaceTranslator<TimelineEvent, DigestableTimeline> translator;

    /**
     * The timeline controller relies on the timeline service to retrieve the data
     * 
     * @param timelineService the service
     * @param translator a service enabling the translation of the model into a chewable version for the UI
     */
    @Inject
    public TimelineController(final TimelineService timelineService,
            final UserInterfaceTranslator<TimelineEvent, DigestableTimeline> translator) {
        this.timelineService = timelineService;
        this.translator = translator;
    }

    /**
     * Retrieves events based on a biblical reference. This method also needs to return an origin and a scale
     * for the timeline to be displayed properly as it might well be that the UI has carried out a different
     * search
     * 
     * @param bibleReference the bible reference that might have a set of events related to it
     * @return a list of events to be shown on a timeline, including the origin of the timeline and the scale
     *         of the timeline
     */
    @Cacheable(true)
    public DigestableTimeline getEventsFromReference(final String bibleReference) {
        final TimelineEventsAndDate eventsFromScripture = this.timelineService
                .getEventsFromScripture(bibleReference);
        return this.translator.toDigestableForm(eventsFromScripture.getEvents(),
                eventsFromScripture.getDateTime());

    }

    /**
     * returns a list of events that fall within the time period
     * 
     * @param from the from date, left-bound
     * @param to the to date, right-bound
     * @return a list of timeline events in format digestable by the UI
     * 
     *         TODO going to have to cache this more appropriately, as we'll otherwise hammer the database
     */
    @Cacheable(true)
    public DigestableTimeline getEventsInPeriod(final String from, final String to) {
        return this.translator.toDigestableForm(this.timelineService.getTimelineEvents(
                convertJavascriptDate(from), convertJavascriptDate(to)), null);
    }

    /**
     * Converts a java script date, which at the moment, just seems to have an extra Z on the end
     * 
     * @param javascriptDate the date
     * @return the local date time
     */
    private LocalDateTime convertJavascriptDate(final String javascriptDate) {
        return LocalDateTime.parse(javascriptDate.substring(0, javascriptDate.length() - 1));
    }

    /**
     * Retrieves the timebands that will be used to configure the timeline component
     * 
     * @return the timebands
     */
    @Cacheable(true)
    public List<HotSpot> getTimelineConfiguration() {
        return this.timelineService.getTimelineConfiguration();
    }
}
