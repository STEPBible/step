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
//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119package com.tyndalehouse.step.core.service.impl;
//pt20201119
//pt20201119import javax.inject.Inject;
//pt20201119import javax.inject.Singleton;
//pt20201119
//pt20201119import org.apache.lucene.queryParser.QueryParser.Operator;
//pt20201119import org.slf4j.Logger;
//pt20201119import org.slf4j.LoggerFactory;
//pt20201119
//pt20201119import com.tyndalehouse.step.core.data.EntityManager;
//pt20201119import com.tyndalehouse.step.core.data.EntityDoc;
//pt20201119import com.tyndalehouse.step.core.data.EntityIndexReader;
//pt20201119import com.tyndalehouse.step.core.service.GeographyService;
//pt20201119import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Returns geography data
 * 
 * @author cjburrell
 * 
 */
//pt20201119@Singleton
//pt20201119public class GeographyServiceImpl implements GeographyService {
//pt20201119    private static final String OPEN_BIBLE_VERSION = "ESV_th";
//pt20201119    private static final Logger LOG = LoggerFactory.getLogger(GeographyServiceImpl.class);
//pt20201119    private final JSwordPassageService jsword;
//pt20201119    private final EntityIndexReader openBiblePlaces;
//pt20201119
//pt20201119    /**
//pt20201119     * creates a new Geography service implementation
//pt20201119     *
//pt20201119     * @param manager the entity manager
//pt20201119     * @param jsword the jsword service for access to Crosswire functionality
//pt20201119     */
//pt20201119    @Inject
//pt20201119    public GeographyServiceImpl(final EntityManager manager, final JSwordPassageService jsword) {
//pt20201119        this.jsword = jsword;
//pt20201119        this.openBiblePlaces = manager.getReader("obplace");
//pt20201119    }
//pt20201119
//pt20201119    @Override
//pt20201119    public EntityDoc[] getPlaces(final String reference) {
//pt20201119        LOG.debug("Returning places for reference [{}]", reference);
//pt20201119
//pt20201119        final String allReferences = this.jsword.getAllReferences(reference, OPEN_BIBLE_VERSION);
//pt20201119        return this.openBiblePlaces.searchSingleColumn("references", allReferences, Operator.OR, false);
//pt20201119    }
//pt20201119}
