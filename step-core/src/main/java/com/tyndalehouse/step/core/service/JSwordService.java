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

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;

import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;

/**
 * The service providing access to JSword. All JSword calls should preferably be placed in this service
 * 
 * @author chrisburrell
 * 
 */
public interface JSwordService {
    /**
     * returns the Osis Text as a String
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @return the OSIS text in an HTML form
     */
    OsisWrapper getOsisText(String version, String reference, List<LookupOption> options,
            String interlinearVersion);

    /**
     * returns the biblical text as xml dom
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @return the OSIS text in an HTML form
     */
    OsisWrapper getOsisText(String version, String reference);

    /**
     * looks up any installed module
     * 
     * @param bibleCategory the categories of the modules to be returned
     * @return a list of bible books
     */
    List<Book> getInstalledModules(BookCategory... bibleCategory);

    /**
     * looks up any installed module
     * 
     * @param bibleCategory the categories of the modules to be returned
     * @param allVersions indicates all versions of the bible
     * @param locale specifies a particular language of interest + defaults
     * @return a list of bible books
     */
    List<Book> getInstalledModules(boolean allVersions, String locale, BookCategory... bibleCategory);

    /**
     * Gets the features for a module
     * 
     * @param version the initials of the book to look up
     * @return the list of supported features
     */
    List<LookupOption> getFeatures(String version);

    /**
     * Using module initials, checks whether the module has been installed
     * 
     * @param moduleInitials the initials of the modules to check for installation state
     * @return true if the module is installed
     */
    boolean isInstalled(String moduleInitials);

    /**
     * Kicks of a process to install this version (asynchronous)
     * 
     * @param version version to be installs
     */
    void installBook(String version);

    /**
     * assesses the progress made on an installation
     * 
     * @param bookName the book name
     * @return the percentage of completion (0 - 1.0)
     */
    double getProgressOnInstallation(String bookName);

    /**
     * retrieves all modules that have been installed
     * 
     * @param bookCategory the list of categories to be included
     * @return all modules whether installed or not
     */
    List<Book> getAllModules(BookCategory... bookCategory);

    /**
     * 
     * @param references a list of references
     * @param version the version name is used to select the correct versification
     * @return the list of references strongly-typed
     */
    List<ScriptureReference> resolveReferences(final String references, String version);

    /**
     * returns a list of matching names or references in a particular book
     * 
     * @param bookStart the name of the matching key to look across book names
     * @param version the name of the version, defaults to KJV if not found
     * 
     * @return a list of matching bible book names
     */
    List<String> getBibleBookNames(String bookStart, String version);

    /**
     * Returns the previous or next chapter
     * 
     * @param reference the reference
     * @param version the version of the book we are interested in
     * @param previousChapter true for previous chapter, false for next chapter
     * @return the new reference to display on the user screen
     */
    String getSiblingChapter(String reference, String version, boolean previousChapter);

    /**
     * reloads all installers TODO - user should be warned <b>USERS SHOULD BE WARNED ABOUT THIS AS IT LOOKS UP
     * INFORMATION ON THE INTERNET</b>
     */
    void reloadInstallers();

    /**
     * Given a verse number, we lookup the verse in question and return it
     * 
     * @param version the version to be looked up
     * @param numberedVersion the version used for numbering verses
     * @param verseId the verse number to look up
     * @param lookupOptions the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @return the OsisWrapper containing the text
     */
    OsisWrapper getOsisTextByVerseNumbers(String version, String numberedVersion, int verseId,
            final List<LookupOption> lookupOptions, final String interlinearVersion);

    /**
     * Given a verse number, we lookup the verse in question and return it. The numberedVersion is assumed to
     * be KJV (i.e. KJV is used for the number lookup)
     * 
     * @param version the version to be looked up
     * @param verseId the verse number to look up
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @return the OsisWrapper containing the text
     */
    OsisWrapper getOsisTextByVerseNumber(String version, int verseId, final List<LookupOption> options,
            final String interlinearVersion);

    /**
     * Looks up the reference name for a particular verse
     * 
     * @param startVerseId start of the verse range
     * @param endVerseId end of the verse range
     * @return the reference to be displayed on a screen
     */
    String getVerseRange(int startVerseId, int endVerseId);

    /**
     * Given a verse number, we lookup the verse in question and return it. The numberedVersion is assumed to
     * be KJV (i.e. KJV is used for the number lookup)
     * 
     * @param version the version to use for the passage lookup
     * @param numberedVersion the version to be used to lookup the ordinal verse numbers
     * @param startVerseId the start of the verse number to look up
     * @param endVerseId the end of the verse
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @param roundReference TODO
     * @return the OsisWrapper containing the text
     */
    OsisWrapper getOsisTextByVerseNumbers(String version, String numberedVersion, int startVerseId,
            int endVerseId, List<LookupOption> options, final String interlinearVersion, Boolean roundReference);

}
