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
package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.APP_MISSING_FIELD;
import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notEmpty;

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

import javax.inject.Inject;
import javax.inject.Provider;

import com.google.inject.Singleton;
import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.service.PassageOptionsValidationService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.servlet.RequestScoped;
import com.tyndalehouse.step.core.models.AvailableFeatures;
import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.StrongCountsAndSubjects;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils;
import com.tyndalehouse.step.models.ModulesForLanguageUser;
import com.yammer.metrics.annotation.Timed;

/**
 * The controller for retrieving information on the bible or texts from the bible.
 *
 * @author chrisburrell
 */
@Singleton
public class BibleController {
    private static final Logger LOGGER = LoggerFactory.getLogger(BibleController.class);
    private final BibleInformationService bibleInformation;
    private final Provider<ClientSession> clientSession;
    private final PassageOptionsValidationService optionsValidationService;

    /**
     * creates the controller giving access to bible information.
     *
     * @param bibleInformation the service allowing access to biblical material
     * @param clientSession    clientSession given on the request
     */
    @Inject
    public BibleController(final BibleInformationService bibleInformation,
                           final Provider<ClientSession> clientSession,
                           PassageOptionsValidationService optionsValidationService) {
        this.bibleInformation = bibleInformation;
        this.clientSession = clientSession;
        this.optionsValidationService = optionsValidationService;
        LOGGER.debug("Created Bible Controller");
    }

    /**
     * a REST method that returns version of the Bible that are available.
     *
     * @param allVersions boolean to indicate whether all versions should be returned
     * @return all versions of modules that are considered to be Bibles.
     */

    public ModulesForLanguageUser getModules(final String allVersions) {
        final String language = this.clientSession.get().getLanguage();
        final Locale userLocale = this.clientSession.get().getLocale();
        final ModulesForLanguageUser versions = new ModulesForLanguageUser();
        versions.setLanguageCode(userLocale.getLanguage());
        versions.setLanguageName(ContemporaryLanguageUtils.capitaliseFirstLetter(userLocale
                .getDisplayLanguage(userLocale)));
        versions.setVersions(this.bibleInformation.getAvailableModules(Boolean.valueOf(allVersions),
                language, userLocale));

        final Iterator<BibleVersion> iterator = versions.getVersions().iterator();
        while(iterator.hasNext()) {
            if(!iterator.next().getInitials().startsWith("Chi")) {
                iterator.remove();
            }
        }
        return versions;
    }

    /**
     * a REST method that returns text from the Bible.
     *
     * @param version   the initials identifying the version
     * @param reference the reference to lookup
     * @return the text to be displayed, formatted as HTML
     */

    public OsisWrapper getBibleText(final String version, final String reference) {
        return getBibleText(version, reference, null, null, null);
    }

    /**
     * Returns the plain text for version and reference
     * @param version the version of interest
     * @param reference the reference that we are interested in
     * @return the plain text data
     */
    public String getPlainTextPreview(final String version, final String reference) {
        return this.bibleInformation.getPlainText(version, reference, true);
    }

    /**
     * a REST method that returns text from the Bible.
     *
     * @param version   the initials identifying the version
     * @param reference the reference to lookup
     * @param options   the list of options to be passed through and affect the retrieval process
     * @return the text to be displayed, formatted as HTML
     */

    public OsisWrapper getBibleText(final String version, final String reference, final String options) {
        return getBibleText(version, reference, options, null, null);
    }

    /**
     * a REST method that returns Bible Text
     *
     * @param version            the initials identifying the version
     * @param reference          the reference to lookup
     * @param options            a list of options to be passed in
     * @param interlinearVersion the interlinear version if provided adds lines under the text
     * @return the text to be displayed, formatted as HTML
     */

    public OsisWrapper getBibleText(final String version, final String reference, final String options,
                                    final String interlinearVersion) {
        return getBibleText(version, reference, options, interlinearVersion, null);
    }

    /**
     * a REST method that returns.
     *
     * @param version            the initials identifying the version
     * @param reference          the reference to lookup
     * @param options            a list of options to be passed in
     * @param interlinearVersion the interlinear version if provided adds lines under the text
     * @param interlinearMode    the mode to use for displaying
     * @return the text to be displayed, formatted as HTML
     */

    @Timed(name = "getText", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public OsisWrapper getBibleText(final String version, final String reference, final String options,
                                    final String interlinearVersion, final String interlinearMode) {
        notEmpty(version, "bible_required", USER_MISSING_FIELD);
        notEmpty(reference, "reference_required", USER_MISSING_FIELD);

        return this.bibleInformation.getPassageText(version, reference, options, interlinearVersion,
                interlinearMode);
    }


    /**
     * Looks up the bible text by verse numbers, mostly used for continuous scrolling.
     *
     * @param version      the version initials
     * @param startVerseId the start verse ordinal
     * @param endVerseId   the end verse ordinal
     * @param roundUp      indicates that verse numbers will be rounded up
     * @param options      the comma-separated list of options (optional)
     * @return the osis wrapper
     */
    public OsisWrapper getBibleByVerseNumber(final String version, final String startVerseId,
                                             final String endVerseId, final String roundUp, final String options) {
        return getBibleByVerseNumber(version, startVerseId, endVerseId, roundUp, options, null);

    }

    /**
     * Looks up the bible text by verse numbers, mostly used for continuous scrolling.
     *
     * @param version            the version initials
     * @param startVerseId       the start verse ordinal
     * @param endVerseId         the end verse ordinal
     * @param roundUp            true to indicate rounding up, false to indicate rounding down, anything else for no
     *                           rounding
     * @param options            the comma-separated list of options (optional)
     * @param interlinearVersion an interlinear versions if available (optional)
     * @return the osis wrapper
     */
    public OsisWrapper getBibleByVerseNumber(final String version, final String startVerseId,
                                             final String endVerseId, final String roundUp, final String options,
                                             final String interlinearVersion) {
        notEmpty(version, "bible_required", USER_MISSING_FIELD);
        notEmpty(startVerseId, "You need to provide a start verse id", APP_MISSING_FIELD);
        notEmpty(endVerseId, "You need to a provide a end verse id", APP_MISSING_FIELD);

        Boolean roundingUp = null;
        if (isNotBlank(roundUp)) {
            if ("true".equalsIgnoreCase(roundUp)) {
                roundingUp = Boolean.TRUE;
            } else if ("false".equalsIgnoreCase(roundUp)) {
                roundingUp = Boolean.FALSE;
            }
        }
        return this.bibleInformation.getPassageText(version, Integer.parseInt(startVerseId),
                Integer.parseInt(endVerseId), options, interlinearVersion, roundingUp);
    }

    public StrongCountsAndSubjects getStrongNumbersAndSubjects(final String version, final String reference) {
        return this.getStrongNumbersAndSubjects(version, reference, "");
    }

    /**
     * Gets the strong numbers for a particular passage
     *
     * @param reference the reference the passage reference
     * @return the strong numbers attached to the passage
     */
    @Timed(name = "vocab-popup", group = "analysis", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public StrongCountsAndSubjects getStrongNumbersAndSubjects(final String version, final String reference, final String userLanguage) {
        notEmpty(reference, "A verse must be provided", APP_MISSING_FIELD);
        notEmpty(reference, "A version must be provided", APP_MISSING_FIELD);
        return this.bibleInformation.getStrongNumbersAndSubjects(version, reference, userLanguage);
    }

    /**
     * a REST method that returns version of the Bible that are available.
     *
     * @param version       the version initials or full version name to retrieve the versions for
     * @param extraVersions other selected versions - for options such as interlinears/interleaved, this plays a role
     * @param displayMode   the current displayMode
     * @return all versions of modules that are considered to be Bibles.
     */
    public AvailableFeatures getFeatures(final String version, final String extraVersions, final String displayMode) {
        notEmpty(version, "bible_required", USER_MISSING_FIELD);
           
        String[] extraVersionsAsString = StringUtils.split(extraVersions, ",");
        return this.optionsValidationService.getAvailableFeaturesForVersion(version, 
                Arrays.asList(extraVersionsAsString), displayMode, InterlinearMode.valueOf(displayMode));
    }

    /**
     * retrieves the list of features currently supported by the application.
     *
     * @return a list of features currently supported by the application
     */
    public List<EnrichedLookupOption> getAllFeatures() {
        return this.bibleInformation.getAllFeatures();
    }

    /**
     * Gets the bible book names.
     *
     * @param bookStart the phrase input so far in a textbox to use for the lookup
     * @param version   the version to lookup upon
     * @return a list of items
     */
    public List<BookName> getBibleBookNames(final String bookStart, final String version) {
        return this.bibleInformation.getBibleBookNames(bookStart, version, true);
    }

    /**
     * ascertains the next reference to lookup.
     *
     * @param reference the current ref
     * @param version   the current version
     * @return the next reference
     */
    public KeyWrapper getNextChapter(final String reference, final String version) {
        return this.bibleInformation.getSiblingChapter(reference, version, false);
    }

    /**
     * ascertains the next reference to lookup.
     *
     * @param reference     the current ref
     * @param sourceVersion the current version
     * @param targetVersion the version in which we want the reference
     * @return the next reference
     */
    public KeyWrapper convertReferenceForBook(final String reference, final String sourceVersion, final String targetVersion) {
        return this.bibleInformation.convertReferenceForBook(reference, sourceVersion, targetVersion);
    }

    /**
     * ascertains the previous reference to lookup.
     *
     * @param reference the current ref
     * @param version   the current version
     * @return the previous reference
     */
    public KeyWrapper getPreviousChapter(final String reference, final String version) {
        return this.bibleInformation.getSiblingChapter(reference, version, true);
    }

    /**
     * Takes a reference and returns the chapter it is part of.
     *
     * @param version   the version to lookup the key in
     * @param reference the reference that we are interested in
     * @return the new reference with full chapter
     */
    public KeyWrapper expandKeyToChapter(final String sourceVersion, final String version, final String reference) {
        return this.bibleInformation.expandKeyToChapter(sourceVersion, version, reference);
    }

    /**
     * Retrieves key information.
     *
     * @param reference     the reference that we are interested in
     * @param sourceVersion the version attached to the reference text
     * @param version       the version to lookup the key in
     * @return the information about that particular key, e.g. OSIS-ID
     */
    public KeyWrapper getKeyInfo(final String reference, final String sourceVersion, final String version) {
        return this.bibleInformation.getKeyInfo(reference, sourceVersion, version);
    }

}
