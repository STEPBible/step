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
package com.tyndalehouse.step.core.service;

import java.util.List;
import java.util.Locale;

import com.tyndalehouse.step.core.models.*;
import com.tyndalehouse.step.core.models.search.StrongCountsAndSubjects;
import com.tyndalehouse.step.core.models.stats.PassageStat;

/**
 * Interface to the service that gives information about the books of the bible, the different types of bible,
 * etc. This service will mainly use JSword but may also rely on other data sources to display text.
 * 
 * @author chrisburrell
 * 
 */
public interface BibleInformationService {
    public static final char UNAVAILABLE_TO_UI = '_';
    
    /**
     * Queries Jsword to return all the installed versions of the bible
     * 
     * @param allVersions a boolean indicating whether all versions should be returned
     * @param locale the locale of the requester
     * @param usersLocale the locale of the user
     * 
     * @return all the available versions of the bible
     */
    List<BibleVersion> getAvailableModules(boolean allVersions, String locale, Locale usersLocale);

    /**
     * This method selects passage text and forms XML for the client. This is done server side so that the
     * client does not need to render each div individually.
     * 
     * @param version the initials that identify the bible version
     * @param reference the reference
     * @param lookupOptions options to set for retrieval
     * @param interlinearVersion version to use as the interlinear
     * @param interlinearMode indicates if we are interested in interleaving, proper interlinear, comparing,
     *            etc.
     * @return the HTML string passed back for consumption
     */
    OsisWrapper getPassageText(String version, String reference, String lookupOptions,
            String interlinearVersion, String interlinearMode);

    /**
     * This method selects passage text and forms XML for the client. This is done server side so that the
     * client does not need to render each div individually.
     * 
     * @param version the initials that identify the bible version
     * @param startVerseId the start of the passage, as a numeral
     * @param endVerseId the end of the passage, as a numeral
     * @param lookupOptions options to set for retrieval
     * @param interlinearVersion version to use as the interlinear
     * @param round true to round the passage up/down
     * @return the HTML string passed back for consumption
     */
    OsisWrapper getPassageText(String version, int startVerseId, int endVerseId, String lookupOptions,
            String interlinearVersion, Boolean round);

    /**
     * Gets a list of all supported features so far
     * 
     * @return the list of lookup options available to the user
     */
    List<EnrichedLookupOption> getAllFeatures();

    /**
     * returns a list of matching names or references in a particular book
     * 
     * @param bookStart the name of the matching key to look across book names
     * @param version the name of the version, defaults to ESV if not found
     * 
     * @param bookScope a restriction on an OSIS reference book
     * @return a list of matching bible book names
     */
    List<BookName> getBibleBookNames(String bookStart, String version, final String bookScope);

    /**
     * returns a list of matching names or references in a particular book
     *
     * @param bookStart the name of the matching key to look across book names
     * @param version the name of the version, defaults to ESV if not found
     *
     * @param autoLookupSingleBooks true to indicate we want to lookup chapters if we only get 1 book back
     * @return a list of matching bible book names
     */
    List<BookName> getBibleBookNames(final String bookStart, final String version,  boolean autoLookupSingleBooks);
    
    /**
     * Checks a set of core versions to see if they have been installed
     * 
     * @return true if the core modules have been installed
     */
    boolean hasCoreModules();

    /**
     * installs the default modules (such as KJV, ESV, Strongs, Robinson)
     */
    void installDefaultModules();

    /**
     * installs separate modules
     * @param installerIndex the id/index of the installer in the loaded STEP application
     * @param reference the reference, initials or book name
     */
    void installModules(int installerIndex, String reference);

    /**
     * Returns the previous or next chapter
     * 
     * @param reference the reference
     * @param version the version of the book we are interested in
     * @param previousChapter true for previous chapter, false for next chapter
     * @return the new reference to display on the user screen
     */
    KeyWrapper getSiblingChapter(String reference, String version, boolean previousChapter);

    /**
     * Indexes a book
     * 
     * @param initials initials of the book (e.g. KJV)
     */
    void index(String initials);

    /**
     * Re-Indexes a book
     * 
     * @param initials initials of the book (e.g. KJV)
     */
    void reIndex(String initials);

    /**
     * Obtains information about a particular key, including its OSIS ID
     * 
     *
     * @param reference the reference we are looking up
     * @param sourceVersion the version attached to the reference
     * @param version the initials of the version we are wanting to look up 'reference' in.
     * @return a wrapper around the info retrieved
     */
    KeyWrapper getKeyInfo(String reference, final String sourceVersion, String version);

    /**
     * Takes a reference and returns the chapter it is part of
     * 
     *
     * @param sourceVersion the version attached to the reference
     * @param version the version to lookup the key in
     * @param reference the reference that we are interested in
     * @return the new reference with full chapter
     */
    KeyWrapper expandKeyToChapter(final String sourceVersion, String version, String reference);

    /**
     * @param version the version to be queried for
     * @return a value between 0.0 and 1.0 indicating the progress so far
     */
    double getProgressOnInstallation(String version);

    /**
     * @param version the version that is being indexed
     * @return a value between 0.0 and 1.0 indicating the progress so far
     */
    double getProgressOnIndexing(String version);

    /**
     * Removes a module
     * 
     * @param initials initials of the module to remove, e.g. 'WEB'
     */
    void removeModule(String initials);

    /**
     * Indexes all modules, sequentially and synchronously, not in parallel
     */
    void indexAll();

    /**
     * @param version        the version of interest
     * @param reference      the reference of interest
     * @param firstVerseOnly true to indicate only the first verse should be retrieved
     * @return
     */

    String getPlainText(String version, String reference, boolean firstVerseOnly);

    /**
     * Gets the strong numbers for a particular verse.
     *
     * @param version the version attached to the reference
     * @param reference the reference to be looked up
     * @return the strong numbers return keyed by OSIS ID
     */
    StrongCountsAndSubjects getStrongNumbersAndSubjects(final String version, String reference, String userLanguage);

    /**
     * Gets the strong numbers statistics for an array of strong number.
     *
     * @param version the version attached to the reference
	 * @param reference (passage, eg: Gen 1)
     * @param stat the array of strong numbers
     * @return the PassageStat
     */
    PassageStat getArrayOfStrongNumbers(final String version, final String reference, PassageStat stat, final String userLanguage);

    /**
     * Converts a reference from the source versification to the target versification
     * @param reference the reference itself
     * @param sourceVersion the versification of the given reference
     * @param targetVersion our chosen final versification
     * @return
     */
    KeyWrapper convertReferenceForBook(String reference, String sourceVersion, String targetVersion);

    /**
     * Installs all modules from a particular directory
     * @param directoryPath the directory path
     */
    void addDirectoryInstaller(String directoryPath);
    
    List<BibleInstaller> getInstallers();
}
