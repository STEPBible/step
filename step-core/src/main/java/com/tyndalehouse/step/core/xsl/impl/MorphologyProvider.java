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
package com.tyndalehouse.step.core.xsl.impl;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.caches.morphology.MorphCacheEntry;
import com.tyndalehouse.step.core.data.caches.morphology.MorphologyCache;
import com.tyndalehouse.step.core.data.entities.morphology.Morphology;

/**
 * Provides quick access to the morphology from a code found in the xsl transformation
 * 
 * @author chrisburrell
 * 
 */
public class MorphologyProvider {
    private static final String SPACE_SEPARATOR = " ";
    private static final Logger LOGGER = LoggerFactory.getLogger(MorphologyProvider.class);
    private static final String ROBINSON_PREFIX = "robinson:";
    private static final int ROBINSON_PREFIX_LENGTH = ROBINSON_PREFIX.length();
    private static final String NON_BREAKING_SPACE = "&nbsp;";
    private final EbeanServer ebean;
    private final MorphologyCache cache;

    /**
     * @param ebean the ebean server to access the information
     * @param cache the cache storing all the morphology information
     */
    @Inject
    public MorphologyProvider(final EbeanServer ebean, final MorphologyCache cache) {
        this.ebean = ebean;
        this.cache = cache;
    }

    /**
     * @param code the code encountered during the xsl transformation
     * @param functionCall a javascript function name that gets invoked on click
     * @return the string to be displayed to the user
     */
    public String getDisplayMorphology(final String code, final String functionCall) {
        if (code.length() > ROBINSON_PREFIX_LENGTH) {
            // lookup from cache first
            final String key = code.substring(ROBINSON_PREFIX_LENGTH);

            // lookup key in cache, in the case we are dealing with a single morph, exit early (optimistic)
            final MorphCacheEntry entry = this.cache.get(key);
            if (entry != null) {
                return entry.getInlineHtml();
            }

            // at this point we have no hit, bad luck...
            // a single code is just a variant on multiple codes?
            return multipleMorphologicalTagging(key, functionCall);
        }
        return NON_BREAKING_SPACE;
    }

    /**
     * 
     * @param compoundKey a compound key
     * @param functionCall the javascript function to be called
     * @return the correct string representation, which is the concatenation of the Strings of the individual
     *         codes found
     */
    private String multipleMorphologicalTagging(final String compoundKey, final String functionCall) {
        final int firstSpace = compoundKey.indexOf(' ');
        if (firstSpace != -1) {
            // looking at compound keys
            final String singleHtmlMorph;

            // first key may be in cache
            final String firstKey = compoundKey.substring(0, firstSpace);
            final MorphCacheEntry entry = this.cache.get(firstKey);
            if (entry != null) {
                singleHtmlMorph = entry.getInlineHtml();
            } else {
                singleHtmlMorph = getSingleMorphology(firstKey, functionCall);
            }

            // now deal with new key
            final String newKey = getNextKey(compoundKey, firstSpace);
            if (newKey == null) {
                // no valid key was found
                return singleHtmlMorph + NON_BREAKING_SPACE;
            }

            // we may have this in the cache already
            // lookup key in cache
            final MorphCacheEntry newKeyEntry = this.cache.get(newKey);
            if (newKeyEntry != null) {
                // if so, then this was the last key, so we can return immediately
                return singleHtmlMorph + NON_BREAKING_SPACE + newKeyEntry.getInlineHtml();
            }

            // if we didn't get a cache hit, then we may have more keys, or it may not have been loaded...
            return singleHtmlMorph + NON_BREAKING_SPACE + multipleMorphologicalTagging(newKey, functionCall);
        }

        // we only have one key
        return getSingleMorphology(compoundKey, functionCall);
    }

    /**
     * gets the next key in line
     * 
     * @param compoundKey the compound key as a whole
     * @param firstSpace the first space encountered
     * @return the next key in line
     */
    private String getNextKey(final String compoundKey, final int firstSpace) {
        if (compoundKey.length() > firstSpace + 1) {
            String nextKey = compoundKey.substring(firstSpace + 1);
            if (nextKey.startsWith(ROBINSON_PREFIX)) {
                nextKey = nextKey.substring(ROBINSON_PREFIX_LENGTH);
            }
            return nextKey;
        }
        return null;
    }

    /**
     * @param key the short-hand key encountered during the xsl transformation
     * @param functionCall a javascript function name that gets invoked on click
     * @return the string to be displayed to the user
     */
    private String getSingleMorphology(final String key, final String functionCall) {
        try {
            LOGGER.trace("Cached missed for key [{}]", key);
            final Morphology morphology = this.ebean.find(Morphology.class, key);

            // exit straight away if null
            if (morphology == null) {
                // then place element in cache for empty string
                this.cache.put(key, new MorphCacheEntry(NON_BREAKING_SPACE, ""));
                return NON_BREAKING_SPACE;
            }

            return getHtmlForMorph(key, functionCall, morphology);

            // CHECKSTYLE:OFF
        } catch (final Exception x) {
            // CHECKSTYLE:ON
            // we catch all exceptions as want to at least render something
            LOGGER.error(x.getMessage(), x);
            return NON_BREAKING_SPACE;
        }
    }

    /**
     * @param key the key of the morphology that is being looked up
     * @param functionCall the function call to put in the href/click event
     * @param morphology the morphology to render
     * @return the rendered string
     */
    private String getHtmlForMorph(final String key, final String functionCall, final Morphology morphology) {
        final StringBuilder html = new StringBuilder(128);
        html.append("<span "); // href='
        // html.append(functionCall);
        // html.append("(\"");
        // html.append(key);
        html.append("title='"); // \")'

        if (morphology.getFunction() != null && morphology.getFunction().getNotes() != null) {
            html.append(morphology.getFunction().getNotes());
            html.append(SPACE_SEPARATOR);
        }

        if (morphology.getTense() != null) {
            html.append(morphology.getTense());
            html.append(SPACE_SEPARATOR);

            if (morphology.getTense().getNotes() != null) {
                html.append(morphology.getTense().getNotes());
                html.append(SPACE_SEPARATOR);
            }
        }

        appendNonNullSpacedItem(html, morphology.getGender());
        appendNonNullSpacedItem(html, morphology.getNumber());

        html.append("' class='");

        final int cssStart = html.length();
        appendGenderClass(html, morphology);
        appendNumberClass(html, morphology);

        // get new length if length has changed, so that we can key the css classes separately

        String cssClasses = null;
        if (html.length() != cssStart) {
            cssClasses = html.substring(cssStart);
        }

        html.append("'>");
        html.append(morphology.getFunction());
        html.append("</span>");

        final String s = html.toString();
        this.cache.put(key, new MorphCacheEntry(s, cssClasses));
        return s;
    }

    /**
     * Appends the class for the Number (plural/singular)
     * 
     * @param html the current content
     * @param morphology the morphology entity
     */
    private void appendNumberClass(final StringBuilder html, final Morphology morphology) {
        if (morphology.getNumber() != null) {
            appendNonNullSpacedItem(html, morphology.getNumber().getCssClass());
        }
    }

    /**
     * appends the right gender css class
     * 
     * @param html the current string
     * @param morphology the morphology entity that is being scanned
     */
    private void appendGenderClass(final StringBuilder html, final Morphology morphology) {
        if (morphology.getGender() != null) {
            appendNonNullSpacedItem(html, morphology.getGender().getCssClass());
        }
    }

    /**
     * adds an item with a space afterwards if the item is not null
     * 
     * @param html the current content
     * @param item the item to add
     */
    private void appendNonNullSpacedItem(final StringBuilder html, final Object item) {
        if (item != null) {
            html.append(item);
            html.append(SPACE_SEPARATOR);
        }
    }

}
