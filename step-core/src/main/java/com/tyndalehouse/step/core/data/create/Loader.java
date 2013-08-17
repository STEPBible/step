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
package com.tyndalehouse.step.core.data.create;

import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.AppManagerService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.common.progress.JobManager;
import org.crosswire.common.progress.WorkEvent;
import org.crosswire.common.progress.WorkListener;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.ProvisionException;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.loaders.GeoStreamingCsvModuleLoader;
import com.tyndalehouse.step.core.data.loaders.StreamingCsvModuleLoader;
import com.tyndalehouse.step.core.data.loaders.TimelineStreamingCsvModuleLoader;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * The object that will be responsible for loading all the data into Lucene and downloading key versions of
 * the Bible.
 * <p/>
 * Note, this object is not thread-safe.
 *
 * @author chrisburrell
 */
public class Loader {
    private static final int INSTALL_WAITING = 1000;
    private static final Logger LOGGER = LoggerFactory.getLogger(Loader.class);
    private final JSwordPassageService jsword;
    private final Properties coreProperties;
    private final JSwordModuleService jswordModule;
    private final EntityManager entityManager;

    private final BlockingQueue<String> progress = new LinkedBlockingQueue<String>();
    private final Set<String> appSpecificModules = new HashSet<String>();
    private boolean complete = false;
    private final Provider<ClientSession> clientSessionProvider;
    private String runningAppVersion;
    private AppManagerService appManager;
    private WorkListener workListener;

    /**
     * The loader is given a connection source to load the data.
     *
     * @param jsword                the jsword service
     * @param jswordModule          the service helping with installation of jsword modules
     * @param coreProperties        the step core properties
     * @param entityManager         the entity manager
     * @param clientSessionProvider the client session provider
     */
    @Inject
    public Loader(final JSwordPassageService jsword, final JSwordModuleService jswordModule,
                  @Named("StepCoreProperties") final Properties coreProperties, final EntityManager entityManager,
                  final Provider<ClientSession> clientSessionProvider,
                  AppManagerService appManager
    ) {
        this.jsword = jsword;
        this.jswordModule = jswordModule;
        this.coreProperties = coreProperties;
        this.entityManager = entityManager;
        this.clientSessionProvider = clientSessionProvider;
        this.runningAppVersion = coreProperties.getProperty(AppManagerService.APP_VERSION);
        this.appManager = appManager;
        String[] specificModules = StringUtils.split(coreProperties.getProperty("app.install.specific.modules"), ",");
        for (String module : specificModules) {
            this.appSpecificModules.add(module);
        }
    }

    /**
     * Creates the table and loads the initial data set
     */
    public void init() {
        // remove any internet loader, because we are running locally first...
        // THIS LINE IS ABSOLUTELY CRITICAL AS IT DISABLES HTTP INSTALLER ON AN APPLICATION-WIDE LEVEL
        listenInJobs();

        try {
            if (!Boolean.getBoolean("step.skipBookInstallation")) {
                this.jswordModule.setOffline(true);

                // attempt to reload the installer list. This ensures we have all the versions in the available bibles
                // that we need
                this.jswordModule.reloadInstallers();

                final List<Book> availableModules = this.jswordModule.getAllModules(BookCategory.BIBLE,
                        BookCategory.COMMENTARY);
                final String[] initials = new String[availableModules.size()];

                // This may put too much stress on smaller systems, since indexing for all modules in
                // package
                // would result as happening at the same times
                for (int ii = 0; ii < availableModules.size(); ii++) {
                    final Book b = availableModules.get(ii);
                    installAndIndex(b.getInitials());
                    initials[ii] = b.getInitials();
                }

                this.jswordModule.waitForIndexes(initials);
            }
            // now we can load the data
            loadData();
            this.complete = true;
            appManager.setAndSaveAppVersion(runningAppVersion);
        } catch (Exception ex) {
            //wrap it into an internal exception so that we get some logging.
            throw new StepInternalException(ex.getMessage(), ex);
        } finally {
            if (workListener != null) {
                JobManager.removeWorkListener(workListener);
            }
            this.jswordModule.setOffline(false);
        }
    }

    private void listenInJobs() {
        workListener = new WorkListener() {
            @Override
            public void workProgressed(final WorkEvent ev) {
                Loader.this.progress.offer(String.format("%s (%s%%)", ev.getJob().getJobName(), ev.getJob().getWork()));
            }

            @Override
            public void workStateChanged(final WorkEvent ev) {
                Loader.this.progress.offer(String.format("%s (%d%%)", ev.getJob().getJobName(), ev.getJob().getWork()));
            }
        };
        JobManager.addWorkListener(workListener);
    }

    /**
     * Installs a module and kicks of indexing thereof in the background
     *
     * @param version the initials of the module to be installed
     */
    private void installAndIndex(final String version) {
        syncInstall(version);
        this.addUpdate("install_making_version_searchable", version);
        this.jswordModule.reIndex(version);
    }

    /**
     * Installs a module and waits for it to be properly installed.
     *
     * @param version the initials of the version to be installed
     */
    private void syncInstall(final String version) {
        uninstallSpecificPackages(version);

        if (this.jswordModule.isInstalled(version)) {
            return;
        }

        this.addUpdate("installing_version_local", version);
        this.jswordModule.installBook(version);

        // very ugly, but as good as it's going to get for now
        double installProgress = 0;
        this.addUpdate("installed_version_success", version);
    }

    /**
     * If the module is marked as required for re-installation, then we delete it here.
     *
     * @param version version
     */
    private void uninstallSpecificPackages(final String version) {
        if (this.appSpecificModules.contains(version)) {
            if (this.jswordModule.isInstalled(version)) {
                this.jswordModule.removeModule(version);
            }
        }
    }

    /**
     * Loads the data into the database
     */
    private void loadData() {
        LOGGER.info("Loading initial data");
        loadNave();
        loadLexiconDefinitions();
        loadSpecificForms();
        loadRobinsonMorphology();
        loadVersionInformation();
        loadAlternativeTranslations();
        // loadOpenBibleGeography();

        // loadHotSpots();
        // loadTimeline();
        LOGGER.info("Finished loading...");
    }

    /**
     * loads the alternative translation data.
     *
     * @return the number of entries that have been loaded
     */
    int loadAlternativeTranslations() {
        LOGGER.debug("Indexing Alternative versions");
        this.addUpdate("install_alternative_meanings");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("alternativeTranslations");

        final HeadwordLineBasedLoader loader = new HeadwordLineBasedLoader(writer,
                this.coreProperties.getProperty("test.data.path.alternatives.translations"));
        loader.init(this);

        LOGGER.debug("Writing Alternative Versions index");
        final int close = writer.close();
        LOGGER.debug("Writing Alternative Versions index");

        this.addUpdate("install_alternative_meanings_complete", close);
        return close;
    }

    /**
     * Loads the nave module
     *
     * @return the nave module
     */
    int loadNave() {
        LOGGER.debug("Indexing nave subjects");
        this.addUpdate("install_subject_search");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("nave");

        final HeadwordLineBasedLoader loader = new HeadwordLineBasedLoader(writer,
                this.coreProperties.getProperty("test.data.path.subjects.nave"));
        loader.init(this);

        LOGGER.debug("Writing Nave index");
        final int close = writer.close();
        LOGGER.debug("End Nave");

        this.addUpdate("install_subject_search_complete", close);
        return close;
    }

    /**
     * loads all hotspots
     *
     * @return number of records loaded
     */
    int loadHotSpots() {
        this.addUpdate("install_timeline_periods");

        LOGGER.debug("Loading hotspots");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("hotspot");
        new StreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.timeline.hotspots")).init(this);
        return writer.close();
    }

    /**
     * Loads all of robinson's morphological data
     *
     * @return the number of entries
     */
    int loadRobinsonMorphology() {
        this.addUpdate("install_grammar");

        LOGGER.debug("Loading robinson morphology");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("morphology");
        new StreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.morphology.robinson")).init(this);

        final int total = writer.close();
        LOGGER.debug("End of morphology");

        this.addUpdate("install_grammar_complete", total);

        return total;
    }

    /**
     * Loads Tyndale's version information
     *
     * @return the number of records loaded
     */
    int loadVersionInformation() {
        this.addUpdate("install_descriptions");

        LOGGER.debug("Loading version information");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("versionInfo");
        new StreamingCsvModuleLoader(writer, this.coreProperties.getProperty("test.data.path.versions.info"))
                .init(this);
        final int close = writer.close();

        this.addUpdate("install_descriptions_complete", close);
        return close;

    }

    /**
     * loads the timeline events
     *
     * @return number of records loaded
     */
    int loadTimeline() {
        this.addUpdate("install_timeline");

        LOGGER.debug("Loading timeline");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("timelineEvent");

        new TimelineStreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.timeline.events.directory"), this.jsword)
                .init(this);
        final int close = writer.close();

        this.addUpdate("intall_timeline_complete", close);

        return close;
    }

    /**
     * loads the open bible geography data
     *
     * @return the number of records loaded
     */
    int loadOpenBibleGeography() {
        this.addUpdate("install_maps");

        LOGGER.debug("Loading Open Bible geography");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("obplace");
        new GeoStreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.geography.openbible"), this.jsword)
                .init(this);

        final int close = writer.close();

        this.addUpdate("install_maps_complete", close);
        return close;
    }

    /**
     * Loads lexicon definitions
     *
     * @return the number of entries loaded
     */
    int loadLexiconDefinitions() {
        this.addUpdate("install_hebrew_definitions");

        LOGGER.debug("Indexing lexicon");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("definition");

        LOGGER.debug("-Indexing greek");
        this.addUpdate("install_greek_definitions");
        HeadwordLineBasedLoader lexiconLoader = new HeadwordLineBasedLoader(writer,
                this.coreProperties.getProperty("test.data.path.lexicon.definitions.greek"));
        lexiconLoader.init(this);

        LOGGER.debug("-Indexing hebrew");
        this.addUpdate("install_hebrew_definitions");
        final String hebrewLexicon = this.coreProperties
                .getProperty("test.data.path.lexicon.definitions.hebrew");
        if (hebrewLexicon != null) {
            lexiconLoader = new HeadwordLineBasedLoader(writer, hebrewLexicon);
        }
        lexiconLoader.init(this);

        this.addUpdate("install_optimizing_definitions");
        LOGGER.debug("-Writing index");
        final int close = writer.close();
        LOGGER.debug("End lexicon");

        this.addUpdate("install_definitions_finished", close);

        return close;
    }

    /**
     * loads all lexical forms for all words found in the Bible
     *
     * @return the number of forms loaded, ~200,000
     */
    int loadSpecificForms() {
        LOGGER.debug("Loading lexical forms");
        this.addUpdate("install_original_word_forms");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("specificForm");
        new SpecificFormsLoader(writer, this.coreProperties.getProperty("test.data.path.lexicon.forms"))
                .init(this);
        final int close = writer.close();

        this.addUpdate("install_original_word_forms_complete", close);
        return close;
    }

    /**
     * Reads the progress and empties the values therein
     *
     * @return the progress
     */
    public List<String> readOnceProgress() {
        final List<String> updates = new ArrayList<String>();
        this.progress.drainTo(updates);
        return updates;
    }

    /**
     * Adds the update.
     *
     * @param key  the key to the Setup resource bundle
     * @param args the args the arguments to use in the format
     */
    void addUpdate(final String key, final Object... args) {
        Locale locale;
        try {
            locale = this.clientSessionProvider.get().getLocale();
        } catch (final ProvisionException ex) {
            LOGGER.debug("Loader can't get client session");
            LOGGER.trace("Unable to provision", ex);
            locale = Locale.ENGLISH;
        }
        this.progress.offer(String.format(ResourceBundle.getBundle("SetupBundle", locale).getString(key),
                args));
    }

    /**
     * @return true if the process of installation is complete
     */
    public boolean isComplete() {
        return this.complete;
    }
}
