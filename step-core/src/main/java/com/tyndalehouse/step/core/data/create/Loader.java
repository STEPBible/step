package com.tyndalehouse.step.core.data.create;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;

/**
 * The object that will be responsible for loading all the data into a database
 * 
 * @author Chris
 * 
 */
public class Loader {
    private static final Logger LOG = LoggerFactory.getLogger(Loader.class);
    private final TimelineModuleLoader timelineModuleLoader;
    private final EbeanServer ebean;
    private final GeographyModuleLoader geoModuleLoader;
    private final HotSpotModuleLoader hotSpotModuleLoader;

    /**
     * The loader is given a connection source to load the data
     * 
     * @param timelineModuleLoader loader that loads the timeline module
     * @param geoModuleLoader the loader for geography data
     * @param hotSpotModuleLoader loads the hotspots for the timeline
     * @param ebean the persistence server
     */
    @Inject
    public Loader(final EbeanServer ebean, final TimelineModuleLoader timelineModuleLoader,
            final GeographyModuleLoader geoModuleLoader, final HotSpotModuleLoader hotSpotModuleLoader) {
        this.ebean = ebean;
        this.timelineModuleLoader = timelineModuleLoader;
        this.geoModuleLoader = geoModuleLoader;
        this.hotSpotModuleLoader = hotSpotModuleLoader;
    }

    /**
     * Creates the table and loads the initial data set
     */
    public void init() {
        loadData();
    }

    /**
     * Loads the data into the database
     */
    private void loadData() {
        LOG.debug("Loading initial data");
        this.ebean.beginTransaction();

        try {
            this.hotSpotModuleLoader.init();
            this.timelineModuleLoader.init();
            this.geoModuleLoader.init();
            // this.peopleLoader.init();
            this.ebean.commitTransaction();
        } finally {
            this.ebean.endTransaction();
        }
    }
}
