package com.tyndalehouse.step.core.service.impl;

import java.util.List;

import org.joda.time.LocalDateTime;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.Query;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Timeband;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.service.TimelineService;

/**
 * The implementation of the timeline service, based on JDBC and ORM Lite to access the database.
 * 
 * @author Chris
 */
@Singleton
public class TimelineServiceImpl implements TimelineService {
    private final EbeanServer ebean;

    /**
     * @param ebean the ebean server with which to lookup data
     */
    @Inject
    public TimelineServiceImpl(final EbeanServer ebean) {
        this.ebean = ebean;
    }

    @Override
    public List<Timeband> getTimelineConfiguration() {
        return this.ebean.createQuery(Timeband.class).fetch("hotspots").findList();
    }

    @Override
    public List<TimelineEvent> getTimelineEvents(final LocalDateTime from, final LocalDateTime to) {
        // fromDate < to and toDate > from is the standard coverage method where we find the overlapping
        // events
        // however "toDate" can be null, therefore we need to cater for that

        // which gives us
        // fromDate < to and ((toDate != null and toDate > from) or (toDate == null and fromDate > from ))

        // in other words the event starts before the requested period ends, but finishes after the end

        final String eventsQuery = "find timelineEvent where fromDate <= :to and "
                + "((toDate is not null and toDate >= :from) or (toDate is null and fromDate >= :from))";

        final Query<TimelineEvent> query = this.ebean.createQuery(TimelineEvent.class, eventsQuery);
        query.setParameter("from", from);
        query.setParameter("to", to);
        return query.findList();
    }
}
