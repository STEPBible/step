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

import static com.tyndalehouse.step.core.models.InterlinearMode.INTERLINEAR;
import static com.tyndalehouse.step.core.models.InterlinearMode.NONE;
import static com.tyndalehouse.step.core.models.LookupOption.*;
import static com.tyndalehouse.step.core.utils.JSwordUtils.getSortedSerialisableList;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

import java.util.*;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.data.DirectoryInstaller;
import com.tyndalehouse.step.core.data.StepHttpSwordInstaller;
import com.tyndalehouse.step.core.models.*;
import com.tyndalehouse.step.core.service.jsword.*;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.passage.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.StrongCountsAndSubjects;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.jsword.helpers.JSwordStrongNumberHelper;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;
import com.tyndalehouse.step.core.utils.StringUtils;

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
    private final JSwordPassageService jswordPassage;
    private final JSwordModuleService jswordModule;
    private final JSwordMetadataService jswordMetadata;
    private final JSwordSearchService jswordSearch;
    private final Provider<ClientSession> clientSessionProvider;
    private final EntityManager entityManager;
    private final JSwordVersificationService jswordVersification;
    private final SubjectSearchService subjectSearchService;
    private final VersionResolver resolver;

    /**
     * The bible information service, retrieving content and meta data.
     *
     * @param defaultVersions       a list of the default versions that should be installed
     * @param jswordPassage         the jsword service
     * @param jswordModule          provides information and handles information relating to module installation, etc.
     * @param jswordMetadata        provides metadata on jsword modules
     * @param jswordSearch
     * @param clientSessionProvider the client session provider
     * @param entityManager         the entity manager
     * @param jswordVersification   the jsword versification
     * @param subjectSearchService  the subject search service
     */
    @Inject
    public BibleInformationServiceImpl(@Named("defaultVersions") final List<String> defaultVersions,
                                       final JSwordPassageService jswordPassage, final JSwordModuleService jswordModule,
                                       final JSwordMetadataService jswordMetadata, final JSwordSearchService jswordSearch, final Provider<ClientSession> clientSessionProvider,
                                       final EntityManager entityManager, final JSwordVersificationService jswordVersification,
                                       final SubjectSearchService subjectSearchService, final VersionResolver resolver) {
        this.jswordPassage = jswordPassage;
        this.defaultVersions = defaultVersions;
        this.jswordModule = jswordModule;
        this.jswordMetadata = jswordMetadata;
        this.jswordSearch = jswordSearch;
        this.clientSessionProvider = clientSessionProvider;
        this.entityManager = entityManager;
        this.jswordVersification = jswordVersification;
        this.subjectSearchService = subjectSearchService;
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
        final Set<LookupOption> lookupOptions = trim(getLookupOptions(options), version,
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
    public OsisWrapper getPassageText(final String version, final String reference, final String options,
                                      final String interlinearVersion, final String interlinearMode) {

        final List<String> extraVersions = getExtraVersionsFromString(interlinearVersion);
        final InterlinearMode desiredModeOfDisplay = getDisplayMode(interlinearMode, version, extraVersions);

        OsisWrapper passageText;
        final Set<LookupOption> lookupOptions = trim(getLookupOptions(options), version, extraVersions,
                desiredModeOfDisplay, null);

        if (INTERLINEAR != desiredModeOfDisplay && NONE != desiredModeOfDisplay) {
            // split the versions
            final String[] versions = getInterleavedVersions(version, interlinearVersion);
            passageText = this.jswordPassage.getInterleavedVersions(versions, reference, new ArrayList<LookupOption>(lookupOptions),
                    desiredModeOfDisplay);
        } else {
            passageText = this.jswordPassage.getOsisText(version, reference, new ArrayList<LookupOption>(lookupOptions),
                    interlinearVersion, desiredModeOfDisplay);
        }

        passageText.setOptions(optionsToString(getAvailableFeaturesForVersion(version, interlinearVersion, interlinearMode).getOptions()));
        passageText.setSelectedOptions(optionsToString(lookupOptions));
        return passageText;
    }

    /**
     * @param options the available features to this version
     * @return the options in coded form
     */
    private String optionsToString(final Collection<LookupOption> options) {
        StringBuilder codedOptions = new StringBuilder();
        for (LookupOption o : options) {
            if (o.getUiName() != BibleInformationService.UNAVAILABLE_TO_UI) {
                codedOptions.append(o.getUiName());
            }
        }
        return codedOptions.toString();
    }

    @Override
    public String getPlainText(final String version, final String reference, final boolean firstVerseOnly) {
        return jswordPassage.getPlainText(version, reference, firstVerseOnly);
    }

    @Override
    public StrongCountsAndSubjects getStrongNumbersAndSubjects(final String version, final String reference) {

        Verse key = null;
        try {
            key = VerseFactory.fromString(this.jswordVersification.getVersificationForVersion(version), reference);
        } catch (NoSuchKeyException e) {
            LOGGER.error("Unable to look up strongs for [{}]", reference, e);
            return new StrongCountsAndSubjects();
        }

        final StrongCountsAndSubjects verseStrongs = new JSwordStrongNumberHelper(this.entityManager,
                key, this.jswordVersification, this.jswordSearch).getVerseStrongs();

        final Set<String> osisIds = verseStrongs.getStrongData().keySet();
        final Map<String, SearchResult> versesToSubjects = new HashMap<String, SearchResult>(osisIds.size());
        for (final String ref : osisIds) {
            final SearchResult subjects = this.subjectSearchService.searchByReference(ref);
            if (subjects.getTotal() != 0) {
                versesToSubjects.put(ref, subjects);
            }
        }

        verseStrongs.setRelatedSubjects(versesToSubjects);
        return verseStrongs;
    }

    @Override
    public KeyWrapper convertReferenceForBook(final String reference, final String sourceVersion, final String targetVersion) {
        return jswordVersification.convertReference(reference, sourceVersion, targetVersion);
    }

    /**
     * @param interlinearMode a selected interlinear mode
     * @return returns NONE if null, or the value of String as a InterlinearMode enumeration.
     */
    private InterlinearMode getDisplayMode(final String interlinearMode, final String mainBook, final List<String> extraVersions) {
        InterlinearMode userDesiredMode = isBlank(interlinearMode) ? NONE : InterlinearMode.valueOf(interlinearMode);
        return this.jswordMetadata.getBestInterlinearMode(mainBook, extraVersions, userDesiredMode);
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
            versions[i] = versions[i].toUpperCase(Locale.ENGLISH);
        }

        return versions;
    }

    /**
     * Translates the options provided over the HTTP interface to something palatable by the service layer
     *
     * @param options the list of options, comma-separated.
     * @return a list of {@link LookupOption}
     */
    private List<LookupOption> getLookupOptions(final String options) {
        final List<LookupOption> lookupOptions = new ArrayList<LookupOption>();

        if (isBlank(options)) {
            return lookupOptions;
        }

        for (int ii = 0; ii < options.length(); ii++) {
            lookupOptions.add(LookupOption.fromUiOption(options.charAt(ii)));
        }
        return lookupOptions;
    }

    /**
     * Trims the options down to what is supported by the version.
     *
     * @param options              the options
     * @param version              the version that is being selected
     * @param extraVersions        the secondary selected versions
     * @param mode                 the display mode, because we remove some options depending on what is selected
     * @param trimmingExplanations can be null, if provided then it is populated with the reasons why an
     *                             option has been removed. If trimmingExplanations is not null, then it is assume that we do
     *                             not want to rewrite the displayMode
     * @return a new list of options where both list have been intersected.
     */
    private Set<LookupOption> trim(final List<LookupOption> options, final String version, List<String> extraVersions,
                                    final InterlinearMode mode, final List<TrimmedLookupOption> trimmingExplanations) {
        // obtain error messages
        final ResourceBundle errors = ResourceBundle.getBundle("ErrorBundle", this.clientSessionProvider
                .get().getLocale());

        if (options.isEmpty()) {
            return new HashSet<LookupOption>();
        }

        final Set<LookupOption> result = getUserOptionsForVersion(errors, options, version, extraVersions, trimmingExplanations);

        // if we're not explaining why features aren't available, we don't overwrite the display mode
        final InterlinearMode displayMode = determineDisplayMode(options, mode, trimmingExplanations);

        // now trim further depending on modes required:
        switch (displayMode) {
            case COLUMN:
            case COLUMN_COMPARE:
            case INTERLEAVED:
            case INTERLEAVED_COMPARE:
                removeInterleavingOptions(errors, trimmingExplanations, result, !mode.equals(displayMode));
                break;
            case INTERLINEAR:
                explainRemove(errors, NOTES, result, trimmingExplanations, !mode.equals(displayMode),
                        errors.getString("option_not_available_interlinear"));
                result.add(LookupOption.VERSE_NEW_LINE);
                break;
            case NONE:
                break;
            default:
                break;
        }

        return result;
    }

    /**
     * Determine display mode, if there are no explanations, display mode is NONE and there are interlinear
     * options, then mode gets override to INTERLINEAR
     *
     * @param options              the options
     * @param mode                 the mode
     * @param trimmingExplanations the trimming explanations
     * @return the interlinear mode
     * @
     */
    private InterlinearMode determineDisplayMode(final List<LookupOption> options,
                                                 final InterlinearMode mode,
                                                 final List<TrimmedLookupOption> trimmingExplanations) {
        if (mode == NONE && trimmingExplanations == null && hasInterlinearOption(options)) {
            return INTERLINEAR;
        }

        return mode;
    }

    /**
     * Given a set of options selected by the user and a verson, retrieves the options that are actually
     * available
     *
     * @param errors               the error messages
     * @param options              the options given by the user
     * @param version              the version of interest
     * @param extraVersions        the secondary versions that affect feature resolution
     * @param trimmingExplanations the explanations of why options are being removed
     * @return a potentially smaller set of options that are actually possible
     */
    private Set<LookupOption> getUserOptionsForVersion(final ResourceBundle errors,
                                                        final List<LookupOption> options, final String version,
                                                        final List<String> extraVersions,
                                                        final List<TrimmedLookupOption> trimmingExplanations) {
        final Set<LookupOption> available = getFeaturesForVersion(version, extraVersions);
        final Set<LookupOption> result = new HashSet<LookupOption>(options.size());
        // do a crazy bubble intersect, but it's tiny so that's fine
        for (final LookupOption loOption : options) {
            boolean added = false;
            for (final LookupOption avOption : available) {
                if (loOption.equals(avOption)) {
                    result.add(loOption);
                    added = true;
                    break;
                }
            }

            // option not available in that particular version
            if (trimmingExplanations != null && !added) {
                trimmingExplanations.add(new TrimmedLookupOption(errors
                        .getString("option_not_supported_by_version"), loOption));
            }
        }
        return result;
    }

    /**
     * @param options the options that have been selected
     * @return true if one of the options requires an interlinear
     */
    private boolean hasInterlinearOption(final List<LookupOption> options) {
        return options.contains(LookupOption.GREEK_VOCAB) || options.contains(LookupOption.MORPHOLOGY)
                || options.contains(LookupOption.ENGLISH_VOCAB)
                || options.contains(LookupOption.TRANSLITERATION);
    }

    /**
     * Removes the interleaving options.
     *
     * @param errors                 the error mesages
     * @param trimmingExplanations   explanations on why something was removed
     * @param result                 result
     * @param originalModeHasChanged true to indicate that the chosen display mode has been forced upon the
     *                               user
     */
    private void removeInterleavingOptions(final ResourceBundle errors,
                                           final List<TrimmedLookupOption> trimmingExplanations, 
                                           final Set<LookupOption> result,
                                           final boolean originalModeHasChanged) {
        final String interleavedMessage = errors.getString("option_not_available_interleaved");
        explainRemove(errors, VERSE_NUMBERS, result, trimmingExplanations, originalModeHasChanged,
                interleavedMessage);

        explainRemove(errors, NOTES, result, trimmingExplanations, originalModeHasChanged, interleavedMessage);

        explainRemove(errors, ENGLISH_VOCAB, result, trimmingExplanations, originalModeHasChanged,
                interleavedMessage);

        explainRemove(errors, GREEK_VOCAB, result, trimmingExplanations, originalModeHasChanged,
                interleavedMessage);

        explainRemove(errors, TRANSLITERATION, result, trimmingExplanations, originalModeHasChanged,
                interleavedMessage);

        explainRemove(errors, MORPHOLOGY, result, trimmingExplanations, originalModeHasChanged,
                interleavedMessage);

        explainRemove(errors, HEADINGS, result, trimmingExplanations, originalModeHasChanged,
                interleavedMessage);

    }

    /**
     * explains why an option has been removed.
     *
     * @param errors              the errors
     * @param option              the option we want to remove
     * @param result              the resulting options
     * @param trimmingOptions     the list of options
     * @param originalModeChanged tru if the original mode has changed
     * @param explanation         the explanation
     */
    private void explainRemove(final ResourceBundle errors, final LookupOption option,
                               final Set<LookupOption> result, final List<TrimmedLookupOption> trimmingOptions,
                               final boolean originalModeChanged, final String explanation) {
        if (result.remove(option) && trimmingOptions != null) {

            final TrimmedLookupOption trimmedOption;
            if (originalModeChanged) {
                final StringBuilder stringBuilder = new StringBuilder();
                stringBuilder.append(explanation);
                stringBuilder.append(" ");
                stringBuilder.append(errors.getString("option_not_available_other"));
                trimmedOption = new TrimmedLookupOption(stringBuilder.toString(), option);
            } else {
                trimmedOption = new TrimmedLookupOption(explanation, option);
            }
            trimmingOptions.add(trimmedOption);
        }
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
     * Gets the available features for version.
     *
     * @param version     the version
     * @param displayMode the display mode
     * @return the available features for version
     */
    @Override
    public AvailableFeatures getAvailableFeaturesForVersion(final String version, final String extraVersions, final String displayMode) {
        final List<LookupOption> allLookupOptions = Arrays.asList(LookupOption.values());
        final List<TrimmedLookupOption> trimmed = new ArrayList<TrimmedLookupOption>();
        final List<String> extraModules = getExtraVersionsFromString(extraVersions);
        final Set<LookupOption> outcome = trim(allLookupOptions, version,
                extraModules, getDisplayMode(displayMode, version, extraModules),
                trimmed);

        return new AvailableFeatures(new ArrayList<LookupOption>(outcome), trimmed);
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
     * @param version       version in question
     * @param extraVersions the secondary versions that affect feature resolution
     * @return all available features on this module
     */
    private Set<LookupOption> getFeaturesForVersion(final String version, List<String> extraVersions) {
        return this.jswordMetadata.getFeatures(version, extraVersions);
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

    /**
     * Gets the bible book names.
     *
     * @param bookStart the book start
     * @param version   the version
     * @return the bible book names
     */
    @Override
    public List<BookName> getBibleBookNames(final String bookStart, final String version) {
        return this.jswordMetadata.getBibleBookNames(bookStart, version);
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
            LOGGER.debug("Indexing [{}]", initials);
            this.jswordModule.index("WEB");
            this.jswordModule.waitForIndexes(initials);
        }
    }
}
