package com.tyndalehouse.step.core.data;

import org.apache.lucene.document.Document;

/**
 * 
 * @author chrisburrell
 * 
 */
public class EntityDoc {
    private final Document doc;

    /**
     * If not otherwised specified, then we get all the fields
     * 
     * @param doc the underlying document
     */
    public EntityDoc(final Document doc) {
        this.doc = doc;
    }

    /**
     * @param fieldName the name of the field
     * @return a field value
     */
    public String get(final String fieldName) {
        return this.doc.get(fieldName);
    }
}
