package com.tyndalehouse.step.core.service.impl;

import java.util.List;

import com.avaje.ebean.Ebean;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Timeband;
import com.tyndalehouse.step.core.service.TimelineService;

/**
 * The implementation of the timeline service, based on JDBC and ORM Lite to access the database.
 * 
 * @author Chris
 */
@Singleton
public class TimelineServiceImpl implements TimelineService {
    // private final Loader loader;

    // /**
    // * Constructing a timeband dao
    // *
    // * @param timebandDao the data access object that can be used to access the timeband
    // */
    // @Inject
    // public TimelineServiceImpl(final TimebandDao timebandDao, final HotSpotDao hotSpotDao, final Loader
    // loader) {
    // // this.timebandDao = timebandDao;
    // // this.hotSpotDao = hotSpotDao;
    // this.loader = loader;
    // }

    @Override
    public List<Timeband> getTimelineConfiguration() {
        return Ebean.createQuery(Timeband.class).fetch("hotspots").findList();
    }
}
