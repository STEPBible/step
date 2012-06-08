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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.Properties;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.morphology.Morphology;
import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.service.impl.JSwordServiceImpl;

/**
 * Tests the loading of the geography loader
 * 
 * @author chrisburrell
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class LoaderTest extends DataDrivenTestExtension {
    @Mock
    private JSwordService jsword;

    /**
     * tests the openbible data
     */
    @Test
    public void testGeographyLoader() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.geography.openbible", "geography.tab");

        final Loader l = new Loader(this.jsword, getEbean(), coreProperties);
        assertEquals(4, l.loadOpenBibleGeography());
    }

    /**
     * tests the timeline
     */
    @Test
    public void testTimeline() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.timeline.events.directory", "timeline.csv");

        final Loader l = new Loader(this.jsword, getEbean(), coreProperties);
        assertEquals(4, l.loadTimeline());
    }

    /**
     * tests the timeline
     */
    @Test
    public void testHotSpots() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.timeline.hotspots", "hotspots.csv");
        final Loader l = new Loader(this.jsword, getEbean(), coreProperties);

        assertEquals(3, l.loadHotSpots());
    }

    /**
     * for this one we need a real jsword service because we will test that scripture refs are resolved
     * correctly.
     */
    @Test
    public void testDictionaryArticles() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.dictionary.easton", "dictionary_sample.txt");
        final Loader l = new Loader(new JSwordServiceImpl(null, null), getEbean(), coreProperties);
        final int count = l.loadDictionaryArticles();

        final int srCount = getEbean().find(ScriptureReference.class).findRowCount();
        assertEquals(4, count);
        assertTrue(srCount > 10);
    }

    /**
     * tests loading of robinson's morphology codes
     */
    @Test
    public void testRobinsonMorphology() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.morphology.robinson", "robinson_morphology.csv");
        final Loader l = new Loader(this.jsword, getEbean(), coreProperties);
        final int count = l.loadRobinsonMorphology();

        assertEquals(25, count);
        getEbean().find(Morphology.class, "V-2AAP-DSM");
    }
}
