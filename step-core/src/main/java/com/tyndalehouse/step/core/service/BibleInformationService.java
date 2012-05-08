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

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;

/**
 * Interface to the service that gives information about the books of the bible, the different types of bible,
 * etc. This service will mainly use JSword but may also rely on other data sources to display text.
 * 
 * @author chrisburrell
 * 
 */
public interface BibleInformationService {

    /**
     * Queries Jsword to return all the installed versions of the bible
     * 
     * @param locale the locale of the requester
     * @param allVersions a boolean indicating whether all versions should be returned
     * 
     * @return all the available versions of the bible
     */
    List<BibleVersion> getAvailableBibleVersions(boolean allVersions, String locale);

    /**
     * This method selects passage text and forms XML for the client. This is done server side so that the
     * client does not need to render each div individually.
     * 
     * @param version the initials that identify the bible version
     * @param reference the reference
     * @param lookupOptions options to set for retrieval
     * @param interlinearVersion version to use as the interlinear
     * @return the HTML string passed back for consumption
     */
    OsisWrapper getPassageText(String version, String reference, List<LookupOption> lookupOptions,
            String interlinearVersion);

    /**
     * 
     * @param version the version to lookup
     * @return the features available for a Bible (for e.g. Strong numbers)
     */
    List<LookupOption> getFeaturesForVersion(String version);

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
     * @param version the name of the version, defaults to KJV if not found
     * 
     * @return a list of matching bible book names
     */
    List<String> getBibleBookNames(String bookStart, String version);

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
     * 
     * @param reference the reference, initials or book name
     */
    void installModules(String reference);

    /**
     * Returns the previous or next chapter
     * 
     * @param reference the reference
     * @param version the version of the book we are interested in
     * @param previousChapter true for previous chapter, false for next chapter
     * @return the new reference to display on the user screen
     */
    String getSiblingChapter(String reference, String version, boolean previousChapter);
}
