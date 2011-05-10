package com.tyndalehouse.step.core.service;

import java.util.List;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.entities.Timeband;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;

/**
 * The timeline service gives access to all the data relating to the timeline the events, the configuration,
 * etc.
 * 
 * The timeline data is currently loaded from a CSV file and stored in the database
 * 
 * @author Chris
 * 
 */
public interface TimelineService {
    /**
     * Retrieves the whole configuration of the timeline. This defines a number of different bands, each with
     * their hotpots. Each timeband is given a suggested scale (or time unit - decade, century, month day),
     * etc. The hotspots also also given a unit.
     * 
     * @return a list of timebands with all the required details
     */
    List<Timeband> getTimelineConfiguration();

    /**
     * Returns events that fall within a certain time period
     * 
     * @param from from date
     * @param to to date
     * @return a list of timeline events contained between the two dates
     */
    List<TimelineEvent> getTimelineEvents(LocalDateTime from, LocalDateTime to);
}
