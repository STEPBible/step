package com.tyndalehouse.step.core.data.create;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import org.apache.lucene.document.Document;

/**
 * Post-processes a document before it is added to the index
 */
public interface PostProcessor {
    /**
     * Processes and adds fields to the document
     * 
     * @param config the entity configuration
     * @param doc document
     */
    void process(EntityConfiguration config, Document doc);

}
