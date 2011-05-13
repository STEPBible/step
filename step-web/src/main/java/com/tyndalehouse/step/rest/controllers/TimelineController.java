package com.tyndalehouse.step.rest.controllers;

import java.util.Date;
import java.util.List;

import org.joda.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Timeband;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
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
     * a REST method to retrieve events between two dates The arrays match in index, and go by three
     * (timebandId, from, to), (timebandId, from, to), ...
     * 
     * @param timebandId the timeband ids
     * @param from the from dates
     * @param to the to dates
     * @return all versions of modules that are considered to be Bibles.
     *         <p />
     *         TODO: work out UK date format mappings
     */
    @Cacheable(true)
    public String getEvents(final String[] timebandId, final Date from, final Date to) {
        LOGGER.debug("Retrieving events between [{}] and [{}]", from, to);
        return timebandId[0];
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
    public String getEventsFromReference(final String bibleReference) {

        return null;
    }

    /**
     * returns a list of events that fall within the time period
     * 
     * @param from the from date, left-bound
     * @param to the to date, right-bound
     * @return a list of timeline events in format digestable by the UI
     */
    @Cacheable(true)
    public DigestableTimeline getEventsInPeriod(final String from, final String to) {
        // TODO enhance FrontController to accept basic types such as long
        final long f = Long.parseLong(from);
        final long t = Long.parseLong(to);

        return this.translator.toDigestableForm(this.timelineService.getTimelineEvents(new LocalDateTime(f),
                new LocalDateTime(t)));
    }

    /**
     * Retrieves the timebands that will be used to configure the timeline component
     * 
     * @return the timebands
     */
    @Cacheable(true)
    public List<Timeband> getTimelineConfiguration() {
        return this.timelineService.getTimelineConfiguration();
    }
}
