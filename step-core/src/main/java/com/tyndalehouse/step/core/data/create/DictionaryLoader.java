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
import static com.tyndalehouse.step.core.data.entities.reference.TargetType.DICTIONARY_ARTICLE;
import static org.apache.commons.io.IOUtils.lineIterator;
import static org.apache.commons.lang.StringUtils.isEmpty;
import static org.apache.commons.lang.StringUtils.split;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.inject.Inject;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.LineIterator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.entities.DictionaryArticle;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Loads an Easton Dictionary
 * 
 * @author chrisburrell
 * 
 */
public class DictionaryLoader implements ModuleLoader {
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

    private final EbeanServer ebean;
    private final String dataPath;
    private final JSwordService jsword;

    /**
     * Loads up dictionary items
     * 
     * @param ebean the backend server
     * @param jsword the service to invoke sword modules
     * @param dataPath the classpath to the data
     */
    @Inject
    public DictionaryLoader(final EbeanServer ebean, final JSwordService jsword,
            @Named("test.data.path.dictionary.easton") final String dataPath) {
        this.ebean = ebean;
        this.jsword = jsword;
        this.dataPath = dataPath;
    }

    @Override
    public int init() {
        int count = 0;
        int errors = 0;
        LineIterator lineIterator = null;
        InputStream placeFileStream = null;
        List<DictionaryArticle> articles = new ArrayList<DictionaryArticle>();

        try {
            placeFileStream = getClass().getResourceAsStream(this.dataPath);
            lineIterator = lineIterator(placeFileStream, Charset.defaultCharset());

            String line = null;
            StringBuilder bigField = new StringBuilder(DEFAULT_ARTICLE_SIZE);
            DictionaryArticle article = null;
            while (lineIterator.hasNext()) {
                line = lineIterator.next();

                // deal with case where we are hitting a new word
                if (line.startsWith(HEADWORD)) {
                    if (article != null) {
                        parseArticleText(article, bigField);
                        articles.add(article);
                    }

                    // save in batches
                    if (articles.size() > BATCH_ARTICLES) {
                        count += this.ebean.save(articles);
                        articles = new ArrayList<DictionaryArticle>();
                    }

                    article = new DictionaryArticle();
                    bigField = new StringBuilder();
                }

                // are we dealing with a normal field
                if (line.length() > 0 && line.charAt(0) == '@') {
                    // work out which fields first
                    errors += parseField(article, line);
                } else {
                    appendToArticleText(bigField, line);
                }
            }
        } catch (final IOException io) {
            LOGGER.warn(io.getMessage(), io);
        } finally {
            LineIterator.closeQuietly(lineIterator);
            IOUtils.closeQuietly(placeFileStream);
        }

        count += this.ebean.save(articles);
        LOGGER.info("Loaded [{}] dictionary articles with [{}] errors", count, errors);
        return count;
    }

    /**
     * appends a paragraph mark if the line is empty, or appends the content of the line if not.
     * 
     * @param bigField the stringbuilder containing the article text
     * @param line the line with its content.
     */
    private void appendToArticleText(final StringBuilder bigField, final String line) {
        if (isEmpty(line)) {
            // empty line, so let's put a paragraph mark in
            bigField.append("<p />");
        } else {
            // text field content + 1 space
            bigField.append(line);
            bigField.append(' ');
        }
    }

    /**
     * transforms the article into HTML
     * 
     * @param article the article currently populated with loaded values
     * @param text the content of the article in raw form
     */
    void parseArticleText(final DictionaryArticle article, final StringBuilder text) {
        final String articleContentRaw = text.toString().trim();
        final Matcher bibleLinkMatcher = BIBLE_LINK.matcher(articleContentRaw);
        final String articleWithBibleRefs = bibleLinkMatcher
                .replaceAll("<a onclick='viewPassage(this, \"$2\")'>$1</a>");

        final Matcher internalLinkMatcher = INTERNAL_LINK.matcher(articleWithBibleRefs);

        article.setText(internalLinkMatcher.replaceAll("<a onclick='goToArticle(\""
                + article.getSource().name() + "\", \"$1\", \"$2\")'>$1</a>"));
    }

    /**
     * parses a simple field by examining the type and setting the content (or appending the content to a
     * 
     * @param article the article entity
     * @param line the line content including field name and value
     * @return the number of errors encountered
     */
    private int parseField(final DictionaryArticle article, final String line) {
        int errors = 0;
        if (line.startsWith(HEADWORD)) {
            // headwords may contain several articles
            article.setHeadword(parseFieldContent(HEADWORD, line));

            article.setHeadwordInstance(parseHeadwordInstance(article.getHeadword()));
        } else if (line.startsWith(CLASS)) {
            // assuming 1 character-length
            article.setClazz(parseFieldContent(CLASS, line).charAt(0));
        } else if (line.startsWith(STATUS)) {
            article.setStatus(parseFieldContent(STATUS, line));
        } else if (line.startsWith(SOURCE)) {
            article.setSource(valueOf(parseFieldContent(SOURCE, line).toUpperCase()));
        } else if (line.startsWith(TEXT)) {
            article.setText(parseFieldContent(TEXT, line));
        } else if (line.startsWith(ALL_REFS)) {
            final String fieldContent = parseFieldContent(ALL_REFS, line);

            // we'll assume for now that we are always split by ; but we will warn otherwise
            final String[] refs = split(fieldContent, "; ");
            final List<ScriptureReference> allRefs = new ArrayList<ScriptureReference>();
            for (final String s : refs) {
                List<ScriptureReference> references = new ArrayList<ScriptureReference>();
                try {
                    references = this.jsword.getPassageReferences(s, DICTIONARY_ARTICLE, "KJV");
                } catch (final StepInternalException e) {
                    errors++;
                    LOGGER.error("Cannot resolve reference " + s + " for article " + article.getHeadword());
                    LOGGER.trace("Unable to resolve references", e);
                }
                allRefs.addAll(references);
            }

            if (allRefs.isEmpty()) {
                // we warn because we found nothing
                LOGGER.warn("No references found for Article [{}]", article.getHeadword());

            }
            article.setScriptureReferences(allRefs);
        } else {
            LOGGER.error("Field [{}] not recognised", line);
        }

        return errors;
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
}
