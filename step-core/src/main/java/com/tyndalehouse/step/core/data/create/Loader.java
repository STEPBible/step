package com.tyndalehouse.step.core.data.create;

import com.google.inject.ProvisionException;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.loaders.StreamingCsvModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.AppManagerService;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.TranslationTipsService;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.common.progress.JobManager;
import org.crosswire.common.progress.WorkEvent;
import org.crosswire.common.progress.WorkListener;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * The object that will be responsible for loading all the data into Lucene and downloading key versions of
 * the Bible.
 * <p/>
 * Note, this object is not thread-safe.
 */
public class Loader {
    private static final Logger LOGGER = LoggerFactory.getLogger(Loader.class);
    private final Properties coreProperties;
    private final JSwordModuleService jswordModule;
    private final EntityManager entityManager;
    private final BlockingQueue<String> progress = new LinkedBlockingQueue<>();
    private final Set<String> appSpecificModules = new HashSet<>();
    private boolean complete = false;
    private final Provider<ClientSession> clientSessionProvider;
    private final String runningAppVersion;
    private final AppManagerService appManager;
    private WorkListener workListener;
    private int totalProgress = 0;
    private int totalItems = 6;
    private boolean inProgress = false;
    private final StrongAugmentationService strongAugmentationService;
    private final TranslationTipsService translationTipsService;

    /**
     * The loader is given a connection source to load the data.
     * @param jswordModule          the service helping with installation of jsword modules
     * @param coreProperties        the step core properties
     * @param entityManager         the entity manager
     * @param strongAugmentationService            the strongAugmentationService Strong service
     * @param translationTipsService            the translationTipsService Translation Tips service
     * @param clientSessionProvider the client session provider
     */
    @Inject
    public Loader(final JSwordModuleService jswordModule,
                  @Named("StepCoreProperties") final Properties coreProperties, final EntityManager entityManager,
                  final StrongAugmentationService strongAugmentationService,
                  final TranslationTipsService translationTipsService, 
                  final Provider<ClientSession> clientSessionProvider,
                  AppManagerService appManager
    ) {
        this.jswordModule = jswordModule;
        this.coreProperties = coreProperties;
        this.entityManager = entityManager;
        this.strongAugmentationService = strongAugmentationService;
        this.translationTipsService = translationTipsService;
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
        if (this.inProgress) {
            return;
        }
        this.totalProgress = 0;
        try {
            this.inProgress = true;
            listenInJobs();
            if (!Boolean.getBoolean("step.skipBookInstallation")) {
                // remove any internet loader, because we are running locally first...
                // THIS LINE IS ABSOLUTELY CRITICAL AS IT DISABLES HTTP INSTALLER ON AN APPLICATION-WIDE LEVEL
                this.jswordModule.setOffline(true);

                // attempt to reload the installer list. This ensures we have all the versions in the available bibles
                // that we need
                this.jswordModule.reloadInstallers();

                final List<Book> availableModules = this.jswordModule.getAllModules(-1, BookCategory.BIBLE,
                        BookCategory.COMMENTARY);
                final String[] initials = new String[availableModules.size()];

                // This may put too much stress on smaller systems, since indexing for all modules in
                // package
                // would result as happening at the same times
                this.totalItems += availableModules.size() * 2;
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
            this.inProgress = false;
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
        this.totalProgress += 1;
        this.addUpdate("install_making_version_searchable", version);
        this.jswordModule.reIndex(version);
        this.totalProgress += 1;
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
        this.totalProgress += 1;
        loadLexiconDefinitions();
        this.totalProgress += 1;
        loadSpecificForms();
        this.totalProgress += 1;
        loadRobinsonMorphology();
        this.totalProgress += 1;
        loadVersionInformation();
        this.totalProgress += 1;
        loadAlternativeTranslations();
        this.totalProgress += 1;
        loadAugmentedStrongs(true);
        this.totalProgress += 1;
        loadTranslationTips(true);
        LOGGER.info("Finished loading...");
    }

    public void loadAugmentedStrongs(boolean loadAugmentedFile) {
        LOGGER.debug("Indexing augmented strongs");
        String strongsFile = this.coreProperties.getProperty("test.data.path.augmentedstrongs");
        String installFile = appManager.getStepInstallFile().toString();
        if (loadAugmentedFile) this.strongAugmentationService.readAndLoad(strongsFile, installFile);
        else this.strongAugmentationService.loadFromSerialization(appManager.getStepInstallFile().toString());
    }

    public void loadTranslationTips(boolean loadTranslationTips) {
        LOGGER.debug("Indexing translation tips");
        String translationTipsPath = this.coreProperties.getProperty("test.data.path.translationtips");
        String installFile = appManager.getStepInstallFile().toString();
        if (loadTranslationTips) this.translationTipsService.readAndLoad(translationTipsPath, installFile);
        else this.translationTipsService.loadFromSerialization(appManager.getStepInstallFile().toString());
    }

    /**
     * loads the alternative translation data.
     *
     */
    void loadAlternativeTranslations() {
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
     * Loads all of robinson's morphological data
     *
     */
    void loadRobinsonMorphology() {
        this.addUpdate("install_grammar");

        LOGGER.debug("Loading robinson morphology");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("morphology");
        new StreamingCsvModuleLoader(writer,
                this.coreProperties.getProperty("test.data.path.morphology.robinson")).init(this);

        final int total = writer.close();
        LOGGER.debug("End of morphology");

        this.addUpdate("install_grammar_complete", total);
    }

    /**
     * Loads Tyndale's version information
     *
     */
    void loadVersionInformation() {
        this.addUpdate("install_descriptions");

        LOGGER.debug("Loading version information");
        final EntityIndexWriterImpl writer = this.entityManager.getNewWriter("versionInfo");
        new StreamingCsvModuleLoader(writer, this.coreProperties.getProperty("test.data.path.versions.info"))
                .init(this);
        final int close = writer.close();

        this.addUpdate("install_descriptions_complete", close);
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
        for (String line : updates) {
            LOGGER.info(line);
        }
        return updates;
    }

    /**
     * @return the the total amount of progress of the installation so far
     */
    public int getTotalProgress() {
        return (int) ((double) this.totalProgress / this.totalItems * 100);
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
            // LOGGER.debug("Loader can't get client session"); This line is useless because it will always generate an exception.  Since this is legacy code and does not affect any function, I am just commenting this out.
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

    /**
     * @param totalProgress the total amount of progress so far
     */
    void setTotalProgress(final int totalProgress) {
        this.totalProgress = totalProgress;
    }

    /**
     * @param totalItems the total number of items to be processed
     */
    void setTotalItems(final int totalItems) {
        this.totalItems = totalItems;
    }

    /**
     * @return the total number of items.
     */
    int getTotalItems() {
        return totalItems;
    }
}
