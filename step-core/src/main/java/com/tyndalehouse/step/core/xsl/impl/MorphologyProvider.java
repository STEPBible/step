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
import com.tyndalehouse.step.core.data.caches.MorphologyCache;
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
        try {
            if (code.length() > ROBINSON_PREFIX_LENGTH) {
                final String key = code.substring(ROBINSON_PREFIX_LENGTH);

                // lookup key in cache
                final String cachedRepresentation = this.cache.get(key);
                if (cachedRepresentation != null) {
                    return cachedRepresentation;
                }

                LOGGER.trace("Cached missed for key [{}]", code);
                final Morphology morphology = this.ebean.find(Morphology.class, key);

                // exit straight away if null
                if (morphology == null) {
                    // then place element in cache for empty string
                    this.cache.put(key, "");
                    return "";
                }

                return getHtmlForMorph(key, functionCall, morphology);
            }
            return "";
            // CHECKSTYLE:OFF
        } catch (final Exception x) {
            // CHECKSTYLE:ON
            // we catch all exceptions as want to at least render something
            LOGGER.error(x.getMessage(), x);
            return "";
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
        html.append("<a href='");
        html.append(functionCall);
        html.append("' title='");

        if (morphology.getGender() != null) {
            html.append(morphology.getGender());
            html.append(SPACE_SEPARATOR);
        }

        if (morphology.getNumber() != null) {
            html.append(morphology.getNumber());
            html.append(SPACE_SEPARATOR);
        }

        html.append("'>");
        html.append(morphology.getFunction());
        html.append("</a>");

        final String s = html.toString();
        this.cache.put(key, s);
        return s;
    }
}
