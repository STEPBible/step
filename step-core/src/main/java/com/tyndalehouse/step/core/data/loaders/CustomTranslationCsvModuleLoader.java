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

import java.io.IOException;
import java.util.List;

import au.com.bytecode.opencsv.CSVReader;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.create.LoaderTransaction;
import com.tyndalehouse.step.core.data.loaders.translations.CsvTranslation;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Deals with headers as a csv module
 * 
 * @param <T> the class of the object to be loaded
 * @author chrisburrell
 * 
 */
public class CustomTranslationCsvModuleLoader<T> extends CsvModuleLoader<T> {
    private final CsvTranslation<T> translation;

    /**
     * @param server the persistence server
     * @param resourcePath the path to the resource to be loaded
     * @param clazz the class of the object we wish to load
     * @param translation to translation to apply in order to obtain our entities
     * @param transaction the transaction for the loader
     */
    public CustomTranslationCsvModuleLoader(final EbeanServer server, final String resourcePath,
            final Class<T> clazz, final CsvTranslation<T> translation, final LoaderTransaction transaction) {
        super(server, resourcePath, clazz, transaction);
        this.translation = translation;
    }

    /**
     * @param server the persistence server
     * @param resourcePath the path to the resource to be loaded
     * @param clazz the class of the object we wish to load
     * @param translation to translation to apply in order to obtain our entities
     * @param csvSeparator the separator if the default of ',' is not desired
     * @param transaction the transaction for the loader
     */
    public CustomTranslationCsvModuleLoader(final EbeanServer server, final String resourcePath,
            final Class<T> clazz, final CsvTranslation<T> translation, final char csvSeparator,
            final LoaderTransaction transaction) {
        super(server, resourcePath, clazz, csvSeparator, transaction);
        this.translation = translation;
    }

    @Override
    protected List<T> parseCsvFile(final CSVReader csvReader) {
        try {
            final CsvData data = new CsvData(csvReader.readAll());
            return this.translation.parseAll(data);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to load file", e);
        }
    }
}
