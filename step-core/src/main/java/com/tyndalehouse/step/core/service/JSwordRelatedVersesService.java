package com.tyndalehouse.step.core.service;

import org.crosswire.jsword.passage.Key;

public interface JSwordRelatedVersesService {
    /**
     * Finds all related verses from a particular key
     *
     * @param version the version to be looked up, or reverts to the default version otherwise
     * @param key     the source key
     * @return all related verses looked up
     */
    Key getRelatedVerses(String version, String key);
}
