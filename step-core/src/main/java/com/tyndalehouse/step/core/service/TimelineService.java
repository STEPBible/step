package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.entities.aggregations.TimelineEventsAndDate;
import com.tyndalehouse.step.core.models.EnhancedTimelineEvent;
import org.joda.time.LocalDateTime;

/**
 * The timeline service gives access to all the data relating to the timeline the events, the configuration,
 * etc.
 * 
 * The timeline data is currently loaded from a CSV file and stored in the database
 */
public interface TimelineService {
    /**
     * Retrieves the whole configuration of the timeline. This defines a number of different bands, each with
     * their hotpots. Each timeband is given a suggested scale (or time unit - decade, century, month day),
     * etc. The hotspots also also given a unit.
     * 
     * @return a list of timebands with all the required details
     */
    EntityDoc[] getTimelineConfiguration();

    /**
     * Returns events that fall within a certain time period
     * 
     * @param from from date
     * @param to to date
     * @return a list of timeline events contained between the two dates
     */
    EntityDoc[] getTimelineEvents(LocalDateTime from, LocalDateTime to);

    /**
     * Given a reference to a passage, this looks up the relevant set of events
     * 
     * @param reference the reference to look up
     * @return a set of events and the date at which they occur
     */
    TimelineEventsAndDate getEventsFromScripture(String reference);

    /**
     * Returns all the required information about a timeline event
     * 
     * @param id the id of the event
     * @param version the version to use to lookup any associated verse numbers
     * @return the timeline event with all its data
     */
    EnhancedTimelineEvent getTimelineEvent(String id, String version);

    /**
     * @param reference reference of the scripture passage under consideration
     * @return the list of events matching that reference
     */
    EntityDoc[] lookupEventsMatchingReference(String reference);
}
