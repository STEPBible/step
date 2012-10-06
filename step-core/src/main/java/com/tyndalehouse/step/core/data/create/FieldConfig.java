package com.tyndalehouse.step.core.data.create;

import org.apache.lucene.document.Field;
import org.apache.lucene.document.Field.Index;
import org.apache.lucene.document.Field.Store;

public class FieldConfig {
    private final Field.Store store;
    private final Field.Index index;
    private final String name;

    /**
     * @param store
     * @param index
     */
    public FieldConfig(final String name, final Store store, final Index index) {
        this.name = name;
        this.store = store;
        this.index = index;
    }

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * @return the store
     */
    public Field.Store getStore() {
        return this.store;
    }

    /**
     * @return the index
     */
    public Field.Index getIndex() {
        return this.index;
    }
}
