package com.tyndalehouse.step.core.data.create;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A wrapper for CSV data that can be accessed similar to a Map
 * 
 * @author Chris
 * 
 */
public class CsvData {
    private static final Logger LOG = LoggerFactory.getLogger(CsvData.class);
    private final List<String[]> data;
    private final Map<String, Integer> headerMapping = new HashMap<String, Integer>();

    /**
     * Initialises a CSV data accessor
     * 
     * @param fileData the data that is passed through
     */
    public CsvData(final List<String[]> fileData) {
        this.data = fileData;

        final String[] headerRow = fileData.get(0);
        for (int ii = 0; ii < headerRow.length; ii++) {
            this.headerMapping.put(headerRow[ii], Integer.valueOf(ii));
        }
    }

    /**
     * provides access to cells contained in the file
     * 
     * @param row the row index
     * @param columnName the columnName
     * @return the value at row [row] and column [columnName]
     */
    public String getData(final int row, final String columnName) {
        CsvData.LOG.trace("Getting data from CSV: R:[{}] C:[{}]", row, columnName);
        return this.data.get(row + 1)[this.headerMapping.get(columnName)];
    }

    /**
     * the number of rows in the data file
     * 
     * @return the number of rows in the data file
     */
    public int size() {
        return this.data.size() - 1;
    }
}
