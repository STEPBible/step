package com.tyndalehouse.step.core.data.create;

/**
 * Defines a mapping function
 * 
 * @author Chris
 * 
 * @param <T> the type that will be returned
 */
public interface CsvDataMapper<T> {
    /**
     * Maps the piece of data as a row
     * 
     * @param rowNum the row num
     * @param data the data containing the rows
     * @return the element
     */
    T mapRow(int rowNum, CsvData data);
}
