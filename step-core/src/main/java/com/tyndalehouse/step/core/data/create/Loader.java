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

import java.util.Properties;

import javax.inject.Inject;
import javax.inject.Named;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.loaders.GeoStreamingCsvModuleLoader;
import com.tyndalehouse.step.core.data.loaders.StreamingCsvModuleLoader;
import com.tyndalehouse.step.core.data.loaders.TimelineStreamingCsvModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * The object that will be responsible for loading all the data into a database
 * 
 * @author chrisburrell
 * 
 */
public class Loader {
    private static final int INSTALL_WAITING = 1000;
    private static final int INSTALL_MAX_WAITING = INSTALL_WAITING * 180;
    private static final String KJV = "KJV";
    private static final Logger LOGGER = LoggerFactory.getLogger(Loader.class);
    private final JSwordPassageService jsword;
    private final Properties coreProperties;
    private final JSwordModuleService jswordModule;
    private final EntityManager entityManager;

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
     */
    public void init() {
        // in order to do this, we need some jsword modules available. - we assume someone has kicked off
        // the
        // process
        // kick of installation of jsword modules
        // checkAndWaitForKJV();

        // now we can load the data
        loadData();
    }

    /**
     * All modules are based on this version
     */
    private void checkAndWaitForKJV() {
        int waitTime = INSTALL_MAX_WAITING;

        // very ugly, but as good as it's going to get for now
        while (waitTime > 0 && !this.jswordModule.isInstalled(KJV)) {
            try {
                LOGGER.debug("Waiting for KJV installation to finish...");
                waitTime -= INSTALL_WAITING;
                Thread.sleep(INSTALL_WAITING);
            } catch (final InterruptedException e) {
                LOGGER.warn("Interrupted exception", e);
            }
        }

        if (waitTime <= 0) {
            throw new StepInternalException("KJV module was not installed in time");
        }
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

        loadLexiconDefinitions();
        loadSpecificForms();
        loadRobinsonMorphology();
        loadVersionInformation();
        loadOpenBibleGeography();

        loadHotSpots();
        loadTimeline();
        LOGGER.info("Finished loading...");
    }

    /**
     * loads all hotspots
     * 
     * @return number of records loaded
     */
    int loadHotSpots() {
        LOGGER.debug("Loading hotspots");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("hotspot");
        new StreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.timeline.hotspots")).init();
        return writer.close();
    }

    /**
     * Loads all of robinson's morphological data
     * 
     * @return the number of entries
     */
    int loadRobinsonMorphology() {
        LOGGER.debug("Loading robinson morphology");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("morphology");
        new StreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.morphology.robinson")).init();

        final int total = writer.close();
        LOGGER.debug("End of morphology");
        return total;
    }

    /**
     * Loads Tyndale's version information
     * 
     * @return the number of records loaded
     */
    int loadVersionInformation() {
        LOGGER.debug("Loading version information");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("versionInfo");
        new StreamingCsvModuleLoader(writer, this.coreProperties.getProperty("test.data.path.versions.info"))
                .init();
        return writer.close();

    }

    /**
     * loads the timeline events
     * 
     * @return number of records loaded
     */
    int loadTimeline() {
        LOGGER.debug("Loading timeline");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("timelineEvent");

        new TimelineStreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.timeline.events.directory"), this.jsword)
                .init();
        return writer.close();
    }

    /**
     * loads the open bible geography data
     * 
     * @return the number of records loaded
     */
    int loadOpenBibleGeography() {
        LOGGER.debug("Loading Open Bible geography");

        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("obplace");
        new GeoStreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.geography.openbible"), this.jsword).init();
        return writer.close();
    }

    /**
     * Loads lexicon definitions
     * 
     * @return the number of entries loaded
     */
    int loadLexiconDefinitions() {
        LOGGER.debug("Indexing lexicon");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("definition");

        LOGGER.debug("-Indexing greek");
        LexiconLoader lexiconLoader = new LexiconLoader(writer,
                this.coreProperties.getProperty("test.data.path.lexicon.definitions.greek"));
        lexiconLoader.init();

        LOGGER.debug("-Indexing hebrew");
        final String hebrewLexicon = this.coreProperties
                .getProperty("test.data.path.lexicon.definitions.hebrew");
        if (hebrewLexicon != null) {
            lexiconLoader = new LexiconLoader(writer, hebrewLexicon);
        }
        lexiconLoader.init();

        LOGGER.debug("-Writing index");
        final int close = writer.close();
        LOGGER.debug("End lexicon");
        return close;

    }

    /**
     * loads all lexical forms for all words found in the Bible
     * 
     * @return the number of forms loaded, ~200,000
     */
    int loadSpecificForms() {
        LOGGER.debug("Loading lexical forms");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("specificForm");
        new SpecificFormsLoader(writer, this.coreProperties.getProperty("test.data.path.lexicon.forms"))
                .init();
        return writer.close();
    }
}
