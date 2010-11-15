package com.tyndalehouse.step.core.service;

import java.util.List;

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.LookupOption;

/**
 * Interface to the service that gives information about the books of the bible, the different types of bible, etc. This
 * service will mainly use JSword but may also rely on other data sources to display text.
 * 
 * @author Chris
 * 
 */
public interface BibleInformationService {

    /**
     * Queries Jsword to return all the available versions of the bible
     * 
     * @return all the available versions of the bible
     */
    List<BibleVersion> getBibleVersions();

    /**
     * This method selects passage text and forms XML for the client. This is done server side so that the client does
     * not need to render each div individually.
     * 
     * @param version the initials that identify the bible version
     * @param reference the reference
     * @param lookupOptions options to set for retrieval
     * @param interlinearVersion version to use as the interlinear
     * @return the HTML string passed back for consumption
     */
    String getPassageText(String version, String reference, List<LookupOption> lookupOptions, String interlinearVersion);

    /**
     * 
     * @param version the version to lookup
     * @return the features available for a Bible (for e.g. Strong numbers)
     */
    List<LookupOption> getFeaturesForVersion(String version);

    /**
     * Gets a list of all supported features so far
     * 
     * @return
     */
    List<EnrichedLookupOption> getAllFeatures();

}
