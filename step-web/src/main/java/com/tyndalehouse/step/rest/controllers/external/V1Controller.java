package com.tyndalehouse.step.rest.controllers.external;

import com.google.inject.Singleton;
import com.tyndalehouse.step.core.models.*;
import com.tyndalehouse.step.rest.controllers.BibleController;

import javax.inject.Inject;
import java.util.List;

/**
 * Allows look up of passages.
 * 
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
