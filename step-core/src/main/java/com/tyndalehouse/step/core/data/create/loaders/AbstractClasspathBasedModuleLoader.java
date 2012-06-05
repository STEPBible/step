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
package com.tyndalehouse.step.core.data.create.loaders;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.create.ModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Loads modules straight from a CSV file to a database form
 * 
 * @param <T> the type of the class to load
 * @author chrisburrell
 */
public abstract class AbstractClasspathBasedModuleLoader<T> implements ModuleLoader {
    private static final Logger LOG = LoggerFactory.getLogger(AbstractClasspathBasedModuleLoader.class);
    private final String resourcePath;
    private final EbeanServer ebean;

    /**
     * @param ebean the ebean server
     * @param resourcePath the resource path to load
     */
    public AbstractClasspathBasedModuleLoader(final EbeanServer ebean, final String resourcePath) {
        this.ebean = ebean;
        this.resourcePath = resourcePath;
    }

    @Override
    public int init() {
        LOG.debug("Loading entities for [{}]", this.resourcePath);
        final long currentTime = System.currentTimeMillis();

        final List<T> entities = readDataFile();

        // finally persist to database
        final int count = this.ebean.save(entities);

        final long duration = System.currentTimeMillis() - currentTime;
        LOG.info("Took {}ms to load {} entities from [{}]",
                new Object[] { Long.valueOf(duration), entities.size(), this.resourcePath });

        if (entities.size() != count) {
            LOG.warn("Loaded [{}] hotspots but was trying to load [{}]", count, entities.size());
        }
        return count;
    }

    /**
     * @return all entities that need to be loaded
     */
    private List<T> readDataFile() {
        LOG.debug("Reading resource [{}]", this.resourcePath);

        if (this.resourcePath.endsWith("index.txt")) {
            // then we're dealing with a directory, so parse multiple files
            return parseMultipleCsvFiles();
        }

        return parseSingleCsvFile(this.resourcePath);
    }

    /**
     * parses multiple files held in a index.txt file
     * 
     * @return the list of all loaded entities (or partially loaded if batches occur
     */
    private List<T> parseMultipleCsvFiles() {
        // read files one by one
        final String directory = this.resourcePath.substring(0, this.resourcePath.lastIndexOf('/') + 1);
        final InputStream stream = ModuleLoader.class.getResourceAsStream(this.resourcePath);
        final List<T> allEntities = new ArrayList<T>();
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(stream));
            String line = null;
            while ((line = reader.readLine()) != null) {
                if (!line.startsWith("--")) {
                    allEntities.addAll(parseSingleCsvFile(directory + line));
                }
            }
        } catch (final IOException e) {
            throw new StepInternalException("Unable to read index.txt file", e);
        } finally {
            closeQuietly(reader);
        }

        return allEntities;
    }

    /**
     * parses a single csv resource from the classpath
     * 
     * @param csvResource the classpath resource path
     * @return the list of loaded entities
     */
    private List<T> parseSingleCsvFile(final String csvResource) {
        // this uses a buffered reader internally
        Reader fileReader = null;
        InputStream stream = null;
        BufferedInputStream bufferedStream = null;
        try {
            stream = ModuleLoader.class.getResourceAsStream(csvResource);
            bufferedStream = new BufferedInputStream(stream);
            fileReader = new InputStreamReader(bufferedStream);
            return parseFile(fileReader);
        } finally {
            closeQuietly(fileReader);
            // closeQuietly(bufferedStream);
            closeQuietly(stream);
        }
    }

    /**
     * 
     * @param reader the reader to read the entities in raw form
     * @return the list of parsed entities of type T
     */
    protected abstract List<T> parseFile(Reader reader);

    /**
     * @return the ebean
     */
    protected EbeanServer getEbean() {
        return this.ebean;
    }
}
