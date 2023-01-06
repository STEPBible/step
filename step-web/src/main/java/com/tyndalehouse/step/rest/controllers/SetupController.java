package com.tyndalehouse.step.rest.controllers;

import com.google.inject.Inject;
import com.google.inject.servlet.RequestScoped;
import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.models.BibleInstaller;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.tyndalehouse.step.models.setup.InstallationProgress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Provider;
import java.util.ArrayList;
import java.util.List;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.CONTROLLER_INITIALISATION_ERROR;
import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;
import static com.tyndalehouse.step.rest.framework.RequestUtils.validateSession;

/**
 * The controller that will deal with any requests changing the behaviour of the application
 */
@RequestScoped
public class SetupController {
    private static final Logger LOGGER = LoggerFactory.getLogger(SetupController.class);
    private final BibleInformationService bibleInformation;
    private final Loader loader;
    private final Provider<ClientSession> sessionProvider;
    private final InternationalJsonController internationalJsonController;

    /**
     * creates the controller
     * 
     * @param bibleInformationService the service that allows access to biblical material
     * @param loader service which is able to load the data into the database
     * @param sessionProvider the provider of the user session
     */
    @Inject
    public SetupController(final BibleInformationService bibleInformationService, 
                            final Loader loader,
                            final InternationalJsonController internationalJsonController,
                            final Provider<ClientSession> sessionProvider) {
        this.internationalJsonController = internationalJsonController;
        notNull(bibleInformationService, "No bible information service was provided",
                CONTROLLER_INITIALISATION_ERROR);
        notNull(loader, "No loader module was provided", CONTROLLER_INITIALISATION_ERROR);
        notNull(sessionProvider, "No session provider was passed in", CONTROLLER_INITIALISATION_ERROR);

        this.sessionProvider = sessionProvider;
        this.bibleInformation = bibleInformationService;
        this.loader = loader;
    }

    /**
     * Kicks of installation process, which includes downloading the KJV & ESV and creating index for lots of
     * data.
     */
    public void installFirstTime() {
        validateSession(this.sessionProvider);
        this.loader.init();
    }

    /**
     * @return true if the installation has completed and the application is ready to be used
     */
    public boolean isInstallationComplete() {
        validateSession(this.sessionProvider);
        return this.loader.isComplete();
    }

    /**
     * @return reads progress state
     */
    public InstallationProgress getProgress() {
        validateSession(this.sessionProvider);
        return new InstallationProgress(this.loader.readOnceProgress(), this.loader.getTotalProgress());
    }

    /**
     * @param versions versions
     * @return a list of the progresses in the same order given
     */
    public List<Double> getProgressOnInstallation(final String versions) {
        validateSession(this.sessionProvider);

        final String[] allVersions = StringUtils.split(versions, ",");
        final List<Double> progresses = new ArrayList<Double>(allVersions.length);

        for (final String version : allVersions) {
            progresses.add(this.bibleInformation.getProgressOnInstallation(version));
        }
        return progresses;
    }

    /**
     * @param versions versions
     * @return a list of the progresses in the same order given
     */
    public List<Double> getProgressOnIndexing(final String versions) {
        final String[] allVersions = StringUtils.split(versions, ",");
        final List<Double> progresses = new ArrayList<Double>(allVersions.length);

        for (final String version : allVersions) {
            progresses.add(this.bibleInformation.getProgressOnIndexing(version));
        }
        return progresses;
    }

    /**
     * Installing default modules
     * 
     * @param initials the initials of the bible to install
     */
    public void installBible(final String installerIndex, final String initials) {
        validateSession(this.sessionProvider);

        notBlank(initials, "bible_for_install", USER_MISSING_FIELD);
        LOGGER.debug("Installing module {}", initials);
        
        
        this.bibleInformation.installModules(Integer.parseInt(installerIndex), initials);
    }


    /**
     * Installing default modules
     *
     */
    public List<BibleInstaller> getInstallers() {
        validateSession(this.sessionProvider);
        return this.bibleInformation.getInstallers();
    }
    
    /**
     * Installing default modules
     *
     * @param directoryPath the directory path to install from.
     */
    public void addDirectoryInstaller(final String directoryPath) {
        validateSession(this.sessionProvider);

        notBlank(directoryPath, "bible_for_install", USER_MISSING_FIELD);
        LOGGER.debug("Installing modules from directory {}", directoryPath);
        this.bibleInformation.addDirectoryInstaller(directoryPath);
    }
    
    /**
     * Removes a module
     * 
     * @param initials the initials referencing the correct module
     */
    public boolean removeModule(final String initials) {
        validateSession(this.sessionProvider);

        notBlank(initials, "bible_for_install", USER_MISSING_FIELD);
        this.bibleInformation.removeModule(initials);
        return true;
    }

    /**
     * indexes a book
     * 
     * @param initials the initials of the book to index
     */
    public void index(final String initials) {
        validateSession(this.sessionProvider);

        notBlank(initials, "bible_for_install", USER_MISSING_FIELD);
        this.bibleInformation.index(initials);
    }

    /**
     * Re-indexes a book
     * 
     * @param initials the initials of the book to index
     */
    public void reIndex(final String initials) {
        validateSession(this.sessionProvider);

        notBlank(initials, "bible_for_install", USER_MISSING_FIELD);
        this.bibleInformation.reIndex(initials);
    }

    /**
     * Indexes all modules
     */
    public void indexAll() {
        validateSession(this.sessionProvider);
        this.bibleInformation.indexAll();
    }

    /**
     * Reloads the international JSON files
     *
     */
    public void invalidateCache() {
        validateSession(this.sessionProvider);
        internationalJsonController.resetCache();
    }

    /**
     * Removes a module
     *
     */
    public void shutdown() {
        validateSession(this.sessionProvider);
        LOGGER.warn("Shutdown triggered");
        System.exit(0);
    }
}
