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

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.loaders.AbstractClasspathBasedModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Loads an Easton Dictionary
 * 
 * @author chrisburrell
 * 
 */
public class LexiconLoader extends AbstractClasspathBasedModuleLoader {
    private static final Logger LOGGER = LoggerFactory.getLogger(LexiconLoader.class);
    private static final String START_TOKEN = "==============";

    // state used during processing
    private int errors;
    private int count;
    private final EntityIndexWriterImpl writer;

    /**
     * Loads up dictionary items
     * 
     * @param writer the lucene index writer
     * @param resourcePath the classpath to the data
     */
    public LexiconLoader(final EntityIndexWriterImpl writer, final String resourcePath) {
        super(resourcePath);
        this.writer = writer;
    }

    @Override
    protected void parseFile(final Reader reader) {
        final BufferedReader bufferedReader = new BufferedReader(reader);
        String line = null;

        try {
            while ((line = bufferedReader.readLine()) != null) {
                parseLine(line);
            }
        } catch (final IOException e) {
            throw new StepInternalException("Unable to read a line from the source file ", e);
        }

        // save last article
        this.writer.save();

        LOGGER.info("Loaded [{}] dictionary articles with [{}] errors", this.count, this.errors);
    }

    /**
     * Parses a line by setting the current state of this loader appropriately
     * 
     * @param line the line that has been read from file
     */
    private void parseLine(final String line) {
        // deal with case where we are hitting a new word
        if (line.endsWith(START_TOKEN)) {
            this.writer.save();
        }

        parseField(line);
    }

    /**
     * parses a simple field by examining the type and setting the content (or appending the content to a
     * 
     * @param line the line content including field name and value
     */
    private void parseField(final String line) {
        if (line == null || line.length() == 0 || line.charAt(0) != '@') {
            // ignoring line
            return;
        }

        // get the field name
        final int tabIndex = line.indexOf('\t');
        if (tabIndex < 1) {
            LOGGER.error("Invalid line was found in file: [{}]", line);
            return;
        }

        // get field name and value
        final String fieldName = line.substring(0, tabIndex - 1);
        final int startValue = tabIndex + 1;
        // get value
        if (startValue > line.length()) {
            // no value, so skip
            LOGGER.trace("Skipping empty field [{}]", fieldName);
            return;
        }

        final String fieldValue = line.substring(startValue);
        if (isBlank(fieldValue)) {
            LOGGER.trace("Skipping empty field [{}] => [{}]", fieldName, fieldValue);
            // skipping empty field
            return;
        }

        this.writer.addFieldToCurrentDocument(fieldName, fieldValue);
    }

    /**
     * Helper method that gets a trimmed string out
     * 
     * @param fieldName the name of the field
     * @param line the content of the line
     * @return the portion of string representing the string value of the field declared in that line
     */
    String parseFieldContent(final String fieldName, final String line) {
        return line.substring(fieldName.length() + 1).trim();
    }
}
