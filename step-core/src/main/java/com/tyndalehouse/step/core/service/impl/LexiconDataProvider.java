package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.entities.lexicon.Definition;

/**
 * Provides an abstraction around this to get one piece of data out
 * 
 * @author chrisburrell
 * 
 */
public interface LexiconDataProvider {
    /**
     * @param l the lexicon definition from which to extract data
     * @return the extracted data
     */
    String getData(Definition l);
}
