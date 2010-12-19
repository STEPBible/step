package com.tyndalehouse.step.core.xsl.impl;

import static org.apache.commons.lang.StringUtils.isBlank;
import static org.apache.commons.lang.StringUtils.split;

import java.util.HashMap;
import java.util.Map;

import com.tyndalehouse.step.core.xsl.InterlinearProvider;
import com.tyndalehouse.step.core.xsl.MultiInterlinearProvider;

/**
 * This implementation will support multiple versions, so each of the methods is keyed by version requested.
 * 
 * @author Chris
 * 
 */
public class MultiInterlinearProviderImpl implements MultiInterlinearProvider {
    /** we separate by commas and spaces */
    private static final String VERSION_SEPARATOR = ", ";
    private final Map<String, InterlinearProvider> interlinearProviders = new HashMap<String, InterlinearProvider>();

    /**
     * sets up the interlinear provider with the correct version and text scope.
     * 
     * @param versions the versions to use to set up the interlinear
     * @param textScope the reference, or passage range that should be considered when setting up the
     *            interlinear provider
     */
    public MultiInterlinearProviderImpl(final String versions, final String textScope) {
        // first check whether the values passed in are correct
        if (isBlank(versions) || isBlank(textScope)) {
            return;
        }

        final String[] differentVersions = split(versions, VERSION_SEPARATOR);
        if (differentVersions != null) {
            for (final String version : differentVersions) {
                this.interlinearProviders.put(version, new InterlinearProviderImpl(version, textScope));
            }
        }
    }

    @Override
    public String getWord(final String version, final String verseNumber, final String strong,
            final String morph) {
        return this.interlinearProviders.get(version).getWord(verseNumber, strong, morph);
    }
}
