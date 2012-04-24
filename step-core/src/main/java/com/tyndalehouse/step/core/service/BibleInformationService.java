package com.tyndalehouse.step.core.service;

import java.util.List;

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.LookupOption;

/**
 * Interface to the service that gives information about the books of the bible, the different types of bible,
 * etc. This service will mainly use JSword but may also rely on other data sources to display text.
 * 
 * @author Chris
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
    String getPassageText(String version, String reference, List<LookupOption> lookupOptions,
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
}
