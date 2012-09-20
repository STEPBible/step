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

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.adaptForUnaccentedTransliteration;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.toBetaLowercase;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.toBetaUnaccented;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.transliterate;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.create.loaders.AbstractClasspathBasedModuleLoader;
import com.tyndalehouse.step.core.data.entities.lexicon.Definition;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Loads an Easton Dictionary
 * 
 * @author chrisburrell
 * 
 */
public class LexiconLoader extends AbstractClasspathBasedModuleLoader<Definition> {
    private static final Logger LOGGER = LoggerFactory.getLogger(LexiconLoader.class);
    // private static final int BATCH_DEFINITIONS = 500;
    private static final String START_TOKEN = "==============";

    // state used during processing
    private int errors;
    private int count;
    private Definition currentDefinition;
    private Map<String, Method> methodMappings;
    private int uncommittedDefinitions = 0;

    /**
     * Loads up dictionary items
     * 
     * @param ebean the backend server
     * @param resourcePath the classpath to the data
     */
    public LexiconLoader(final EbeanServer ebean, final String resourcePath) {
        super(ebean, resourcePath);
        initMappings();
    }

    @Override
    protected List<Definition> parseFile(final Reader reader) {
        final BufferedReader bufferedReader = new BufferedReader(reader);
        String line = null;

        try {
            while ((line = bufferedReader.readLine()) != null) {
                parseLine(line);
            }

            // save last article
            saveCurrentDefinition();
        } catch (final IOException io) {
            LOGGER.warn(io.getMessage(), io);
        } finally {
            closeQuietly(bufferedReader);
        }

        processStrongLinks();
        processTransliterations();

        LOGGER.info("Loaded [{}] dictionary articles with [{}] errors", this.count, this.errors);
        return new ArrayList<Definition>();
    }

    /**
     * creates transliterations for all definitions
     */
    private void processTransliterations() {
        long timeSaving = 0;
        long timeTransliterating = 0;
        long timeLast = 0;

        long timeStart = 0;
        long timeA = 0;
        long timeB = 0;
        long timeC = 0;
        long timeD = 0;
        long timeE = 0;
        long timeF = 0;
        final long timeG = 0;

        // run on a clean set of beans
        getEbean().currentTransaction().flushBatch();

        // now we need to add transliterations
        // Given we are doing this with H2, we could use a java function, but best not to tie ourselves down
        final List<Definition> definitions = getEbean().find(Definition.class).select("*").where()
                .isNotNull("accentedUnicode").findList();
        int countTransliterations = 0;
        for (final Definition def : definitions) {

            timeStart = timeLast = System.currentTimeMillis();
            final String transliteration = transliterate(def.getAccentedUnicode());
            timeF += System.currentTimeMillis() - timeLast;
            timeLast = System.currentTimeMillis();

            def.setStepTransliteration(transliteration);
            timeA += System.currentTimeMillis() - timeLast;
            timeLast = System.currentTimeMillis();

            def.setUnaccentedStepTransliteration(adaptForUnaccentedTransliteration(def
                    .getStepTransliteration()));
            timeB += System.currentTimeMillis() - timeLast;
            timeLast = System.currentTimeMillis();

            final String strongPronunc = def.getStrongPronunc();
            if (strongPronunc != null) {
                def.setStrongPronunc(strongPronunc.toLowerCase());
            }
            timeC += System.currentTimeMillis() - timeLast;
            timeLast = System.currentTimeMillis();

            final String strongTranslit = def.getStrongTranslit();
            if (strongTranslit != null) {
                def.setStrongTranslit(strongTranslit.toLowerCase());
            }
            timeD += System.currentTimeMillis() - timeLast;
            timeLast = System.currentTimeMillis();

            final String betaForm = def.getLsjWordBeta();
            if (betaForm != null) {
                final String lowerBeta = betaForm.toLowerCase();
                def.setLsjWordBeta(toBetaLowercase(lowerBeta));
                def.setLsjWordBetaUnaccented(toBetaUnaccented(lowerBeta));
            }
            timeE += System.currentTimeMillis() - timeLast;
            timeLast = System.currentTimeMillis();

            timeTransliterating += System.currentTimeMillis() - timeStart;

            timeLast = System.currentTimeMillis();
            getEbean().save(def);
            timeSaving += System.currentTimeMillis() - timeLast;

            countTransliterations++;
            if (countTransliterations % 500 == 0) {
                // getEbean().commitTransaction();
                // this.ebean.currentTransaction().flushBatch();
                LOGGER.warn("Times A [{}], B [{}], C [{}], D [{}], E [{}]", new Object[] { timeA, timeB,
                        timeC, timeD, timeE });

                LOGGER.warn("Saved [{}] transliterations. Time taken: parsing: [{}], loading: [{}]",
                        new Object[] { countTransliterations, timeTransliterating, timeSaving });
            }

            // batch.add(def);
            // if (batch.size() >= BATCH_DEFINITIONS) {
            // LOGGER.debug("Saving transliterations [{}] / [{}]", countTransliterations, definitions.size());
            // getEbean().save(batch);
            // LOGGER.debug("Saved transliterations ");
            // batch = new ArrayList<Definition>(BATCH_DEFINITIONS);
            // }
        }
    }

    /**
     * Creates the links between all strong numbers
     */
    private void processStrongLinks() {
        // flush everything so far
        getEbean().currentTransaction().flushBatch();

        // now we need to post-process all of the fields
        final List<Definition> allDefs = getEbean().find(Definition.class)
                .select("id,strongNumber,relatedNos").fetch("similarStrongs").where().isNotNull("relatedNos")
                .findList();

        // now reverse code them all
        final Map<String, Definition> codedByStrongNumber = new HashMap<String, Definition>();
        for (final Definition def : allDefs) {
            codedByStrongNumber.put(def.getStrongNumber(), def);
        }

        int countLinks = 0;
        for (final Definition def : allDefs) {

            final String[] strongNumbers = split(def.getRelatedNos());
            final StringBuilder newRelatedStrongs = new StringBuilder(strongNumbers.length * 16);
            for (int ii = 0; ii < strongNumbers.length; ii++) {
                // look up the strong correspondance
                final Definition relatedStrong = codedByStrongNumber.get(strongNumbers[ii]);

                if (relatedStrong == null) {
                    LOGGER.error("Unable to reference strong [{}]. [{}] is incomplete.", strongNumbers[ii],
                            def.getStrongNumber());
                    continue;
                }

                def.getSimilarStrongs().add(relatedStrong);

                // also replace the string value
                newRelatedStrongs.append(relatedStrong.getAccentedUnicode());
                if (ii + 1 < strongNumbers.length) {
                    newRelatedStrongs.append(' ');
                }
            }

            // replace the related strong field:
            def.setRelatedNos(newRelatedStrongs.toString());

            getEbean().save(def);
            countLinks++;

            if (countLinks % 500 == 0) {
                // getEbean().commitTransaction();
                LOGGER.debug("Created links for [{}] definitions", countLinks);
            }
        }
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

        if (this.currentDefinition != null) {
            this.uncommittedDefinitions++;
            getEbean().save(this.currentDefinition);
        }

        // if (this.uncommittedDefinitions % 500 == 0) {
        // getEbean().commitTransaction();
        // this.ebean.currentTransaction().flushBatch();
        // }
    }

    /**
     * sets the appropriate state and saves articles in batches to prevent too much going into memory
     */
    private void prepareNewDefinition() {
        saveCurrentDefinition();
        this.currentDefinition = new Definition();
    }

    // /**
    // * transforms the article into HTML
    // */
    // void parseArticleText() {
    // final String articleContentRaw = this.articleText.toString().trim();
    // final Matcher bibleLinkMatcher = BIBLE_LINK.matcher(articleContentRaw);
    // final String articleWithBibleRefs = bibleLinkMatcher
    // .replaceAll("<a onclick='viewPassage(this, \"$2\")'>$1</a>");
    //
    // final Matcher internalLinkMatcher = INTERNAL_LINK.matcher(articleWithBibleRefs);
    //
    // this.currentArticle.setText(internalLinkMatcher.replaceAll("<a onclick='goToArticle(\""
    // + this.currentArticle.getSource().name() + "\", \"$1\", \"$2\")'>$1</a>"));
    // }

    /**
     * Sets up the mappings between field names and methods
     */
    private void initMappings() {
        this.methodMappings = new HashMap<String, Method>(32);
        final Class<Definition> defClass = Definition.class;

        try {
            this.methodMappings.put("@LsjBetaUnaccented",
                    defClass.getDeclaredMethod("setLsjWordBeta", String.class));
            this.methodMappings.put("@LSJ-Defs", defClass.getDeclaredMethod("setLsjDefs", String.class));
            this.methodMappings.put("@StrNo", defClass.getDeclaredMethod("setStrongNumber", String.class));
            this.methodMappings.put("@UnicodeAccented",
                    defClass.getDeclaredMethod("setAccentedUnicode", String.class));
            this.methodMappings.put("@UnaccentedUnicode",
                    defClass.getDeclaredMethod("setUnaccentedUnicode", String.class));
            this.methodMappings.put("@StrTranslit",
                    defClass.getDeclaredMethod("setStrongTranslit", String.class));
            this.methodMappings.put("@StrPronunc",
                    defClass.getDeclaredMethod("setStrongPronunc", String.class));
            this.methodMappings.put("@StrRelatedNos",
                    defClass.getDeclaredMethod("setRelatedNos", String.class));
            this.methodMappings.put("@MounceShortDef",
                    defClass.getDeclaredMethod("setMShortDef", String.class));
            this.methodMappings.put("@MounceMedDef", defClass.getDeclaredMethod("setMMedDef", String.class));
            this.methodMappings.put("@StepGloss", defClass.getDeclaredMethod("setStepGloss", String.class));

        } catch (final NoSuchMethodException e) {
            throw new StepInternalException("Unable to find matching method", e);
        }
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

        final String fieldName = line.substring(0, tabIndex - 1);

        final Method method = this.methodMappings.get(fieldName);
        if (method == null) {
            LOGGER.trace("Unable to map [{}]", fieldName);
            return;
        }

        // get value
        final int startValue = tabIndex + 1;
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

        try {
            method.invoke(this.currentDefinition, fieldValue);
        } catch (final ReflectiveOperationException e) {
            throw new StepInternalException("Unable to call method for field " + fieldName, e);
        }
    }

    // /**
    // * @param fieldContent the references to be parsed and set onto the article
    // */
    // private void parseAllRefs(final String fieldContent) {
    // // we'll assume for now that we are always split by ; but we will warn otherwise
    // final String[] refs = split(fieldContent, "[ ]?;[ ]?");
    // final List<ScriptureReference> allRefs = new ArrayList<ScriptureReference>();
    //
    // // iterate through all references found
    // for (final String s : refs) {
    // List<ScriptureReference> references = new ArrayList<ScriptureReference>();
    // try {
    // references = this.jsword.resolveReferences(s, "KJV");
    // fillInTargetType(references, TargetType.DICTIONARY_ARTICLE);
    // } catch (final StepInternalException e) {
    // this.errors++;
    // LOGGER.error("Cannot resolve reference " + s + " for article "
    // + this.currentArticle.getHeadword());
    // LOGGER.trace("Unable to resolve references", e);
    // }
    // allRefs.addAll(references);
    // }
    //
    // if (allRefs.isEmpty()) {
    // // we warn because we found nothing
    // LOGGER.warn("No references found for Article [{}]", this.currentArticle.getHeadword());
    //
    // }
    // this.currentArticle.setScriptureReferences(allRefs);
    // }

    // /**
    // * return the number of the headword
    // *
    // * @param headword the headword to examine
    // * @return the instance number of the article
    // */
    // int parseHeadwordInstance(final String headword) {
    // // examine last character
    // if (headword.charAt(headword.length() - 1) == ')') {
    // final int parenthesis = headword.lastIndexOf('(');
    // if (parenthesis == -1) {
    // return 1;
    // }
    //
    // final String headwordMarker = headword.substring(parenthesis + 1, headword.length() - 1);
    // try {
    // return Integer.parseInt(headwordMarker);
    // } catch (final NumberFormatException e) {
    // LOGGER.warn(e.getMessage(), e);
    // return 1;
    // }
    // }
    //
    // return 1;
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

    // /**
    // * @param currentArticle the currentArticle to set
    // */
    // void setCurrentArticle(final DictionaryArticle currentArticle) {
    // this.currentArticle = currentArticle;
    // }

    // /**
    // * @param articleText the articleText to set
    // */
    // void setArticleText(final StringBuilder articleText) {
    // this.articleText = articleText;
    // }
}
