package com.tyndalehouse.step.core.data;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.Field.Index;
import org.apache.lucene.document.Field.Store;
import org.apache.lucene.document.Fieldable;
import org.apache.lucene.document.NumericField;
import org.joda.time.LocalDateTime;

import static com.tyndalehouse.step.core.utils.ConversionUtils.localDateTimeToEpochMinutes;
import static com.tyndalehouse.step.core.utils.ConversionUtils.stringToEpochMinutes;

/**
 * Records how a field is stored in Lucene
 */
public class FieldConfig {
    private static final String MINUTE = "minute";
    private final Field.Store store;
    private final Field.Index index;
    private final String[] rawDataField;
    private final String name;
    private final String type;
    private boolean append = false;

    /**
     *
     * @param name the name of the lucene field
     * @param rawDataField the names of the matching fields in the data file
     * @param store the type of store
     * @param index the type of index
     * @param type the type of field, if not a string
     */
    public FieldConfig(final String name, final String[] rawDataField, final Store store, final Index index,
                       final String type, boolean append) {
        this.name = name;
        //default to null if string is empty
        this.type = "".equals(type) ? null : type;
        this.rawDataField = rawDataField.clone();
        this.store = store;
        this.index = index;
        this.append = append;
    }

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
        this(name, rawDataField, store, index, type, false);
    }

    /**
     * 
     * @param name the name of the Lucene field
     * @param rawDataField the names of the matching fields in the data file
     * @param store the type of store
     * @param index the type of index
     */
    public FieldConfig(final String name, final String[] rawDataField, final Store store, final Index index) {
        this(name, rawDataField, store, index, null);
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
            return getField(stringToEpochMinutes(value));
        }

        throw new StepInternalException("Unable to recognise type of field");
    }

    /**
     * @param fieldValue a date time
     * @return the fieldable to be added to the document
     */
    public Fieldable getField(final LocalDateTime fieldValue) {
        if (MINUTE.equals(this.type)) {
            return getField(localDateTimeToEpochMinutes(fieldValue));
        }

        throw new StepInternalException("Unable to recognise type of field");
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

    /**
     * @return true to indicate fields should be appended into each other
     */
    public boolean isAppend() {
        return this.append;
    }
}
