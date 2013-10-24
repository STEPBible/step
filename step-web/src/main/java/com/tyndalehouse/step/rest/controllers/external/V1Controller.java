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
package com.tyndalehouse.step.rest.controllers.external;

import java.util.List;

import javax.inject.Inject;

import com.google.inject.Singleton;
import com.tyndalehouse.step.core.models.AvailableFeatures;
import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.rest.controllers.BibleController;

/**
 * Allows look up of passages.
 * 
 * @author chrisburrell
 */
@Singleton
public class V1Controller {

    /** The Constant STEP. */
    private static final String STEP = "<a href='http://step.tyndalehouse.com/'>Tyndale STEP</a>";

    /** The Constant REPLACE_OSIS_WRAPPER_FOOTER. */
    private static final String REPLACE_OSIS_WRAPPER_FOOTER = "<div class='poweredBy'>Powered by " + STEP
            + "</div></div>";
    /** The bible controller. */
    private final BibleController bibleController;

    /**
     * Instantiates a new passage controller.
     * 
     * @param bibleController the bible controller to which requests are redirected
     */
    @Inject
    public V1Controller(final BibleController bibleController) {
        this.bibleController = bibleController;
    }

    /**
     * a REST method that returns text from the Bible.
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @return the text to be displayed, formatted as HTML
     */
    public OsisWrapper getBibleText(final String version, final String reference) {
        return poweredBy(this.bibleController.getBibleText(version, reference));
    }

    /**
     * a REST method that returns text from the Bible.
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @param options the list of options to be passed through and affect the retrieval process
     * @return the text to be displayed, formatted as HTML
     */
    public OsisWrapper getBibleText(final String version, final String reference, final String options) {
        return poweredBy(this.bibleController.getBibleText(version, reference, options));
    }

    /**
     * a REST method that returns the Bible text.
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @param options a list of options to be passed in
     * @param interlinearVersion the interlinear version if provided adds lines under the text
     * @param interlinearMode the mode to use for displaying (see {@link InterlinearMode} for more details)
     * @return the text to be displayed, formatted as HTML
     */
    public OsisWrapper getBibleText(final String version, final String reference, final String options,
            final String interlinearVersion, final String interlinearMode) {
        return poweredBy(this.bibleController.getBibleText(version, reference, options, interlinearVersion,
                interlinearMode));
    }

    /**
     * a REST method that returns the features available for a particular version
     * 
     * @param version the version initials or full version name to retrieve the versions for
     * @return all versions of modules that are considered to be Bibles.
     * @see http://step.tyndalehouse.com/external/v1/getFeatures
     */
    public AvailableFeatures getFeatures(final String version) {
        return this.bibleController.getFeatures(version, null, null);
    }

    /**
     * a REST method that returns the features available for a particular version and a particlular display
     * mode
     * 
     * @param version the version initials or full version name to retrieve the versions for
     * @param displayMode the current displayMode (values are defined by {@link InterlinearMode} for more
     *            information)
     * @return all versions of modules that are considered to be Bibles.
     * @see http://step.tyndalehouse.com/external/v1/getFeatures
     */
    public AvailableFeatures getFeatures(final String version, final String displayMode) {
        return this.bibleController.getFeatures(version, displayMode, null);
    }

    /**
     * Retrieves the list of features currently supported by the application.
     * 
     * @return a list of features currently supported by the application
     */
    public List<EnrichedLookupOption> getAllFeatures() {
        return this.bibleController.getAllFeatures();
    }

    /**
     * Gets the bible book names.
     * 
     * @param version the version to lookup upon
     * @return a list of items
     */
    public List<BookName> getBibleBookNames(final String version) {
        return this.bibleController.getBibleBookNames("", version);
    }

    /**
     * Adds a "Powered by STEP" footer to the response
     * 
     * @param bibleText the bible text
     * @return the osis wrapper
     */
    private OsisWrapper poweredBy(final OsisWrapper bibleText) {
        bibleText.setValue(bibleText.getValue().replaceAll("</div>$", REPLACE_OSIS_WRAPPER_FOOTER));
        return bibleText;
    }
}
