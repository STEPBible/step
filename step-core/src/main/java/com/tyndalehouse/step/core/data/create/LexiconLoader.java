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
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityIndexWriter;
import com.tyndalehouse.step.core.data.loaders.AbstractClasspathBasedModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Loads an Easton Dictionary
 * 
 * @author chrisburrell
 * 
 */
public class LexiconLoader extends AbstractClasspathBasedModuleLoader<Object> {
    private static final Logger LOGGER = LoggerFactory.getLogger(LexiconLoader.class);
    private static final String START_TOKEN = "==============";

    // state used during processing
    private int errors;
    private int count;
    private final EntityIndexWriter writer;

    /**
     * Loads up dictionary items
     * 
     * @param writer the lucene index writer
     * @param resourcePath the classpath to the data
     */
    public LexiconLoader(final EntityIndexWriter writer, final String resourcePath) {
        super(null, resourcePath, null);
        this.writer = writer;
    }

    @Override
    protected List<Object> parseFile(final Reader reader) {
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
        saveCurrentDefinition();

        LOGGER.info("Loaded [{}] dictionary articles with [{}] errors", this.count, this.errors);
        return new ArrayList<Object>();
    }

    /**
     * Parses a line by setting the current state of this loader appropriately
     * 
     * @param line the line that has been read from file
     */
    private void parseLine(final String line) {
        // deal with case where we are hitting a new word
        if (line.endsWith(START_TOKEN)) {
            prepareNewDefinition();
        }

        parseField(line);
    }

    /**
     * Saves the current article, and if threshold is met, then saves to database
     */
    private void saveCurrentDefinition() {
        this.writer.save();

        // if (this.currentDefinition != null) {
        // processTransliterations();
        // processDefaultsIfNull();
        // processLowerCasings();
        // getEbean().save(this.currentDefinition);
        // this.count++;
        //
        // if (this.count % 2000 == 0) {
        // this.transaction.flushCommitAndContinue();
        //
        // LOGGER.info("Saved [{}] lexical entries.", this.count);
        // }
        // }
    }

    // private void processDefaultsIfNull() {
    // if (this.currentDefinition.getBlacklisted() == null) {
    // this.currentDefinition.setBlacklisted(Boolean.FALSE);
    // }
    // }

    // /**
    // * Sets various fields to their lower case equivalence
    // */
    // private void processLowerCasings() {
    // final String strongPronunc = this.currentDefinition.getStrongPronunc();
    // if (strongPronunc != null) {
    // this.currentDefinition.setStrongPronunc(strongPronunc.toLowerCase());
    // }
    //
    // final String strongTranslit = this.currentDefinition.getStrongTranslit();
    // if (strongTranslit != null) {
    // this.currentDefinition.setStrongTranslit(strongTranslit.toLowerCase());
    // }
    //
    // final String alternative = this.currentDefinition.getAlternativeTranslit1();
    // if (alternative != null) {
    // final String lowerAlternative = alternative.toLowerCase();
    // if (this.isGreek) {
    // this.currentDefinition.setAlternativeTranslit1(toBetaLowercase(lowerAlternative));
    // } else {
    // this.currentDefinition.setAlternativeTranslit1(lowerAlternative.replace("#", ""));
    // }
    // }
    //
    // final String unaccentedAlternative = this.currentDefinition.getAlternativeTranslit1Unaccented();
    // if (unaccentedAlternative != null) {
    // if (this.isGreek) {
    // this.currentDefinition.setAlternativeTranslit1Unaccented(unaccentedAlternative.toLowerCase());
    // } else {
    // this.currentDefinition.setAlternativeTranslit1Unaccented(unaccentedAlternative.replace("#",
    // ""));
    // }
    // } else if (alternative != null) {
    // if (this.isGreek) {
    // this.currentDefinition.setAlternativeTranslit1Unaccented(toBetaUnaccented(alternative
    // .toLowerCase()));
    // } else {
    // this.currentDefinition.setAlternativeTranslit1Unaccented(alternative.toLowerCase());
    // }
    // }
    //
    // final String accentedUnicode = this.currentDefinition.getAccentedUnicode();
    // if (accentedUnicode != null) {
    // final String lowerCaseAccentedUnicode = accentedUnicode.toLowerCase();
    // this.currentDefinition.setAccentedUnicode(lowerCaseAccentedUnicode);
    // this.currentDefinition.setUnaccentedUnicode(StringConversionUtils.unAccent(
    // lowerCaseAccentedUnicode, true));
    // }
    // }

    /**
     * sets the appropriate state and saves articles in batches to prevent too much going into memory
     */
    private void prepareNewDefinition() {
        saveCurrentDefinition();

        // this.currentDefinition = new Definition();
    }

    //
    // private void initLuceneMappings() {
    // this.config = new HashMap<String, FieldConfig>();
    //
    // // stored and indexed
    // this.config.put("@StrNo", new FieldConfig(STRONG_NUMBER, Store.YES, Index.NOT_ANALYZED));
    // this.config.put("@UnicodeAccented", new FieldConfig(ACCENTED_UNICODE, Store.YES, Index.NOT_ANALYZED));
    // this.config.put("@StrUnicodeAccented", new FieldConfig(ACCENTED_UNICODE, Store.YES,
    // Index.NOT_ANALYZED));
    // this.config.put("@AllRelatedNos", new FieldConfig(RELATED_NOS, Store.YES, Index.ANALYZED));
    // this.config.put("@StepGloss", new FieldConfig(STEP_GLOSS, Store.YES, Index.ANALYZED));
    // this.config
    // .put("@StrBetaAccented", new FieldConfig(ALTERNATIVE_TRANSLIT1, Store.YES, Index.ANALYZED));
    //
    // // stored not indexed
    // this.config.put("@MounceShortDef", new FieldConfig(SHORT_DEF, Store.YES, Index.NO));
    // this.config.put("@MounceMedDef", new FieldConfig(MEDIUM_DEF, Store.YES, Index.NO));
    // this.config.put("@StopWord", new FieldConfig(STOP_WORD, Store.YES, Index.NO));
    // this.config.put("@LsjDefs", new FieldConfig(LSJ_DEFS, Store.YES, Index.NO));
    // this.config.put("@BdbMedDef", new FieldConfig(MEDIUM_DEF, Store.YES, Index.NO));
    // this.config.put("@AcadTransAccented", new FieldConfig(ALTERNATIVE_TRANSLIT1, Store.NO,
    // Index.NOT_ANALYZED));
    // this.config.put("@AcadTransUnaccented", new FieldConfig(ALTERNATIVE_TRANSLIT1_UNACCENTED, Store.NO,
    // Index.NOT_ANALYZED));
    //
    // // indexed not stored
    // this.config.put("@2llUnaccented", new FieldConfig(TWO_LETTER_LOOKUP, Store.NO, Index.NOT_ANALYZED));
    // this.config.put("@StrTranslit", new FieldConfig(STRONG_TRANSLITERATION, Store.NO, Index.ANALYZED));
    // this.config.put("@StrPronunc", new FieldConfig(STRONG_PRONUNC, Store.NO, Index.ANALYZED));
    //
    // // config.put("@LsjBetaUnaccented", new FieldConfig(ALTERNATIVE_TRANSLIT1_UNACCENTED);
    //
    // // hebrew specific mappings
    //
    // // temp - TODO - remove when fields have been renamed
    //
    // }

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

    // /**
    // * Tries other mappings to process the field with
    // *
    // * @param fieldName the name of the field
    // * @param fieldValue the value of the field
    // */
    // private void tryOtherMappings(final String fieldName, final String fieldValue) {
    // if ("@Translations".equals(fieldName)) {
    // final String[] translations = fieldValue.split("[|]");
    //
    // for (final String alternative : translations) {
    // final Translation t = new Translation();
    // t.setAlternativeTranslation(alternative);
    //
    // List<Translation> currentTranslations = this.currentDefinition.getTranslations();
    // if (currentTranslations == null) {
    // currentTranslations = new ArrayList<Translation>();
    // this.currentDefinition.setTranslations(currentTranslations);
    // }
    // currentTranslations.add(t);
    // }
    // }
    // }

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
