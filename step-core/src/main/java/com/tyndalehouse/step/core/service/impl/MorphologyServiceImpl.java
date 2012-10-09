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
package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.utils.StringUtils.split;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.service.MorphologyService;

/**
 * Provides quick access to the morphology from a code found in the xsl transformation
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class MorphologyServiceImpl implements MorphologyService {
    private static final String SPACE_SEPARATOR = " ";
    private static final Logger LOGGER = LoggerFactory.getLogger(MorphologyServiceImpl.class);
    private static final String ROBINSON_PREFIX = "robinson:";
    private static final int ROBINSON_PREFIX_LENGTH = ROBINSON_PREFIX.length();
    private static final String NON_BREAKING_SPACE = "&nbsp;";
    // private final EbeanServer ebean;
    // private final MorphologyCache cache;
    private final EntityIndexReader morphology;

    /**
     * @param manager the entity manager
     */
    @Inject
    public MorphologyServiceImpl(final EntityManager manager) {
        this.morphology = manager.getReader("morphology");
    }

    @Override
    public List<EntityDoc> getMorphology(final String code) {
        // split code into keys
        final String[] codes = split(code, SPACE_SEPARATOR);
        final List<EntityDoc> morphs = new ArrayList<EntityDoc>(codes.length);
        for (final String c : codes) {
            // check cache for key, otherwise obtain from database
            final EntityDoc item = retrieveMorphologyByLongName(c);

            if (item != null) {
                morphs.add(item);
            }
        }
        return morphs;
    }

    @Override
    public List<EntityDoc> getQuickMorphology(final String code) {
        // very little information available, so let's return it all
        return getMorphology(code);
    }

    /**
     * Cache-based method, retrieves morphology information
     * 
     * @param code long code including scheme (e.g. robinson:) to the morphology item
     * @return the morphology of interest
     */
    private EntityDoc retrieveMorphologyByLongName(final String code) {
        if (code.length() > ROBINSON_PREFIX_LENGTH) {
            final String key = code.substring(ROBINSON_PREFIX_LENGTH);

            final long currentTimeNanos = System.nanoTime();
            final EntityDoc[] entry = this.morphology.searchUniqueBySingleField("code", 1, key);
            LOGGER.debug("Took [{}] nano-seconds", System.nanoTime() - currentTimeNanos);
            return entry.length > 0 ? entry[0] : null;
            // final Morphology entry = this.cache.get(key);
            // if (entry != null) {
            // LOGGER.trace("Cache hit for key [{}]", key);
            // return entry;
            // }

            // LOGGER.trace("Cache miss for key [{}]", key);
            // final Morphology morphFromDb = this.ebean.find(Morphology.class, key);

            // put in cache regardless
            // if (morphFromDb != null) {
            // this.cache.put(key, morphFromDb);
            // return morphFromDb;
            // } else {
            // return null;
            // }
        }
        return null;
    }

    /**
     * @param code the code encountered during the xsl transformation
     * @return the string to be displayed to the user
     */
    public String getDisplayMorphology(final String code) {
        final List<EntityDoc> morphologies = getMorphology(code);
        final StringBuilder sb = new StringBuilder(128);
        for (final EntityDoc m : morphologies) {
            sb.append(m.get("inlineHtml"));
            sb.append(NON_BREAKING_SPACE);
        }
        return sb.toString();
    }
}
