package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * Provides an abstraction around this to get one piece of data out
 * @param <K> the type that will be extracted
 * 
 */
public interface LexiconDataProvider {
    /**
     * @param l the lexicon definition from which to extract data
     * @return the extracted data
     */
    String getData(EntityDoc l);
}
