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

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import javax.inject.Inject;
import javax.inject.Named;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.loaders.GeoStreamingCsvModuleLoader;
import com.tyndalehouse.step.core.data.loaders.StreamingCsvModuleLoader;
import com.tyndalehouse.step.core.data.loaders.TimelineStreamingCsvModuleLoader;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * The object that will be responsible for loading all the data into Lucene and downloading key versions of
 * the Bible.
 * 
 * Note, this object is not thread-safe.
 * 
 * @author chrisburrell
 * 
 */
public class Loader {
    private static final int INSTALL_WAITING = 1000;
    private static final Logger LOGGER = LoggerFactory.getLogger(Loader.class);
    private final JSwordPassageService jsword;
    private final Properties coreProperties;
    private final JSwordModuleService jswordModule;
    private final EntityManager entityManager;

    private final BlockingQueue<String> progress = new LinkedBlockingQueue<String>();
    private boolean complete = false;

    /**
     * The loader is given a connection source to load the data
     * 
     * @param jsword the jsword service
     * @param jswordModule the service helping with installation of jsword modules
     * @param coreProperties the step core properties
     * @param entityManager the entity manager
     */
    @Inject
    public Loader(final JSwordPassageService jsword, final JSwordModuleService jswordModule,
            @Named("StepCoreProperties") final Properties coreProperties, final EntityManager entityManager) {
        this.jsword = jsword;
        this.jswordModule = jswordModule;
        this.coreProperties = coreProperties;
        this.entityManager = entityManager;
    }

    /**
     * Creates the table and loads the initial data set
     * 
     */
    public void init() {
        // remove any internet loader, because we are running locally first...
        // THIS LINE IS ABSOLUTELY CRITICAL AS IT DISABLES SOCKETS ON AN APPLICATION-WIDE LEVEL
        this.jswordModule.setOffline(true);

        // attempt to reload the installer list. This ensures we have all the versions in the available bibles
        // that we need
        this.jswordModule.reloadInstallers();

        final List<Book> availableModules = this.jswordModule.getAllModules(BookCategory.BIBLE,
                BookCategory.COMMENTARY);
        final String[] initials = new String[availableModules.size()];

        // TODO: revisit as this may put too much stress on smaller systems, since indexing for all modules in
        // package
        // would result as happening at the same times
        for (int ii = 0; ii < availableModules.size(); ii++) {
            final Book b = availableModules.get(ii);
            installAndIndex(b.getInitials());
            initials[ii] = b.getInitials();
        }

        this.jswordModule.waitForIndexes(initials);

        // now we can load the data
        loadData();
        this.jswordModule.setOffline(false);
        this.complete = true;
    }

    /**
     * Installs a module and kicks of indexing thereof in the background
     * 
     * @param version the initials of the module to be installed
     */
    private void installAndIndex(final String version) {
        syncInstall(version);
        this.addUpdate("Making the " + version + " searchable");
        this.jswordModule.index(version);
    }

    /**
     * Installs a module and waits for it to be properly installed.
     * 
     * @param version the initials of the version to be installed
     */
    private void syncInstall(final String version) {
        if (this.jswordModule.isInstalled(version)) {
            return;
        }

        this.progress.offer("Installing the " + version + " from the STEP application folder.");
        this.jswordModule.installBook(version);

        // very ugly, but as good as it's going to get for now
        double installProgress = 0;
        do {
            try {

                LOGGER.info("Waiting for KJV installation to finish...");
                Thread.sleep(INSTALL_WAITING);
            } catch (final InterruptedException e) {
                LOGGER.warn("Interrupted exception", e);
            }

            installProgress = this.jswordModule.getProgressOnInstallation(version);
            this.progress
                    .offer("Install progress of " + version + ": " + (int) (installProgress * 100) + "%");
        } while (installProgress != 1);

        this.progress.offer("The " + version + " has been installed.");
    }

    // /**
    // * installs core jsword modules
    // *
    // * @param coreModules a comma separated list of modules
    // */
    // private void loadDefaultJSwordModules(final String coreModules) {
    // final String[] modules = commaSeparate(coreModules);
    // boolean installerInfoRefreshed = false;
    //
    // for (final String m : modules) {
    // LOGGER.trace("Loading [{}]", m);
    //
    // if (!this.jswordModule.isInstalled(m)) {
    // if (!installerInfoRefreshed) {
    // LOGGER.trace("Reloading installers");
    // this.jswordModule.reloadInstallers();
    // installerInfoRefreshed = true;
    // }
    //
    // LOGGER.trace("Installing {} module", m);
    // this.jswordModule.installBook(m);
    // } else {
    // LOGGER.info("Book {} already installed", m);
    // }
    // }
    // }

    /**
     * Loads the data into the database
     */
    private void loadData() {
        LOGGER.debug("Loading initial data");
        loadNave();
        loadLexiconDefinitions();
        loadSpecificForms();
        loadRobinsonMorphology();
        loadVersionInformation();
        // loadOpenBibleGeography();

        // loadHotSpots();
        // loadTimeline();
        LOGGER.info("Finished loading...");
    }

    /**
     * Loads the nave module
     * 
     * @return the nave module
     */
    int loadNave() {
        LOGGER.debug("Indexing nave subjects");
        this.progress.offer("Installing data for Subject Searches");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("nave");

        final HeadwordLineBasedLoaded loader = new HeadwordLineBasedLoaded(writer,
                this.coreProperties.getProperty("test.data.path.subjects.nave"));
        loader.init(this);

        LOGGER.debug("Writing Nave index");
        final int close = writer.close();
        LOGGER.debug("End Nave");

        this.progress.offer("Subject searches are ready to use with " + close + " entries");
        return close;
    }

    /**
     * loads all hotspots
     * 
     * @return number of records loaded
     */
    int loadHotSpots() {
        this.progress.offer("Preparing timeline periods");

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
        this.progress.offer("Installation grammar data ");

        LOGGER.debug("Loading robinson morphology");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("morphology");
        new StreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.morphology.robinson")).init(this);

        final int total = writer.close();
        LOGGER.debug("End of morphology");

        this.progress.offer(total + " grammar definitions have been installed");

        return total;
    }

    /**
     * Loads Tyndale's version information
     * 
     * @return the number of records loaded
     */
    int loadVersionInformation() {
        this.progress.offer("Installing descriptions of Bible texts and commentaries");

        LOGGER.debug("Loading version information");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("versionInfo");
        new StreamingCsvModuleLoader(writer, this.coreProperties.getProperty("test.data.path.versions.info"))
                .init(this);
        final int close = writer.close();

        this.progress.offer(close + " descriptions of Bible texts and commentaries are now available");
        return close;

    }

    /**
     * loads the timeline events
     * 
     * @return number of records loaded
     */
    int loadTimeline() {
        this.progress.offer("Installing timeline events");

        LOGGER.debug("Loading timeline");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("timelineEvent");

        new TimelineStreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.timeline.events.directory"), this.jsword)
                .init(this);
        final int close = writer.close();

        this.progress.offer("Finished installing " + close + " timeline events");

        return close;
    }

    /**
     * loads the open bible geography data
     * 
     * @return the number of records loaded
     */
    int loadOpenBibleGeography() {
        this.progress.offer("Installing Open Bible data");

        LOGGER.debug("Loading Open Bible geography");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("obplace");
        new GeoStreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.geography.openbible"), this.jsword)
                .init(this);

        final int close = writer.close();

        this.progress.offer("Finished installing " + close + " places");
        return close;
    }

    /**
     * Loads lexicon definitions
     * 
     * @return the number of entries loaded
     */
    int loadLexiconDefinitions() {
        this.progress.offer("Adding Lexicon definitions.");

        LOGGER.debug("Indexing lexicon");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("definition");

        LOGGER.debug("-Indexing greek");
        this.progress.offer("Installing Greek definitions");
        HeadwordLineBasedLoaded lexiconLoader = new HeadwordLineBasedLoaded(writer,
                this.coreProperties.getProperty("test.data.path.lexicon.definitions.greek"));
        lexiconLoader.init(this);

        LOGGER.debug("-Indexing hebrew");
        this.progress.offer("Installing Hebrew definitions.");
        final String hebrewLexicon = this.coreProperties
                .getProperty("test.data.path.lexicon.definitions.hebrew");
        if (hebrewLexicon != null) {
            lexiconLoader = new HeadwordLineBasedLoaded(writer, hebrewLexicon);
        }
        lexiconLoader.init(this);

        this.progress.offer("Optimizing Greek and Hebrew definition lookups.");
        LOGGER.debug("-Writing index");
        final int close = writer.close();
        LOGGER.debug("End lexicon");

        this.progress.offer("Added " + close + " definitions to the lexicon.");

        return close;
    }

    /**
     * loads all lexical forms for all words found in the Bible
     * 
     * @return the number of forms loaded, ~200,000
     */
    int loadSpecificForms() {
        LOGGER.debug("Loading lexical forms");
        this.progress.offer("Adding data for Original Word Search");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("specificForm");
        new SpecificFormsLoader(writer, this.coreProperties.getProperty("test.data.path.lexicon.forms"))
                .init(this);
        final int close = writer.close();

        this.progress.offer("Finished installing " + close + " forms of the original words.");
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
     * @param update the update to be added to the queue
     */
    void addUpdate(final String update) {
        this.progress.offer(update);
    }

    /**
     * @return true if the process of installation is complete
     */
    public boolean isComplete() {
        return this.complete;
    }
}
