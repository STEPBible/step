package com.tyndalehouse.step.core.data.create;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.Transaction;
import com.google.inject.Inject;

/**
 * The object that will be responsible for loading all the data into a database
 * 
 * @author Chris
 * 
 */
public class Loader {
    private static final int BATCH_SIZE = 10000;
    private static final Logger LOG = LoggerFactory.getLogger(Loader.class);
    private final TimelineModuleLoader timelineModuleLoader;
    private final EbeanServer ebean;
    private final GeographyModuleLoader geoModuleLoader;

    /**
     * The loader is given a connection source to load the data
     * 
     * @param timelineModuleLoader loader that loads the timeline module
     * @param geoModuleLoader the loader for geography data
     * @param ebean the persistence server
     */
    @Inject
    public Loader(final EbeanServer ebean, final TimelineModuleLoader timelineModuleLoader,
            final GeographyModuleLoader geoModuleLoader) {
        this.ebean = ebean;
        this.timelineModuleLoader = timelineModuleLoader;
        this.geoModuleLoader = geoModuleLoader;
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
        final Transaction transaction = this.ebean.beginTransaction();
        try {
            // transaction.setBatchMode(true);
            // transaction.setBatchSize(BATCH_SIZE);
            // transaction.setReadOnly(false);

            // set up a list of scripture references that can be populated as we populate the database
            // final List<ScriptureReference> scriptureReferences = new ArrayList<ScriptureReference>();

            // TODO deduplicate? so that we have many-1 mapping?
            this.timelineModuleLoader.init();
            this.geoModuleLoader.init();

            // this.ebean.save(scriptureReferences);
            this.ebean.commitTransaction();
        } finally {
            this.ebean.endTransaction();
        }
    }
}
