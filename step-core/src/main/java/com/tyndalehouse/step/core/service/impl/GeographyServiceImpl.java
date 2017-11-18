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

import javax.inject.Inject;
import javax.inject.Singleton;

import org.apache.lucene.queryParser.QueryParser.Operator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.service.GeographyService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Returns geography data
 * 
 * @author cjburrell
 * 
 */
@Singleton
public class GeographyServiceImpl implements GeographyService {
    private static final String OPEN_BIBLE_VERSION = "ESV_th";
    private static final Logger LOG = LoggerFactory.getLogger(GeographyServiceImpl.class);
    private final JSwordPassageService jsword;
    private final EntityIndexReader openBiblePlaces;

    /**
     * creates a new Geography service implementation
     * 
     * @param manager the entity manager
     * @param jsword the jsword service for access to Crosswire functionality
     */
    @Inject
    public GeographyServiceImpl(final EntityManager manager, final JSwordPassageService jsword) {
        this.jsword = jsword;
        this.openBiblePlaces = manager.getReader("obplace");
    }

    @Override
    public EntityDoc[] getPlaces(final String reference) {
        LOG.debug("Returning places for reference [{}]", reference);

        final String allReferences = this.jsword.getAllReferences(reference, OPEN_BIBLE_VERSION);
        return this.openBiblePlaces.searchSingleColumn("references", allReferences, Operator.OR, false);
    }
}
