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

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVReader;

import com.tyndalehouse.step.core.data.entities.KeyedEntity;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.utils.StepIOUtils;

/**
 * provides functionality for parsing CSV files
 * 
 * @author cjburrell
 * 
 */
public abstract class AbstractCsvModuleLoader {
    private static final Logger LOG = LoggerFactory.getLogger(AbstractCsvModuleLoader.class);

    /**
     * loads data from a csv file
     * 
     * @param resourceName the resource name to load
     * @param csvDataMapper the mapper that will be used to construct a entity
     * @param <K> a type representing the keyed entity
     * @return a map of entities loaded from the CSV file
     */
    protected <K extends KeyedEntity> Map<String, K> load(final String resourceName,
            final CsvDataMapper<K> csvDataMapper) {
        final Map<String, K> elements = new HashMap<String, K>();

        CSVReader reader = null;
        try {
            LOG.debug("Loading {}", resourceName);
            reader = new CSVReader(new InputStreamReader(getClass().getResourceAsStream(resourceName)));
            final CsvData data = new CsvData(reader.readAll());

            for (int ii = 0; ii < data.size(); ii++) {
                final K entity = csvDataMapper.mapRow(ii, data);
                elements.put(entity.getCode(), entity);
            }
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        } finally {
            StepIOUtils.closeQuietly(reader);
        }
        return elements;
    }
}
