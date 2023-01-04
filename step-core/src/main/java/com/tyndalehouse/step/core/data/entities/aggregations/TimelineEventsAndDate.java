package com.tyndalehouse.step.core.data.entities.aggregations;

import java.io.Serializable;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * A simple wrapper around a timeline set of events and a central date
 */
public class TimelineEventsAndDate implements Serializable {
    private static final long serialVersionUID = -7079914843690188557L;
    private EntityDoc[] events;
    private LocalDateTime dateTime;

    /**
     * @return the events
     */
    public EntityDoc[] getEvents() {
        return this.events;
    }

    /**
     * @param events the events to set
     */
    @SuppressWarnings("PMD")
    public void setEvents(final EntityDoc[] events) {
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
