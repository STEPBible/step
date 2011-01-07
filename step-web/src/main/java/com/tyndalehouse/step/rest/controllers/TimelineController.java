package com.tyndalehouse.step.rest.controllers;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Singleton;

/**
 * The timeline controller retrieves information about past events
 * 
 * @author Chris
 * 
 */
@Singleton
public class TimelineController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TimelineController.class);

    /**
     * a REST method to retrieve events between two dates The arrays match in index, and go by three
     * (timebandId, from, to), (timebandId, from, to), ...
     * 
     * @param timebandId the timeband ids
     * @param from the from dates
     * @param to the to dates
     * @return all versions of modules that are considered to be Bibles. TODO work out UK date format mappings
     */
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
    public String getEventsFromReference(final String bibleReference) {

        return null;
    }
}
