package com.tyndalehouse.step.core.data;

import static org.joda.time.DateTime.parse;
import static org.joda.time.DateTimeUtils.getInstantMillis;

import org.apache.lucene.document.Field;
import org.apache.lucene.document.Field.Index;
import org.apache.lucene.document.Field.Store;
import org.apache.lucene.document.Fieldable;
import org.apache.lucene.document.NumericField;

import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Records how a field is stored in Lucene
 * 
 * @author chrisburrell
 * 
 */
public class FieldConfig {
    private static final long MILLISECONDS_IN_MINUTE = 60000;
    private static final String MINUTE = "minute";
    private final Field.Store store;
    private final Field.Index index;
    private final String[] rawDataField;
    private final String name;
    private final String type;

    /**
     * 
     * @param name the name of the lucene field
     * @param rawDataField the names of the matching fields in the data file
     * @param store the type of store
     * @param index the type of index
     * @param type the type of field, if not a string
     */
    public FieldConfig(final String name, final String[] rawDataField, final Store store, final Index index,
            final String type) {
        this.name = name;
        this.type = type;
        this.rawDataField = rawDataField.clone();
        this.store = store;
        this.index = index;
    }

    /**
     * Gets a numerical field
     * 
     * @param fieldValue the field value
     * @return the field
     */
    public Fieldable getField(final Number fieldValue) {
        final NumericField field = new NumericField(this.name, this.store, this.index == Index.ANALYZED);
        if (fieldValue instanceof Double) {
            field.setDoubleValue((Double) fieldValue);
        } else if (fieldValue instanceof Integer) {
            field.setIntValue((Integer) fieldValue);
        } else if (fieldValue instanceof Long) {
            field.setLongValue((Long) fieldValue);
        } else {
            throw new StepInternalException("Unsupported type: " + fieldValue.getClass());
        }
        return field;
    }

    /**
     * @param value the name of the field
     * @return the fieldable for use in lucene
     */
    public Fieldable getField(final String value) {
        if (this.type == null) {
            return new Field(this.name, value, this.store, this.index);
        }

        if (MINUTE.equals(this.type)) {
            return getField(getInstantMillis(parse(value)) / MILLISECONDS_IN_MINUTE);
        }

        throw new StepInternalException("Unable to recognise type");
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
