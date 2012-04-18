package com.tyndalehouse.step.core.data.entities.aggregations;

import java.util.List;

import javax.persistence.Entity;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.entities.TimelineEvent;

/**
 * A simple wrapper around a timeline set of events and a central date
 * 
 * @author Chris
 * 
 */
@Entity
public class TimelineEventsAndDate {
    private List<TimelineEvent> events;
    private LocalDateTime dateTime;

    /**
     * @return the events
     */
    public List<TimelineEvent> getEvents() {
        return this.events;
    }

    /**
     * @param events the events to set
     */
    public void setEvents(final List<TimelineEvent> events) {
        this.events = events;
    }

    /**
     * @return the dateTime
     */
    public LocalDateTime getDateTime() {
        return this.dateTime;
    }

    /**
     * @param dateTime the dateTime to set
     */
    public void setDateTime(final LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }
}
