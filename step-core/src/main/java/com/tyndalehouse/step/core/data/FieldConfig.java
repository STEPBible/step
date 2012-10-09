package com.tyndalehouse.step.core.data;

import org.apache.lucene.document.Field;
import org.apache.lucene.document.Field.Index;
import org.apache.lucene.document.Field.Store;
import org.apache.lucene.document.Fieldable;

/**
 * Records how a field is stored in Lucene
 * 
 * @author chrisburrell
 * 
 */
public class FieldConfig {
    private final Field.Store store;
    private final Field.Index index;
    private final String[] rawDataField;
    private final String name;

    /**
     * @param rawDataField the field that was used locally to store it
     * @param store the type of store
     * @param index the type of index
     */
    public FieldConfig(final String name, final String[] rawDataField, final Store store, final Index index) {
        this.name = name;
        this.rawDataField = rawDataField;
        this.store = store;
        this.index = index;
    }

    public Fieldable getField(final String value) {
        return new Field(this.name, value, this.store, this.index);
    }

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * /**
     * 
     * @return the store
     */
    public Field.Store getStore() {
        return this.store;
    }

    /**
     * @return the rawDataField
     */
    public String[] getRawDataField() {
        return this.rawDataField;
    }

    /**
     * @return the index
     */
    public Field.Index getIndex() {
        return this.index;
    }
}
