/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
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
