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

import java.io.*;
import java.nio.charset.Charset;

import com.tyndalehouse.step.core.utils.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.data.create.ModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Loads modules straight from a CSV file to a database form
 *
 * @author chrisburrell
 */
public abstract class AbstractClasspathBasedModuleLoader implements ModuleLoader {
    private static final Logger LOG = LoggerFactory.getLogger(AbstractClasspathBasedModuleLoader.class);
    private final String resourcePath;
    private Loader mainLoader;

    /**
     * @param resourcePath the resource path to load
     */
    public AbstractClasspathBasedModuleLoader(final String resourcePath) {
        this.resourcePath = resourcePath;
    }

    @Override
    public void init(final Loader loader) {
        this.mainLoader = loader;
        LOG.debug("Loading entities for [{}]", this.resourcePath);
        readDataFile();
    }

    /**
     * reads data file
     */
    private void readDataFile() {
        LOG.debug("Reading resource [{}]", this.resourcePath);

        if (this.resourcePath == null) {
            throw new StepInternalException("Unable to locate resource.");
        }

        if (this.resourcePath.endsWith("index.txt")) {
            // then we're dealing with a directory, so parse multiple files
            parseMultipleCsvFiles();
            return;
        }

        parseSingleFile(this.resourcePath);
    }

    /**
     * parses multiple files held in a index.txt file
     */
    private void parseMultipleCsvFiles() {
        // read files one by one
        final String directory = this.resourcePath.substring(0, this.resourcePath.lastIndexOf('/') + 1);
        final InputStream stream = ModuleLoader.class.getResourceAsStream(this.resourcePath);
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(stream));
            String line = null;
            while ((line = reader.readLine()) != null) {
                if (!line.startsWith("--")) {
                    parseSingleFile(directory + line);
                }
            }
        } catch (final IOException e) {
            throw new StepInternalException("Unable to read index.txt file", e);
        } finally {
            closeQuietly(reader);
        }
    }

    /**
     * parses a single csv resource from the classpath
     *
     * @param csvResource the classpath resource path
     */
    private void parseSingleFile(final String csvResource) {
        // this uses a buffered reader internally
        Reader fileReader = null;
        InputStream stream = null;
        BufferedInputStream bufferedStream = null;
        try {
            stream = ModuleLoader.class.getResourceAsStream(csvResource);
            if (stream == null) {
                throw new StepInternalException("Unable to read resource: " + csvResource);
            }
            bufferedStream = new BufferedInputStream(stream);

            int skipLines = calculateSkipLines(csvResource);

            fileReader = new InputStreamReader(bufferedStream, Charset.forName("UTF-8"));
            parseFile(fileReader, skipLines);
        } finally {
            closeQuietly(fileReader);
            // closeQuietly(bufferedStream);
            closeQuietly(stream);
        }
    }

    /**
     * Calculates the number of lines to be skipped
     * @param resourcePath the path to the resource
     * @return
     */
    private int calculateSkipLines(final String resourcePath) {
        BufferedReader reader = null;
        try {
            int skipLines = 0;
            reader = new BufferedReader(new InputStreamReader(ModuleLoader.class.getResourceAsStream(resourcePath)));

            String line;
            while ((line = reader.readLine()) != null && line.length() != 0 && line.charAt(0) == '#') {
                LOG.trace("Skipping line...");
                skipLines++;
            }

            return skipLines;
        } catch (IOException ex) {
            throw new StepInternalException("Failed to skip lines", ex);
        } finally {
            IOUtils.closeQuietly(reader);
        }
    }

    /**
     * @return the mainLoader
     */
    public Loader getMainLoader() {
        return this.mainLoader;
    }

    /**
     * @param reader the reader to read the entities in raw form
     */
    protected abstract void parseFile(Reader reader, int skipLines);

}
