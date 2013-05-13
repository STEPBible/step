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
package com.tyndalehouse.step.core.data.loaders;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVReader;

import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Loads modules straight from a CSV file to a database form
 *
 * @author chrisburrell
 */
public class StreamingCsvModuleLoader extends AbstractClasspathBasedModuleLoader {
    private static final Logger LOG = LoggerFactory.getLogger(StreamingCsvModuleLoader.class);
    private char separator = ',';
    private final EntityIndexWriterImpl writer;

    /**
     * @param writer       the writer to the index
     * @param resourcePath the resource path to load
     */
    public StreamingCsvModuleLoader(final EntityIndexWriterImpl writer, final String resourcePath) {
        super(resourcePath);
        this.writer = writer;
    }

    @Override
    protected void parseFile(final Reader reader, int skipLines) {
        CSVReader csvReader = null;
        try {
            LOG.debug("Parsing file with a CsvReader");
            csvReader = new CSVReader(reader, this.separator, '"', skipLines);
            parseCsvFile(csvReader);
        } finally {
            closeQuietly(csvReader);
        }
    }

    /**
     * Default method for parsing file, uses column strategy
     *
     * @param csvReader the csv reader
     */
    protected void parseCsvFile(final CSVReader csvReader) {
        String[] line = null;

        String[] headerLine;
        try {
            headerLine = csvReader.readNext();
            while ((line = csvReader.readNext()) != null) {
                processFields(line, headerLine);
                this.writer.save();
            }
        } catch (final IOException e) {
            throw new StepInternalException("Failed to read file", e);
        }
    }

    /**
     * @param line       line read from a csv file
     * @param headerLine the headers
     */
    protected void processFields(final String[] line, final String[] headerLine) {
        for (int ii = 0; ii < line.length; ii++) {
            this.writer.addFieldToCurrentDocument(headerLine[ii], line[ii]);
        }
    }

    /**
     * @return the writer
     */
    public EntityIndexWriterImpl getWriter() {
        return this.writer;
    }

    /**
     * @param separator the separator to set
     */
    public void setSeparator(final char separator) {
        this.separator = separator;
    }
}
