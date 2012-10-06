package com.tyndalehouse.step.core.data.entities.lexicon;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;

/**
 * A Lucene Document for definitions
 * 
 * @author chrisburrell
 */
public class DefinitionDoc {

    private final Document doc;

    public DefinitionDoc() {
        this.doc = new Document();
    }

    public void addField(final String fieldName, final String value, final Field.Store store,
            final Field.Index index) {
        this.doc.add(new Field(fieldName, value, store, index));
    }
}
