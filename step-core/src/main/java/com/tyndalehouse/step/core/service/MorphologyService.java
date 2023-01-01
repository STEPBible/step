package com.tyndalehouse.step.core.service;

import java.util.List;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * The service providing morphology information
 * 
 * @author chrisburrell
 * 
 */
public interface MorphologyService {

    /**
     * @param code the long-code including prefix
     * @return the list of matched morphology entities
     */
    List<EntityDoc> getMorphology(String code);

    /**
     * Returns the same as {@link getMorphology} but only partial information
     * 
     * @param code the long-code including prefix
     * @return the list of matched morphology entities
     */
    List<EntityDoc> getQuickMorphology(String code);
}
