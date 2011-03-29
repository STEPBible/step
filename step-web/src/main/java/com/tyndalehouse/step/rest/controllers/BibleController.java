package com.tyndalehouse.step.rest.controllers;

import static org.apache.commons.lang.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.rest.framework.Cacheable;
import com.tyndalehouse.step.rest.wrappers.HtmlWrapper;

/**
 * The controller for retrieving information on the bible or texts from the bible
 * 
 * @author Chris
 * 
 */
@Singleton
public class BibleController {
    private static final long serialVersionUID = -5176839737814243641L;
    private static final Logger LOGGER = LoggerFactory.getLogger(BibleController.class);
    private final BibleInformationService bibleInformation;

    /**
     * creates the controller giving access to bible information
     * 
     * @param bibleInformation the service allowing access to biblical material
     */
    @Inject
    public BibleController(final BibleInformationService bibleInformation) {
        this.bibleInformation = bibleInformation;
        LOGGER.debug("Created Bible Controller");
    }

    /**
     * a REST method that returns version of the Bible that are available
     * 
     * @return all versions of modules that are considered to be Bibles.
     */
    @Cacheable(true)
    public List<BibleVersion> getBibleVersions() {
        return this.bibleInformation.getAvailableBibleVersions();
    }

    /**
     * a REST method that returns text from the Bible
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @return the text to be displayed, formatted as HTML
     */
    @Cacheable(true)
    public HtmlWrapper getBibleText(final String version, final String reference) {
        return getBibleText(version, reference, null, null);
    }

    /**
     * a REST method that returns text from the Bible
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @param options the list of options to be passed through and affect the retrieval process
     * @return the text to be displayed, formatted as HTML
     */
    @Cacheable(true)
    public HtmlWrapper getBibleText(final String version, final String reference, final String options) {
        return getBibleText(version, reference, options, null);
    }

    /**
     * a REST method that returns
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @param options a list of options to be passed in
     * @param interlinearVersion the interlinear version if provided adds lines under the text
     * @return the text to be displayed, formatted as HTML
     */
    @Cacheable(true)
    public HtmlWrapper getBibleText(final String version, final String reference, final String options,
            final String interlinearVersion) {
        Validate.notEmpty(version, "You need to provide a version");
        Validate.notEmpty(reference, "You need to provide a reference");

        String[] userOptions = null;
        if (isNotBlank(options)) {
            userOptions = options.split(",");
        }

        final List<LookupOption> lookupOptions = new ArrayList<LookupOption>();
        if (userOptions != null) {
            for (final String o : userOptions) {
                lookupOptions.add(LookupOption.valueOf(o.toUpperCase(Locale.ENGLISH)));
            }
        }

        return new HtmlWrapper(this.bibleInformation.getPassageText(version, reference, lookupOptions,
                interlinearVersion));
    }

    /**
     * a REST method that returns version of the Bible that are available
     * 
     * @param version the version initials or full version name to retrieve the versions for
     * @return all versions of modules that are considered to be Bibles.
     */
    @Cacheable(true)
    public List<LookupOption> getFeatures(final String version) {
        return this.bibleInformation.getFeaturesForVersion(version);
    }

    /**
     * retrieves the list of features currently supported by the application
     * 
     * @return a list of features currently supported by the application
     */
    @Cacheable(true)
    public List<EnrichedLookupOption> getAllFeatures() {
        return this.bibleInformation.getAllFeatures();
    }
}
