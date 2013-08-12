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
package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.CONTROLLER_INITIALISATION_ERROR;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

import org.joda.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

/**
 * The timeline controller retrieves information about past events
 * 
 * @author chrisburrell
 * 
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
     * @param translator a service enabling the translation of the model into a chewable version for the UI
     */
    @Inject
    public TimelineController(final TimelineService timelineService, final TimelineTranslator translator) {
        notNull(timelineService, "Timeline service was null", CONTROLLER_INITIALISATION_ERROR);
        notNull(translator, "Translator was null", CONTROLLER_INITIALISATION_ERROR);
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
     * @param version the version that is currently being looked at by the user so that we can lookup verses
     *            in the correct version
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
     * @param to the to date, right-bound
     * @return a list of timeline events in format digestable by the UI
     * 
     *         TODO going to have to cache this more appropriately, as we'll otherwise hammer the database
     */
    public DigestableTimeline getEventsInPeriod(final String from, final String to) {
        LOGGER.debug("Getting events between [{}] and [{}]", from, to);

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
    public EntityDoc[] getTimelineConfiguration() {
        LOGGER.debug("Returning timeline configuration");
        return this.timelineService.getTimelineConfiguration();
    }
}
