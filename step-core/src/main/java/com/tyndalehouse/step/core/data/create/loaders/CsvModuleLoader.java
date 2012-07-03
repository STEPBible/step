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

import java.beans.PropertyEditorManager;
import java.io.Reader;
import java.util.List;

import org.joda.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVReader;
import au.com.bytecode.opencsv.bean.CsvToBean;
import au.com.bytecode.opencsv.bean.MappingStrategy;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.create.loaders.editors.CaseEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.FunctionEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.GenderEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.LocalDateTimeEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.MoodEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.NumberEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.PersonEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.SuffixEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.TenseEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.TimeUnitTypeEditor;
import com.tyndalehouse.step.core.data.create.loaders.editors.VoiceEditor;
import com.tyndalehouse.step.core.data.entities.morphology.Case;
import com.tyndalehouse.step.core.data.entities.morphology.Function;
import com.tyndalehouse.step.core.data.entities.morphology.Gender;
import com.tyndalehouse.step.core.data.entities.morphology.Mood;
import com.tyndalehouse.step.core.data.entities.morphology.Number;
import com.tyndalehouse.step.core.data.entities.morphology.Person;
import com.tyndalehouse.step.core.data.entities.morphology.Suffix;
import com.tyndalehouse.step.core.data.entities.morphology.Tense;
import com.tyndalehouse.step.core.data.entities.morphology.Voice;
import com.tyndalehouse.step.core.data.entities.reference.TimeUnitType;

/**
 * Loads modules straight from a CSV file to a database form
 * 
 * @param <T> the type of the class to load
 * @author chrisburrell
 * 
 */
public class CsvModuleLoader<T> extends AbstractClasspathBasedModuleLoader<T> {
    private static final Logger LOG = LoggerFactory.getLogger(CsvModuleLoader.class);
    private final MappingStrategy<T> columnMappingStrategy;
    private char separator = ',';

    static {
        PropertyEditorManager.registerEditor(LocalDateTime.class, LocalDateTimeEditor.class);
        PropertyEditorManager.registerEditor(TimeUnitType.class, TimeUnitTypeEditor.class);
        PropertyEditorManager.registerEditor(Case.class, CaseEditor.class);
        PropertyEditorManager.registerEditor(Function.class, FunctionEditor.class);
        PropertyEditorManager.registerEditor(Gender.class, GenderEditor.class);
        PropertyEditorManager.registerEditor(Mood.class, MoodEditor.class);
        PropertyEditorManager.registerEditor(Number.class, NumberEditor.class);
        PropertyEditorManager.registerEditor(Person.class, PersonEditor.class);
        PropertyEditorManager.registerEditor(Suffix.class, SuffixEditor.class);
        PropertyEditorManager.registerEditor(Tense.class, TenseEditor.class);
        PropertyEditorManager.registerEditor(Voice.class, VoiceEditor.class);
    }

    /**
     * @param ebean the ebean server
     * @param resourcePath the resource path to load
     * @param columnMappingStrategy the strategy to use to map the entities
     * @param action the action to use to post process.
     */
    public CsvModuleLoader(final EbeanServer ebean, final String resourcePath,
            final MappingStrategy<T> columnMappingStrategy, final PostProcessingAction<T> action) {
        super(ebean, resourcePath, action);
        this.columnMappingStrategy = columnMappingStrategy;
    }

    /**
     * @param ebean the ebean server
     * @param resourcePath the resource path to load
     * @param columnMappingStrategy the strategy to use to map the entities
     * @param separator specifies the delimited found in the "c"sv file (e.g. \t)
     */
    public CsvModuleLoader(final EbeanServer ebean, final String resourcePath,
            final MappingStrategy<T> columnMappingStrategy, final char separator) {
        this(ebean, resourcePath, columnMappingStrategy, null);
        this.separator = separator;
    }

    /**
     * @param ebean the data persistence to write to
     * @param resourcePath the path of the resource to load
     * @param clazz the type of resource to load
     */
    public CsvModuleLoader(final EbeanServer ebean, final String resourcePath, final Class<T> clazz) {
        this(ebean, resourcePath, new HeaderNameMappingStrategy<T>(clazz), null);
    }

    /**
     * @param ebean the data persistence to write to
     * @param resourcePath the path of the resource to load
     * @param clazz the type of resource to load
     * @param action the post processing action
     */
    public CsvModuleLoader(final EbeanServer ebean, final String resourcePath, final Class<T> clazz,
            final PostProcessingAction<T> action) {
        this(ebean, resourcePath, new HeaderNameMappingStrategy<T>(clazz), action);
    }

    /**
     * @param ebean the data persistence to write to
     * @param resourcePath the path of the resource to load
     * @param clazz the type of resource to load
     * @param separator the csv separator, e.g. \t
     */
    public CsvModuleLoader(final EbeanServer ebean, final String resourcePath, final Class<T> clazz,
            final char separator) {
        this(ebean, resourcePath, clazz);
        this.separator = separator;
    }

    @Override
    protected List<T> parseFile(final Reader reader) {
        CSVReader csvReader = null;
        try {
            LOG.debug("Parsing file with a CsvReader");
            csvReader = new CSVReader(reader, this.separator);
            return parseCsvFile(csvReader);
        } finally {
            closeQuietly(csvReader);
        }
    }

    /**
     * Default method for parsing file, uses column strategy
     * 
     * @param csvReader the csv reader
     * @return the list of entities of type T
     */
    protected List<T> parseCsvFile(final CSVReader csvReader) {
        final CsvToBean<T> csv = new CsvToBean<T>();
        return csv.parse(this.columnMappingStrategy, csvReader);
    }
}
