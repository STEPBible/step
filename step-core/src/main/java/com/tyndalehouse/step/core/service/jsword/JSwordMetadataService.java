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
package com.tyndalehouse.step.core.service.jsword;

import java.util.List;

import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;

/**
 * The service providing access to JSword. All JSword calls should preferably be placed in this service
 *
 * @author chrisburrell
 */
public interface JSwordMetadataService {
    /**
     * Gets the features for a module
     *
     * @param version       the initials of the book to look up
     * @param extraVersions the secondary versions that affect feature resolution
     * @return the list of supported features
     */
    List<LookupOption> getFeatures(String version, List<String> extraVersions);

    /**
     * returns a list of matching names or references in a particular book
     *
     * @param bookStart the name of the matching key to look across book names
     * @param version   the name of the version, defaults to ESV if not found
     * @return a list of matching bible book names
     */
    List<BookName> getBibleBookNames(String bookStart, String version);

    /**
     * @param version version of interest
     * @return true if the version in question contains Strongs
     */
    boolean hasVocab(String version);

    /**
     * Returns the languages for a set of versions
     *
     * @param versions
     * @return
     */
    String[] getLanguages(String... versions);

    /**
     * Determines the best interlinear mode available for the given versions. The order of preference is
     * <p/>
     * INTERLINEAR
     * INTERLEAVED_COMPARE
     * INTERLEAVED
     *
     * @param mainBook      the main book
     * @param extraVersions the extra versions
     * @return the best interlinear mode.
     */
    InterlinearMode getBestInterlinearMode(String mainBook, List<String> extraVersions);
}
