package com.tyndalehouse.step.rest.controllers;

import static org.apache.commons.lang.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.rest.wrappers.HtmlWrapper;

@RequestMapping(value = "/bible", method = RequestMethod.GET)
@Controller
public class BibleController {
    @Autowired
    private BibleInformationService bibleInformation;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * a REST method that returns version of the Bible that are available
     * 
     * @return all versions of modules that are considered to be Bibles.
     */
    @RequestMapping(value = "/versions")
    public @ResponseBody
    List<BibleVersion> getBibleVersions() {
        return this.bibleInformation.getBibleVersions();
    }

    /**
     * a REST method that returns text from the Bible
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @return the text to be displayed, formatted as HTML
     */
    @RequestMapping(value = "/text/{version}/{reference}")
    public @ResponseBody
    HtmlWrapper getBibleText(@PathVariable final String version, @PathVariable final String reference) {
        return getBibleText(version, reference, null, null);
    }

    /**
     * a REST method that returns text from the Bible
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @return the text to be displayed, formatted as HTML
     */
    @RequestMapping(value = "/text/{version}/{reference}/{options}")
    public @ResponseBody
    HtmlWrapper getBibleText(@PathVariable final String version, @PathVariable final String reference,
            @PathVariable final String options) {
        return getBibleText(version, reference, options, null);
    }

    /**
     * a REST method that returns
     * 
     * @param version the initials identifying the version
     * @param reference the reference to lookup
     * @param options a list of options to be passed in
     * @return the text to be displayed, formatted as HTML
     */
    @RequestMapping(value = "/text/{version}/{reference}/{options}/{interlinearVersion}")
    public @ResponseBody
    HtmlWrapper getBibleText(@PathVariable final String version, @PathVariable final String reference,
            @PathVariable final String options, @PathVariable final String interlinearVersion) {
        Validate.notEmpty(version, "You need to provide a version");
        Validate.notEmpty(reference, "You need to provide a reference");

        String[] userOptions = null;
        if (isNotBlank(options)) {
            userOptions = options.split(",");
        }

        final List<LookupOption> lookupOptions = new ArrayList<LookupOption>();
        if (userOptions != null) {
            for (final String o : userOptions) {
                lookupOptions.add(LookupOption.valueOf(o.toUpperCase()));
            }
        }

        return new HtmlWrapper(this.bibleInformation.getPassageText(version, reference, lookupOptions,
                interlinearVersion));
    }

    /**
     * a REST method that returns version of the Bible that are available
     * 
     * @return all versions of modules that are considered to be Bibles.
     */
    @RequestMapping(value = "/features/{version}")
    public @ResponseBody
    List<LookupOption> getBibleVersions(@PathVariable final String version) {
        return this.bibleInformation.getFeaturesForVersion(version);
    }

    @RequestMapping(value = "/features-all")
    public @ResponseBody
    List<EnrichedLookupOption> getAllFeatures() {
        // Use EH Cache to cache this
        return this.bibleInformation.getAllFeatures();
    }
}
