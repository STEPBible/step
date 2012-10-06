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

import static java.lang.String.format;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.inject.Inject;
import javax.inject.Named;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.bean.HeaderColumnNameTranslateMappingStrategy;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.create.loaders.CsvModuleLoader;
import com.tyndalehouse.step.core.data.create.loaders.CustomTranslationCsvModuleLoader;
import com.tyndalehouse.step.core.data.create.loaders.PostProcessingAction;
import com.tyndalehouse.step.core.data.create.loaders.translations.OpenBibleDataTranslation;
import com.tyndalehouse.step.core.data.create.loaders.translations.TimelineEventTranslation;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.VersionInfo;
import com.tyndalehouse.step.core.data.entities.morphology.Morphology;
import com.tyndalehouse.step.core.data.entities.timeline.HotSpot;
import com.tyndalehouse.step.core.data.entities.timeline.TimelineEvent;
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
    private static final String TRANS_IDX = "trans_idx";
    private static final String SPECIFIC_FORM_IDX = "spec_form_idx";
    private static final String DEF_IDX = "def_idx";
    private static final String TRANSLATION_TABLE = "translation";
    private static final String SPECIFIC_FORM_TABLE = "specific_form";
    private static final String DEFINITION_TABLE = "definition";
    private static final int INSTALL_WAITING = 1000;
    private static final int INSTALL_MAX_WAITING = INSTALL_WAITING * 180;
    private static final String INDEX_CREATE = "CREATE INDEX %s on %s (%s)";
    private static final String KJV = "KJV";
    private static final String[][] INDEXES = new String[][] {
            { DEF_IDX, DEFINITION_TABLE, "alternative_translit1" },
            { DEF_IDX, DEFINITION_TABLE, "alternative_translit1unaccented" },
            { DEF_IDX, DEFINITION_TABLE, "strong_translit" },
            { DEF_IDX, DEFINITION_TABLE, "strong_pronunc" },
            { DEF_IDX, DEFINITION_TABLE, "accented_unicode" },
            { DEF_IDX, DEFINITION_TABLE, "unaccented_unicode" },
            { DEF_IDX, DEFINITION_TABLE, "step_transliteration" },
            { DEF_IDX, DEFINITION_TABLE, "unaccented_step_transliteration" },
            { DEF_IDX, DEFINITION_TABLE, "step_gloss" }, { DEF_IDX, DEFINITION_TABLE, "blacklisted" },
            { SPECIFIC_FORM_IDX, SPECIFIC_FORM_TABLE, "raw_strong_number" },
            { SPECIFIC_FORM_IDX, SPECIFIC_FORM_TABLE, "raw_form" },
            { SPECIFIC_FORM_IDX, SPECIFIC_FORM_TABLE, "unaccented_form" },
            { SPECIFIC_FORM_IDX, SPECIFIC_FORM_TABLE, "transliteration" },
            { SPECIFIC_FORM_IDX, SPECIFIC_FORM_TABLE, "simplified_transliteration" },
            { TRANS_IDX, TRANSLATION_TABLE, "alternative_translation" } };

    private static final Logger LOGGER = LoggerFactory.getLogger(Loader.class);
    private final EbeanServer ebean;
    private final JSwordPassageService jsword;
    private final Properties coreProperties;
    private final JSwordModuleService jswordModule;
    private final LoaderTransaction transaction;

    /**
     * The loader is given a connection source to load the data
     * 
     * @param jsword the jsword service
     * @param jswordModule the service helping with installation of jsword modules
     * @param ebean the persistence server
     * @param coreProperties the step core properties
     */
    @Inject
    public Loader(final JSwordPassageService jsword, final JSwordModuleService jswordModule,
            final EbeanServer ebean, @Named("StepCoreProperties") final Properties coreProperties) {
        this.jsword = jsword;
        this.jswordModule = jswordModule;
        this.ebean = ebean;
        this.coreProperties = coreProperties;
        this.transaction = new LoaderTransaction(ebean, 1000);
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

        // set undo log
        try {
            this.ebean.createSqlUpdate("SET LOG 0").execute();
            this.ebean.createSqlUpdate("SET CACHE_SIZE 65536").execute();
            this.ebean.createSqlUpdate("SET LOCK_MODE 0").execute();
            this.ebean.createSqlUpdate("SET UNDO_LOG 0").execute();
            loadData();
        } finally {
            this.ebean.createSqlUpdate("SET LOG 1").execute();
            this.ebean.createSqlUpdate("SET CACHE_SIZE 65536").execute();
            this.ebean.createSqlUpdate("SET LOCK_MODE 1").execute();
            this.ebean.createSqlUpdate("SET UNDO_LOG 1").execute();
        }
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

    /**
     * Loads the data into the database
     */
    private void loadData() {
        LOGGER.debug("Loading initial data");

        this.transaction.openNewBatchTransaction();

        try {
            // loadVersionInformation();
            // loadHotSpots();
            // loadTimeline();
            // loadOpenBibleGeography();
            // loadDictionaryArticles();
            // loadRobinsonMorphology();
            loadLexiconDefinitions();
            // loadSpecificForms();
            // loadLexicon();
        } finally {
            LOGGER.info("Committing batch...");
            this.transaction.commitAndEnd();
        }

        LOGGER.debug("Creating indexes");
        createIndexes();
        LOGGER.debug("Finished loading data");
    }

    /**
     * Creates indexes on various tables
     */
    private void createIndexes() {
        // create some indexes manually:
        // indexName/table/column
        int i = 0;
        for (int ii = 0; ii < INDEXES.length; ii++) {
            this.ebean.createSqlUpdate(
                    format(INDEX_CREATE, INDEXES[ii][0] + (i++), INDEXES[ii][1], INDEXES[ii][2])).execute();
        }
    }

    /**
     * Loads Tyndale's version information
     * 
     * @return the number of records loaded
     */
    int loadVersionInformation() {
        try {
            LOGGER.debug("Loading version information");

            return new CsvModuleLoader<VersionInfo>(this.ebean,
                    this.coreProperties.getProperty("test.data.path.versions.info"), VersionInfo.class,
                    this.transaction).init();
        } finally {
            this.transaction.flushCommitAndContinue();

        }
    }

    /**
     * loads all hotspots
     * 
     * @return number of records loaded
     */
    int loadHotSpots() {
        try {
            LOGGER.debug("Loading hotspots");

            return new CsvModuleLoader<HotSpot>(this.ebean,
                    this.coreProperties.getProperty("test.data.path.timeline.hotspots"), HotSpot.class,
                    this.transaction).init();
        } finally {
            this.transaction.flushCommitAndContinue();

        }
    }

    /**
     * Loads all of robinson's morphological data
     * 
     * @return the number of entries
     */
    int loadRobinsonMorphology() {
        LOGGER.debug("Loading robinson morphology");
        final HeaderColumnNameTranslateMappingStrategy<Morphology> columnMapping = new HeaderColumnNameTranslateMappingStrategy<Morphology>();
        final Map<String, String> columnTranslations = getMorphologyTranslations();

        columnMapping.setColumnMapping(columnTranslations);
        columnMapping.setType(Morphology.class);

        try {
            return new CsvModuleLoader<Morphology>(this.ebean,
                    this.coreProperties.getProperty("test.data.path.morphology.robinson"), columnMapping,
                    new PostProcessingAction<Morphology>() {

                        @Override
                        public void postProcess(final Morphology entity) {
                            LOGGER.trace("Processing [{}]", entity.getCode());
                            sanitizeDefinitions(entity);

                            entity.initialise();
                        }
                    }, this.transaction).init();
        } finally {
            this.transaction.flushCommitAndContinue();
        }
    }

    /**
     * removes extra characters from entity before persisiting
     * 
     * @param entity the entity to be cleansed
     */
    protected void sanitizeDefinitions(final Morphology entity) {
        final String quote = "\"";
        final String empty = "";

        entity.setFunctionExplained(entity.getFunctionExplained().replaceAll(quote, empty));
        entity.setTenseExplained(entity.getTenseExplained().replaceAll(quote, empty));
        entity.setVoiceExplained(entity.getVoiceExplained().replaceAll(quote, empty));
        entity.setMoodExplained(entity.getMoodExplained().replaceAll(quote, empty));
        entity.setCaseExplained(entity.getCaseExplained().replaceAll(quote, empty));
        entity.setPersonExplained(entity.getPersonExplained().replaceAll(quote, empty));
        entity.setNumberExplained(entity.getNumberExplained().replaceAll(quote, empty));
        entity.setGenderExplained(entity.getGenderExplained().replaceAll(quote, empty));
        entity.setSuffixExplained(entity.getSuffixExplained().replaceAll(quote, empty));

        entity.setFunctionDescription(entity.getFunctionDescription().replaceAll(quote, empty));
        entity.setTenseDescription(entity.getTenseDescription().replaceAll(quote, empty));
        entity.setVoiceDescription(entity.getVoiceDescription().replaceAll(quote, empty));
        entity.setMoodDescription(entity.getMoodDescription().replaceAll(quote, empty));
        entity.setCaseDescription(entity.getCaseDescription().replaceAll(quote, empty));
        entity.setPersonDescription(entity.getPersonDescription().replaceAll(quote, empty));
        entity.setNumberDescription(entity.getNumberDescription().replaceAll(quote, empty));
        entity.setGenderDescription(entity.getGenderDescription().replaceAll(quote, empty));
        entity.setSuffixDescription(entity.getSuffixDescription().replaceAll(quote, empty));

        entity.setDescription(entity.getDescription().replaceAll(quote, empty));
        entity.setExplanation(entity.getExplanation().replaceAll(quote, empty));
    }

    /**
     * @return the translations from csv columns to field names
     */
    private Map<String, String> getMorphologyTranslations() {
        final Map<String, String> columnTranslations = new HashMap<String, String>();

        // set up basic fields
        columnTranslations.put("1  CODE\"", "code");
        columnTranslations.put("specific Function", "function");
        columnTranslations.put("specific Tense", "tense");
        columnTranslations.put("specific Voice", "voice");
        columnTranslations.put("specific Mood", "mood");
        columnTranslations.put("specific Case", "wordCase");
        columnTranslations.put("specific Person", "person");
        columnTranslations.put("specific Number", "number");
        columnTranslations.put("specific Gender", "gender");
        columnTranslations.put("specific Extra", "suffix");

        // explanations & descriptions
        columnTranslations.put("Function explained", "functionExplained");
        columnTranslations.put("Tense explained", "tenseExplained");
        columnTranslations.put("Voice explained", "voiceExplained");
        columnTranslations.put("Mood explained", "moodExplained");
        columnTranslations.put("Case explained", "caseExplained");
        columnTranslations.put("Person explained", "personExplained");
        columnTranslations.put("Number explained", "numberExplained");
        columnTranslations.put("Gender explained", "genderExplained");
        columnTranslations.put("Extra explained", "suffixExplained");

        // descriptions
        columnTranslations.put("Function in description", "functionDescription");
        columnTranslations.put("Tense in description", "tenseDescription");
        columnTranslations.put("Voice in description", "voiceDescription");
        columnTranslations.put("Mood in description", "moodDescription");
        columnTranslations.put("Case in description", "caseDescription");
        columnTranslations.put("Person in description", "personDescription");
        columnTranslations.put("Number in description", "numberDescription");
        columnTranslations.put("Gender in description", "genderDescription");
        columnTranslations.put("Extra in description", "suffixDescription");

        columnTranslations.put("Shorter Example", "description");
        columnTranslations.put("Explanation", "explanation");

        return columnTranslations;
    }

    /**
     * loads the timeline events
     * 
     * @return number of records loaded
     */
    int loadTimeline() {
        LOGGER.debug("Loading timeline");
        try {
            return new CustomTranslationCsvModuleLoader<TimelineEvent>(this.ebean,
                    this.coreProperties.getProperty("test.data.path.timeline.events.directory"),
                    TimelineEvent.class, new TimelineEventTranslation(this.jsword), this.transaction).init();
        } finally {
            this.transaction.flushCommitAndContinue();
        }
    }

    /**
     * loads the open bible geography data
     * 
     * @return the number of records loaded
     */
    int loadOpenBibleGeography() {
        LOGGER.debug("Loading Open Bible geography");
        try {
            return new CustomTranslationCsvModuleLoader<GeoPlace>(this.ebean,
                    this.coreProperties.getProperty("test.data.path.geography.openbible"), GeoPlace.class,
                    new OpenBibleDataTranslation(this.jsword), '\t', this.transaction).init();
        } finally {
            this.transaction.flushCommitAndContinue();
        }
    }

    /**
     * loads a set of articles
     * 
     * @return the number of articles loaded
     */
    int loadDictionaryArticles() {
        LOGGER.debug("Loading dictionary articles");
        try {
            return new DictionaryLoader(this.ebean, this.jsword,
                    this.coreProperties.getProperty("test.data.path.dictionary.easton"), this.transaction)
                    .init();
        } finally {
            this.transaction.flushCommitAndContinue();
        }

    }

    /**
     * Loads lexicon definitions
     * 
     * @return the number of entries loaded
     */
    int loadLexiconDefinitions() {
        try {
            // int count = new LexiconLoader(this.ebean,
            // this.coreProperties.getProperty("test.data.path.lexicon.definitions.greek"),
            // this.transaction, true).init();
            return new LexiconLoader(this.ebean,
                    this.coreProperties.getProperty("test.data.path.lexicon.definitions.hebrew"),
                    this.transaction, false).init();

            // new LexiconLinker(this.ebean, this.transaction).processStrongLinks();
        } finally {
            this.transaction.flushCommitAndContinue();
        }
    }

    /**
     * loads all lexical forms for all words found in the Bible
     * 
     * @return the number of forms loaded, ~200,000
     */
    int loadSpecificForms() {
        LOGGER.debug("Loading lexical forms");
        try {
            return new SpecificFormsLoader(this.ebean,
                    this.coreProperties.getProperty("test.data.path.lexicon.forms"), this.transaction).init();
        } finally {
            LOGGER.debug("Flushing batch from specific forms");
            this.transaction.flushCommitAndContinue();
            LOGGER.debug("Batch flushed");
        }
    }
}
