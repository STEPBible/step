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

import static com.tyndalehouse.step.core.data.entities.reference.SourceType.valueOf;
import static com.tyndalehouse.step.core.utils.EntityUtils.fillInTargetType;
import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.split;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.create.loaders.AbstractClasspathBasedModuleLoader;
import com.tyndalehouse.step.core.data.entities.DictionaryArticle;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.reference.TargetType;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Loads an Easton Dictionary
 * 
 * @author chrisburrell
 * 
 */
public class DictionaryLoader extends AbstractClasspathBasedModuleLoader<DictionaryArticle> {
    private static final Logger LOGGER = LoggerFactory.getLogger(DictionaryLoader.class);
    private static final Pattern BIBLE_LINK = Pattern
            .compile("\\[\\[([A-Za-z0-9:. ]+)\\|([A-Za-z0-9:. ]+)\\]\\]");
    private static final Pattern INTERNAL_LINK = Pattern
            .compile("\\[\\[([a-zA-Z']+)\\|?([a-zA-Z0-9'() ]*)\\]\\]");
    private static final int BATCH_ARTICLES = 100;
    private static final int DEFAULT_ARTICLE_SIZE = 1024 * 5;
    private static final String HEADWORD = "@Headword:";
    private static final String CLASS = "@Class:";
    private static final String STATUS = "@Status:";
    private static final String SOURCE = "@Source:";
    private static final String TEXT = "@Text:";
    private static final String ALL_REFS = "@AllRefs:";

    private final JSwordPassageService jsword;

    // state used during processing
    private int errors;
    private int count;
    private DictionaryArticle currentArticle;
    private List<DictionaryArticle> articles = new ArrayList<DictionaryArticle>();
    private StringBuilder articleText;

    /**
     * Loads up dictionary items
     * 
     * @param ebean the backend server
     * @param jsword the service to invoke sword modules
     * @param resourcePath the classpath to the data
     * @param transaction transaction manager for loader
     */
    public DictionaryLoader(final EbeanServer ebean, final JSwordPassageService jsword,
            final String resourcePath, final LoaderTransaction transaction) {
        super(ebean, resourcePath, transaction);
        this.jsword = jsword;
    }

    @Override
    protected List<DictionaryArticle> parseFile(final Reader reader) {
        final BufferedReader bufferedReader = new BufferedReader(reader);
        String line = null;

        try {
            while ((line = bufferedReader.readLine()) != null) {
                parseLine(line);
            }

            // save last article
            saveCurrentArticle();
        } catch (final IOException io) {
            LOGGER.warn(io.getMessage(), io);
        } finally {
            closeQuietly(bufferedReader);
        }

        LOGGER.info("Loaded [{}] dictionary articles with [{}] errors", this.count, this.errors);
        return this.articles;
    }

    /**
     * Parses a line by setting the current state of this loader appropriately
     * 
     * @param line the line that has been read from file
     */
    private void parseLine(final String line) {
        // deal with case where we are hitting a new word
        if (line.startsWith(HEADWORD)) {
            prepareNewArticle();
        }

        // are we dealing with a normal field
        if (line.length() > 0 && line.charAt(0) == '@') {
            // work out which fields and how to parse them
            parseField(line);
        } else {
            appendToArticleText(line);
        }
    }

    /**
     * Saves the current article, and if threshold is met, then saves to database
     */
    private void saveCurrentArticle() {
        if (this.currentArticle != null) {
            parseArticleText();
            this.articles.add(this.currentArticle);
        }

        // save in batches, so we won't be returning this set of articles
        if (this.articles.size() > BATCH_ARTICLES) {
            this.count += getEbean().save(this.articles);
            LOGGER.info("Saved [{}] items to database", this.count);
            this.articles = new ArrayList<DictionaryArticle>();
        }

    }

    /**
     * sets the appropriate state and saves articles in batches to prevent too much going into memory
     */
    private void prepareNewArticle() {
        saveCurrentArticle();
        this.currentArticle = new DictionaryArticle();
        this.articleText = new StringBuilder(DEFAULT_ARTICLE_SIZE);
    }

    /**
     * appends a paragraph mark if the line is empty, or appends the content of the line if not.
     * 
     * @param line the line with its content.
     */
    private void appendToArticleText(final String line) {
        if (isEmpty(line)) {
            // empty line, so let's put a paragraph mark in
            this.articleText.append("<p />");
        } else {
            // text field content + 1 space
            this.articleText.append(line);
            this.articleText.append(' ');
        }
    }

    /**
     * transforms the article into HTML
     */
    void parseArticleText() {
        final String articleContentRaw = this.articleText.toString().trim();
        final Matcher bibleLinkMatcher = BIBLE_LINK.matcher(articleContentRaw);
        final String articleWithBibleRefs = bibleLinkMatcher
                .replaceAll("<a onclick='viewPassage(this, \"$2\")'>$1</a>");

        final Matcher internalLinkMatcher = INTERNAL_LINK.matcher(articleWithBibleRefs);

        this.currentArticle.setText(internalLinkMatcher.replaceAll("<a onclick='goToArticle(\""
                + this.currentArticle.getSource().name() + "\", \"$1\", \"$2\")'>$1</a>"));
    }

    /**
     * parses a simple field by examining the type and setting the content (or appending the content to a
     * 
     * @param line the line content including field name and value
     */
    private void parseField(final String line) {
        if (line.startsWith(HEADWORD)) {
            // headwords may contain several articles
            this.currentArticle.setHeadword(parseFieldContent(HEADWORD, line));
            this.currentArticle.setHeadwordInstance(parseHeadwordInstance(this.currentArticle.getHeadword()));
            LOGGER.debug("Loading article [{}] - [{}]", this.currentArticle.getHeadword(),
                    this.currentArticle.getHeadwordInstance());
        } else if (line.startsWith(CLASS)) {
            // assuming 1 character-length
            this.currentArticle.setClazz(parseFieldContent(CLASS, line).charAt(0));
        } else if (line.startsWith(STATUS)) {
            this.currentArticle.setStatus(parseFieldContent(STATUS, line));
        } else if (line.startsWith(SOURCE)) {
            this.currentArticle.setSource(valueOf(parseFieldContent(SOURCE, line).toUpperCase()));
        } else if (line.startsWith(TEXT)) {
            this.currentArticle.setText(parseFieldContent(TEXT, line));
        } else if (line.startsWith(ALL_REFS)) {
            final String fieldContent = parseFieldContent(ALL_REFS, line);

            parseAllRefs(fieldContent);
        } else {
            LOGGER.error("Field [{}] not recognised", line);
        }
    }

    /**
     * @param fieldContent the references to be parsed and set onto the article
     */
    private void parseAllRefs(final String fieldContent) {
        // we'll assume for now that we are always split by ; but we will warn otherwise
        final String[] refs = split(fieldContent, "[ ]?;[ ]?");
        final List<ScriptureReference> allRefs = new ArrayList<ScriptureReference>();

        // iterate through all references found
        for (final String s : refs) {
            List<ScriptureReference> references = new ArrayList<ScriptureReference>();
            try {
                references = this.jsword.resolveReferences(s, "KJV");
                fillInTargetType(references, TargetType.DICTIONARY_ARTICLE);
            } catch (final StepInternalException e) {
                this.errors++;
                LOGGER.error("Cannot resolve reference " + s + " for article "
                        + this.currentArticle.getHeadword());
                LOGGER.trace("Unable to resolve references", e);
            }
            allRefs.addAll(references);
        }

        if (allRefs.isEmpty()) {
            // we warn because we found nothing
            LOGGER.warn("No references found for Article [{}]", this.currentArticle.getHeadword());

        }
        this.currentArticle.setScriptureReferences(allRefs);
    }

    /**
     * return the number of the headword
     * 
     * @param headword the headword to examine
     * @return the instance number of the article
     */
    int parseHeadwordInstance(final String headword) {
        // examine last character
        if (headword.charAt(headword.length() - 1) == ')') {
            final int parenthesis = headword.lastIndexOf('(');
            if (parenthesis == -1) {
                return 1;
            }

            final String headwordMarker = headword.substring(parenthesis + 1, headword.length() - 1);
            try {
                return Integer.parseInt(headwordMarker);
            } catch (final NumberFormatException e) {
                LOGGER.warn(e.getMessage(), e);
                return 1;
            }
        }

        return 1;
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

    /**
     * @param currentArticle the currentArticle to set
     */
    void setCurrentArticle(final DictionaryArticle currentArticle) {
        this.currentArticle = currentArticle;
    }

    /**
     * @param articleText the articleText to set
     */
    void setArticleText(final StringBuilder articleText) {
        this.articleText = articleText;
    }
}
