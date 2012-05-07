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
import static org.apache.commons.lang.StringUtils.split;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.LineIterator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.entities.DictionaryArticle;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Loads an Easton Dictionary
 * 
 * @author chrisburrell
 * 
 */
public class DictionaryLoader implements ModuleLoader {
    private static final Logger LOGGER = LoggerFactory.getLogger(DictionaryLoader.class);
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
    public DictionaryLoader(final EbeanServer ebean, final JSwordService jsword,
            @Named("test.data.path.easton") final String dataPath) {
        this.ebean = ebean;
        this.jsword = jsword;
        this.dataPath = dataPath;
    }

    // TODO Need to test for a large file, as this reads everything into memory!
    @Override
    public int init() {
        LineIterator lineIterator = null;
        InputStream placeFileStream = null;
        final List<DictionaryArticle> articles = new ArrayList<DictionaryArticle>();

        try {
            placeFileStream = getClass().getResourceAsStream(this.dataPath);
            lineIterator = IOUtils.lineIterator(placeFileStream, Charset.defaultCharset());

            String line = null;
            StringBuilder bigField = new StringBuilder(DEFAULT_ARTICLE_SIZE);
            DictionaryArticle article = new DictionaryArticle();
            while (lineIterator.hasNext()) {
                line = lineIterator.next();

                if (line == null) {
                    continue;
                }

                // deal with case where we are hitting a new word
                if (line.startsWith(HEADWORD)) {
                    article.setText(bigField.toString().trim());
                    articles.add(article);

                    article = new DictionaryArticle();
                    bigField = new StringBuilder();
                }

                // are we dealing with a normal field
                if (line.length() > 0 && line.charAt(0) == '@') {
                    // work out which fields first
                    parseField(article, line);
                } else {
                    // text field content + 1 space
                    bigField.append(line);
                    bigField.append(' ');
                }
            }
        } catch (final IOException io) {
            LOGGER.warn(io.getMessage(), io);
        } finally {
            LineIterator.closeQuietly(lineIterator);
            IOUtils.closeQuietly(placeFileStream);
        }

        final int count = this.ebean.save(articles);

        LOGGER.info("Loaded [{}] dictionary articles", count);

        return count;
    }

    /**
     * parses a simple field by examining the type and setting the content (or appending the content to a
     * 
     * @param article the article entity
     * @param line the line content including field name and value
     */
    private void parseField(final DictionaryArticle article, final String line) {
        if (line.startsWith(HEADWORD)) {
            article.setHeadword(getFieldContent(HEADWORD, line));
        } else if (line.startsWith(CLASS)) {
            // assuming 1 character-length
            article.setClazz(getFieldContent(CLASS, line).charAt(0));
        } else if (line.startsWith(STATUS)) {
            article.setStatus(getFieldContent(STATUS, line));
        } else if (line.startsWith(SOURCE)) {
            article.setSource(valueOf(getFieldContent(SOURCE, line).toUpperCase()));
        } else if (line.startsWith(TEXT)) {
            article.setText(getFieldContent(TEXT, line));
        } else if (line.startsWith(ALL_REFS)) {
            final String fieldContent = getFieldContent(ALL_REFS, line);

            // we'll assume for now that we are always split by ; but we will warn otherwise
            final String[] refs = split(fieldContent, "; ");
            final List<ScriptureReference> allRefs = new ArrayList<ScriptureReference>();
            for (final String s : refs) {
                final List<ScriptureReference> references = this.jsword.getPassageReferences(s,
                        DICTIONARY_ARTICLE);
                if (references.isEmpty()) {
                    // we warn because we found nothing
                    LOGGER.warn("No reference found for [{}]", s);
                } else {
                    allRefs.addAll(references);
                }
            }

            article.setScriptureReferences(allRefs);
        } else {
            LOGGER.error("Field [{}] not recognised", line);
        }
    }

    /**
     * Helper method that gets a trimmed string out
     * 
     * @param fieldName the name of the field
     * @param line the content of the line
     * @return the portion of string representing the string value of the field declared in that line
     */
    String getFieldContent(final String fieldName, final String line) {
        return line.substring(fieldName.length() + 1).trim();
    }
}
