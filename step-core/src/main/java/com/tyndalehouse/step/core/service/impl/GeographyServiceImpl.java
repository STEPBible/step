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

import static java.lang.String.format;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.service.GeographyService;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Returns geography data
 * 
 * @author cjburrell
 * 
 */
@Singleton
public class GeographyServiceImpl implements GeographyService {
    private static final Logger LOG = LoggerFactory.getLogger(GeographyServiceImpl.class);
    private final EbeanServer ebean;
    private final JSwordService jsword;

    /**
     * creates a new Geography service implementation
     * 
     * @param ebean ebean server
     * @param jsword the jsword service for access to Crosswire functionality
     */
    @Inject
    public GeographyServiceImpl(final EbeanServer ebean, final JSwordService jsword) {
        this.ebean = ebean;
        this.jsword = jsword;
    }

    @Override
    public List<GeoPlace> getPlaces(final String reference) {
        LOG.debug("Returning places for reference [{}]", reference);
        final List<ScriptureReference> passageReferences = this.jsword.resolveReferences(reference, "KJV");
        final List<GeoPlace> placesInScope = new ArrayList<GeoPlace>();

        // TODO rewrite in ebean form
        final String rawQuery = "t0.id in (select geo_place_id from scripture_reference "
                + "where start_verse_id <= %s and end_verse_id >= %s and geo_place_id is not null)";

        for (final ScriptureReference sr : passageReferences) {
            placesInScope.addAll(this.ebean.find(GeoPlace.class).where()
                    .raw(format(rawQuery, sr.getEndVerseId(), sr.getStartVerseId())).findList());
        }

        return placesInScope;
    }
}
