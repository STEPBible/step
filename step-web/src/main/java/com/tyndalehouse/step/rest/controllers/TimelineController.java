package com.tyndalehouse.step.rest.controllers;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.entities.aggregations.TimelineEventsAndDate;
import com.tyndalehouse.step.core.models.EnhancedTimelineEvent;
import com.tyndalehouse.step.core.service.TimelineService;
import com.tyndalehouse.step.models.TimelineTranslator;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;
import com.tyndalehouse.step.models.timeline.simile.EnhancedSimileEvent;
import com.tyndalehouse.step.models.timeline.simile.SimileEvent;
import org.joda.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.CONTROLLER_INITIALISATION_ERROR;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

/**
 * The timeline controller retrieves information about past events
 */
@Singleton
public class TimelineController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TimelineController.class);
    private final TimelineService timelineService;
    private final TimelineTranslator translator;

    /**
     * The timeline controller relies on the timeline service to retrieve the data
     *
     * @param timelineService the service
     * @param translator      a service enabling the translation of the model into a chewable version for the UI
     */
    @Inject
    public TimelineController(final TimelineService timelineService, final TimelineTranslator translator) {
        notNull(timelineService, "Timeline service was null", CONTROLLER_INITIALISATION_ERROR);
        notNull(translator, "Translator was null", CONTROLLER_INITIALISATION_ERROR);
        this.timelineService = timelineService;
        this.translator = translator;
    }

    /**
     * Retrieves events based on a biblical reference. This method also needs to return an origin and a scale for the
     * timeline to be displayed properly as it might well be that the UI has carried out a different search
     *
     * @param bibleReference the bible reference that might have a set of events related to it
     * @return a list of events to be shown on a timeline, including the origin of the timeline and the scale of the
     * timeline
     */
    public DigestableTimeline getEventsFromReference(final String bibleReference) {
        LOGGER.debug("Getting events for scripture [{}]", bibleReference);

        final TimelineEventsAndDate eventsFromScripture = this.timelineService
                .getEventsFromScripture(bibleReference);
        return this.translator.toDigestableForm(eventsFromScripture.getEvents(),
                eventsFromScripture.getDateTime());

    }

    /**
     * Retrieves all the information available for a particular timeline event
     *
     * @param eventId the event id identifying a particular timeline event in the database
     * @param version the version that is currently being looked at by the user so that we can lookup verses in the
     *                correct version
     * @return all the information available for a particular timeline
     */
    public EnhancedSimileEvent getEventInformation(final String eventId, final String version) {
        final EnhancedTimelineEvent timelineEvent = this.timelineService.getTimelineEvent(eventId, version);

        final SimileEvent se = this.translator.translateEvent(timelineEvent.getEvent());
        final EnhancedSimileEvent ese = new EnhancedSimileEvent();
        ese.setEvent(se);
        ese.setVerses(timelineEvent.getVerses());

        return ese;
    }

    /**
     * returns a list of events that fall within the time period
     *
     * @param from the from date, left-bound
     * @param to   the to date, right-bound
     * @return a list of timeline events in format digestable by the UI
     * <p/>
     * TODO going to have to cache this more appropriately, as we'll otherwise hammer the database
     */
    public List<DigestableTimeline> getEventsInPeriod(final String from, final String to) {
        LOGGER.debug("Getting events between [{}] and [{}]", from, to);

        List<DigestableTimeline> timelines = new ArrayList<>();
        timelines.add(this.translator.toDigestableForm(this.timelineService.getTimelineEvents(
                convertJavascriptDate(from), convertJavascriptDate(to)), null));
        return timelines;
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
    public EntityDoc[] getTimelineConfiguration() {
        LOGGER.debug("Returning timeline configuration");
        return this.timelineService.getTimelineConfiguration();
    }
}
