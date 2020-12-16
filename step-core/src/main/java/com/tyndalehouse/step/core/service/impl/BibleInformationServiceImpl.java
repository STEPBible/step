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
package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.DirectoryInstaller;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.StepHttpSwordInstaller;
import com.tyndalehouse.step.core.models.BibleInstaller;
import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.TrimmedLookupOption;
import com.tyndalehouse.step.core.models.search.StrongCountsAndSubjects;
import com.tyndalehouse.step.core.models.stats.PassageStat;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.PassageOptionsValidationService;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.jsword.JSwordMetadataService;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.helpers.JSwordStrongNumberHelper;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.yammer.metrics.annotation.Timed;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.passage.KeyUtil;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseFactory;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static com.tyndalehouse.step.core.models.InterlinearMode.INTERLINEAR;
import static com.tyndalehouse.step.core.models.InterlinearMode.NONE;
import static com.tyndalehouse.step.core.utils.JSwordUtils.getSortedSerialisableList;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

/**
 * Command handler returning all available bible versions.
 *
 * @author CJBurrell
 */
@Singleton
public class BibleInformationServiceImpl implements BibleInformationService {
    private static final String VERSION_SEPARATOR = ",";
    private static final Logger LOGGER = LoggerFactory.getLogger(BibleInformationServiceImpl.class);
    private final List<String> defaultVersions;
    private final PassageOptionsValidationService optionsValidationService;
    private final JSwordPassageService jswordPassage;
    private final JSwordModuleService jswordModule;
    private final JSwordMetadataService jswordMetadata;
    private final JSwordSearchService jswordSearch;
    private final EntityManager entityManager;
    private final JSwordVersificationService jswordVersification;
    private final VersionResolver resolver;
    private final StrongAugmentationService strongAugmentationService;

    /**
     * The bible information service, retrieving content and meta data.
     *
     * @param defaultVersions           a list of the default versions that should be installed
     * @param jswordPassage             the jsword service
     * @param jswordModule              provides information and handles information relating to module installation,
     *                                  etc.
     * @param jswordMetadata            provides metadata on jsword modules
     * @param jswordSearch
     * @param entityManager             the entity manager
     * @param jswordVersification       the jsword versification
     * @param strongAugmentationService to augment strong numbers
     */
    @Inject
    public BibleInformationServiceImpl(@Named("defaultVersions") final List<String> defaultVersions,
                                       final PassageOptionsValidationService optionsValidationService,
                                       final JSwordPassageService jswordPassage, final JSwordModuleService jswordModule,
                                       final JSwordMetadataService jswordMetadata, final JSwordSearchService jswordSearch,
                                       final EntityManager entityManager, final JSwordVersificationService jswordVersification,
                                       final StrongAugmentationService strongAugmentationService,
                                       final VersionResolver resolver) {
        this.optionsValidationService = optionsValidationService;
        this.jswordPassage = jswordPassage;
        this.defaultVersions = defaultVersions;
        this.jswordModule = jswordModule;
        this.jswordMetadata = jswordMetadata;
        this.jswordSearch = jswordSearch;
        this.entityManager = entityManager;
        this.jswordVersification = jswordVersification;
        this.strongAugmentationService = strongAugmentationService;
        this.resolver = resolver;
    }

    /**
     * Gets the available modules.
     *
     * @param allVersions the all versions
     * @param locale      the locale
     * @param userLocale  the user locale
     * @return the available modules
     */
    @Override
    public List<BibleVersion> getAvailableModules(final boolean allVersions, final String locale,
                                                  final Locale userLocale) {
        LOGGER.debug("Getting bible versions with locale [{}] and allVersions=[{}]", locale, allVersions);
        return getSortedSerialisableList(this.jswordModule.getInstalledModules(allVersions, locale,
                BookCategory.BIBLE, BookCategory.COMMENTARY), userLocale, this.resolver);
    }

    /**
     * Gets the passage text.
     *
     * @param version            the version
     * @param startVerseId       the start verse id
     * @param endVerseId         the end verse id
     * @param options            the options
     * @param interlinearVersion the interlinear version
     * @param roundUp            the round up
     * @return the passage text
     */
    @Override
    public OsisWrapper getPassageText(final String version, final int startVerseId, final int endVerseId,
                                      final String options, final String interlinearVersion, final Boolean roundUp) {
        final List<String> extraVersions = getExtraVersionsFromString(interlinearVersion);
        final Set<LookupOption> lookupOptions = this.optionsValidationService.trim(this.optionsValidationService.getLookupOptions(options), version,
                extraVersions, InterlinearMode.NONE, null);
        final OsisWrapper passage = this.jswordPassage.getOsisTextByVerseNumbers(version, version,
                startVerseId, endVerseId, new ArrayList<LookupOption>(lookupOptions), interlinearVersion, roundUp, false);
        return passage;
    }

    /**
     * Gets the passage text.
     *
     * @param version            the version
     * @param reference          the reference
     * @param options            the options
     * @param interlinearVersion the interlinear version
     * @param interlinearMode    the interlinear mode
     * @return the passage text
     */
    //TODO: this could be optimized. last call to get options is very  similar to 'getLookupOptions'
    // as they share some of the same stuff.
    @Override
    @Timed(name = "passage-lookup", group = "service", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public OsisWrapper getPassageText(final String version, final String reference, final String options,
                                      final String interlinearVersion, final String interlinearMode, final String userLanguage) {

        final List<String> extraVersions = getExtraVersionsFromString(interlinearVersion);
        final InterlinearMode desiredModeOfDisplay = this.optionsValidationService.getDisplayMode(interlinearMode, version, extraVersions);

        OsisWrapper passageText;
        final List<TrimmedLookupOption> removedOptions = new ArrayList<TrimmedLookupOption>(4);
        final List<LookupOption> inputLookupOptions = this.optionsValidationService.getLookupOptions(options);
        final InterlinearMode realModeOfDisplay = this.optionsValidationService.determineDisplayMode(inputLookupOptions, desiredModeOfDisplay, true);
        final Set<LookupOption> lookupOptions = this.optionsValidationService.trim(inputLookupOptions, version, extraVersions,
                desiredModeOfDisplay, realModeOfDisplay, removedOptions);

        if (INTERLINEAR != desiredModeOfDisplay && NONE != desiredModeOfDisplay) {
            // split the versions
            lookupOptions.add(LookupOption.VERSE_NUMBERS);
            final String[] versions = getInterleavedVersions(version, interlinearVersion);
            passageText = this.jswordPassage.getInterleavedVersions(versions, reference, new ArrayList<>(lookupOptions),
                    desiredModeOfDisplay, userLanguage);
        } else {
            passageText = this.jswordPassage.getOsisText(version, reference, new ArrayList(lookupOptions),
                    interlinearVersion, desiredModeOfDisplay);
        }
        passageText.setRemovedOptions(removedOptions);
        passageText.setPreviousChapter(this.jswordPassage.getSiblingChapter(passageText.getOsisId(), version, true));
        passageText.setNextChapter(this.jswordPassage.getSiblingChapter(passageText.getOsisId(), version, false));
        passageText.setOptions(this.optionsValidationService.optionsToString(
                this.optionsValidationService.getAvailableFeaturesForVersion(version, extraVersions, interlinearMode, realModeOfDisplay).getOptions()));

        //the passage lookup wasn't made with the removed options, however, the client needs to think these were selected.
        passageText.setSelectedOptions(this.optionsValidationService.optionsToString(lookupOptions) + getRemovedOptions(removedOptions));
        return passageText;
    }

    /**
     * Gets the removed option lookup options and returns their representation.
     *
     * @param removedOptions a set of options that were removed
     * @return
     */
    private String getRemovedOptions(final List<TrimmedLookupOption> removedOptions) {
        List<LookupOption> options = new ArrayList<LookupOption>(removedOptions.size());
        for (TrimmedLookupOption o : removedOptions) {
            options.add(o.getOption());
        }
        return this.optionsValidationService.optionsToString(options);
    }


    @Override
    public String getPlainText(final String version, final String reference, final boolean firstVerseOnly) {
        return jswordPassage.getPlainText(version, reference, firstVerseOnly);
    }

    @Override
    public StrongCountsAndSubjects getStrongNumbersAndSubjects(final String version, final String reference, final String userLanguage) {
        boolean isMultipleVerses = false;
        Verse key = null;
        final Versification versificationForVersion = this.jswordVersification.getVersificationForVersion(version);

        try {
            key = VerseFactory.fromString(versificationForVersion, reference);
        } catch (NoSuchKeyException e) {
            //perhaps we're looking at multiple verses....
            try {
                //currently not supporting multiple verses
                key = KeyUtil.getVerse(this.jswordVersification.getBookFromVersion(version).getKey(reference));
            } catch (NoSuchKeyException e1) {
                //try reversifying essentially
                try {
                    key = KeyUtil.getVerse(this.jswordVersification.getBookFromVersion(JSwordPassageService.REFERENCE_BOOK).getKey(reference));
                } catch (NoSuchKeyException ex) {
                    LOGGER.error("Unable to look up strongs for [{}]", reference, e);
                    return new StrongCountsAndSubjects();
                }
            }
        }

        final StrongCountsAndSubjects verseStrongs = new JSwordStrongNumberHelper(this.entityManager,
                key, this.jswordVersification, this.jswordSearch, this.strongAugmentationService).getVerseStrongs(userLanguage);
        verseStrongs.setVerse(key.getName());
        verseStrongs.setMultipleVerses(true);
        return verseStrongs;
    }

//    @Override
    public PassageStat getArrayOfStrongNumbers(final String version, final String reference, PassageStat stat, final String userLanguage) {
        Verse key = null;
        final Versification versificationForVersion = this.jswordVersification.getVersificationForVersion(version);
        try {
            key = VerseFactory.fromString(versificationForVersion, reference);
        } catch (NoSuchKeyException e) {
            //perhaps we're looking at multiple verses....
            try {
                //currently not supporting multiple verses
                key = KeyUtil.getVerse(this.jswordVersification.getBookFromVersion(version).getKey(reference));
            } catch (NoSuchKeyException e1) {
                //try reversifying essentially
                try {
                    key = KeyUtil.getVerse(this.jswordVersification.getBookFromVersion(JSwordPassageService.REFERENCE_BOOK).getKey(reference));
                } catch (NoSuchKeyException ex) {
                    LOGGER.error("Unable to look up strongs for [{}]", reference, e);
                }
            }
        }

        return new JSwordStrongNumberHelper(this.entityManager,
                key, this.jswordVersification, this.jswordSearch, this.strongAugmentationService).calculateStrongArrayCounts(version, stat, userLanguage);
    }

    @Override
    public KeyWrapper convertReferenceForBook(final String reference, final String sourceVersion, final String targetVersion) {
        return jswordVersification.convertReference(reference, sourceVersion, targetVersion);
    }


    /**
     * Joins version with interlinear version and returns an upper case array
     *
     * @param version            the base version
     * @param interlinearVersion the interlinear version
     * @return the array of well-formatted versions for use in the stylesheet
     */
    @SuppressWarnings("PMD")
    private String[] getInterleavedVersions(final String version, final String interlinearVersion) {
        final String[] versions = StringUtils
                .split(version + VERSION_SEPARATOR + interlinearVersion, "[, ]+");
        for (int i = 0; i < versions.length; i++) {
            versions[i] = versions[i];
        }

        return versions;
    }


    /**
     * Gets the all features.
     *
     * @return the all features
     */
    @Override
    public List<EnrichedLookupOption> getAllFeatures() {
        final LookupOption[] lo = LookupOption.values();
        final List<EnrichedLookupOption> elo = new ArrayList<EnrichedLookupOption>(lo.length + 1);

        for (final LookupOption lookupOption : lo) {
            final String displayName = lookupOption.name();
            if (isNotBlank(displayName)) {
                elo.add(new EnrichedLookupOption(displayName, lookupOption.toString(), lookupOption.isEnabledByDefault()));
            }
        }

        return elo;
    }


    /**
     * @param extraVersions the string of extra versions
     * @return the equivalent list
     */
    private List<String> getExtraVersionsFromString(final String extraVersions) {
        if (extraVersions == null) {
            return new ArrayList<String>(0);
        }
        return Arrays.asList(StringUtils.split(extraVersions, ","));
    }


    /**
     * Checks for core modules.
     *
     * @return true, if successful
     */
    @Override
    public boolean hasCoreModules() {
        for (final String version : this.defaultVersions) {
            if (!this.jswordModule.isInstalled(version)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Install default modules.
     */
    @Override
    public void installDefaultModules() {
        // we install the module for every core module in the list
        for (final String book : this.defaultVersions) {
            this.jswordModule.installBook(book);
        }
    }

    @Override
    public void installModules(final int installerIndex, final String reference) {
        this.jswordModule.installBook(installerIndex, reference);
    }

    @Override
    public void addDirectoryInstaller(final String directoryPath) {
        this.jswordModule.addDirectoryInstaller(directoryPath);
    }

    @Override
    public List<BibleInstaller> getInstallers() {
        List<BibleInstaller> bibleInstallers = new ArrayList<BibleInstaller>();
        final List<Installer> installers = this.jswordModule.getInstallers();
        for (int ii = 0; ii < installers.size(); ii++) {
            final Installer installer = installers.get(ii);

            String name = installer.getInstallerDefinition();
            boolean accessesInternet = true;
            if (installer instanceof StepHttpSwordInstaller) {
                name = ((StepHttpSwordInstaller) installer).getInstallerName();
                accessesInternet = true;
            } else if (installer instanceof DirectoryInstaller) {
                name = ((DirectoryInstaller) installer).getInstallerName();
                accessesInternet = false;
            }

            bibleInstallers.add(new BibleInstaller(ii, name, accessesInternet));
        }
        return bibleInstallers;
    }

    @Override
    public List<BookName> getBibleBookNames(final String bookStart, final String version, final String bookScope) {
        return this.jswordMetadata.getBibleBookNames(bookStart, version, bookScope);
    }

    @Override
    public List<BookName> getBibleBookNames(final String bookStart, final String version, final boolean autoLookup) {
        return this.jswordMetadata.getBibleBookNames(bookStart, version, autoLookup);
    }

    /**
     * Gets the sibling chapter.
     *
     * @param reference       the reference
     * @param version         the version
     * @param previousChapter the previous chapter
     * @return the sibling chapter
     */
    @Override
    public KeyWrapper getSiblingChapter(final String reference, final String version,
                                        final boolean previousChapter) {
        return this.jswordPassage.getSiblingChapter(reference, version, previousChapter);
    }

    /**
     * Gets the key info.
     *
     * @param reference     the reference
     * @param sourceVersion the version attached to the reference
     * @param version       the version
     * @return the key info
     */
    @Override
    public KeyWrapper getKeyInfo(final String reference, final String sourceVersion, final String version) {
        return this.jswordPassage.getKeyInfo(reference, sourceVersion, version);
    }

    /**
     * Index.
     *
     * @param initials the initials
     */
    @Override
    public void index(final String initials) {
        this.jswordModule.index(initials);
    }

    /**
     * Re index.
     *
     * @param initials the initials
     */
    @Override
    public void reIndex(final String initials) {
        this.jswordModule.reIndex(initials);
    }

    @Override
    public KeyWrapper expandKeyToChapter(final String sourceVersion, final String version, final String reference) {
        //convert first to the correct key, then expand to chapter
        String newRef = this.jswordVersification.convertReference(reference, sourceVersion, version).getOsisKeyId();
        return this.jswordPassage.expandToChapter(version, newRef);
    }

    /**
     * Gets the progress on installation.
     *
     * @param version the version
     * @return the progress on installation
     */
    @Override
    public double getProgressOnInstallation(final String version) {
        return this.jswordModule.getProgressOnInstallation(version);
    }

    /**
     * Gets the progress on indexing.
     *
     * @param version the version
     * @return the progress on indexing
     */
    @Override
    public double getProgressOnIndexing(final String version) {
        return this.jswordModule.getProgressOnIndexing(version);
    }

    /**
     * Removes the module.
     *
     * @param initials the initials
     */
    @Override
    public void removeModule(final String initials) {
        this.jswordModule.removeModule(initials);
    }

    /**
     * Index all.
     */
    @Override
    public void indexAll() {
        final List<Book> installedModules = this.jswordModule.getInstalledModules(BookCategory.BIBLE);
        for (final Book b : installedModules) {
            final String initials = b.getInitials();
            LOGGER.error("Indexing [{}]", initials);
            this.jswordModule.index(b.getInitials());
            this.jswordModule.waitForIndexes(initials);
        }
    }
}
