package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.meanings.VersionsData;

/**
 * Allows access to the alternative translation data
 */
public interface AlternativeVersionsService {

    /**
     * Gets the alternatives for a particular passage
     * 
     * @param passage the reference
     * @return the versions data
     */
    VersionsData get(String passage);
}
