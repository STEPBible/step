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

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.common.GeoPrecision;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;

/**
 * tests the geography data retrieval queries
 * 
 * @author chrisburrell
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class GeographyServiceImplTest extends DataDrivenTestExtension {
    /**
     * Tests the successful path of registering a user
     */
    @Test
    public void testGetPlace() {
        // create a place
        final List<ScriptureReference> references = new ArrayList<ScriptureReference>();
        final ScriptureReference r = new ScriptureReference();
        r.setStartVerseId(10);
        r.setEndVerseId(10);
        references.add(r);

        final GeoPlace gp = new GeoPlace();
        gp.setEsvName("ESV Name");
        gp.setLatitude(10.0);
        gp.setLongitude(20.0);
        gp.setPrecision(GeoPrecision.EXACT);
        gp.setReferences(references);

        // save place
        super.getEbean().save(gp);

        // get place from reference, we check persistence-cascading worked correctly
        final List<GeoPlace> geoPlaces = super.getEbean().find(GeoPlace.class).findList();
        assertEquals(1, geoPlaces.size());
        assertEquals(1, geoPlaces.get(0).getReferences().size());

        final GeographyServiceImpl geo = new GeographyServiceImpl(getEbean(), new JSwordServiceImpl(null, null));
        final List<GeoPlace> places = geo.getPlaces("Genesis 1:1-15");

        assertEquals("ESV Name", places.get(0).getEsvName());
    }
}
