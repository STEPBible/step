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

import org.apache.lucene.search.NumericRangeQuery;
import org.joda.time.DateTime;
import org.joda.time.DateTimeUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.entities.impl.TestEntityManager;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordVersificationServiceImpl;

/**
 * Tests the loading of the all loaders
 * 
 * @author chrisburrell
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class LoaderTest {
    private EntityManager entityManager;

    /**
     * sets up the test path for entities
     */
    @Before
    public void setUp() {
        this.entityManager = new TestEntityManager();
    }

    /**
     * tests the openbible data
     */
    @Test
    public void testGeographyLoader() {
        getLoader("test.data.path.geography.openbible", "geography.tab").loadOpenBibleGeography();
        assertLoaded(1, "obplace", "esvName", "Ekron");

        assertTrue(getEntities(1, "obplace", "references", "Isa.11.11").length > 0);
    }

    /**
     * tests the timeline
     */
    @Test
    public void testTimeline() {
        getLoader("test.data.path.timeline.events.directory", "timeline.csv").loadTimeline();
        assertExists(1, "timelineEvent", "name", "John the Baptist");
    }

    /**
     * tests the timeline
     */
    @Test
    public void testHotSpots() {
        getLoader("test.data.path.timeline.hotspots", "hotspots.csv").loadHotSpots();
        final long start = DateTimeUtils.getInstantMillis(DateTime.parse("-2000")) / 60000;
        final long end = DateTimeUtils.getInstantMillis(DateTime.parse("-1999")) / 60000;

        final EntityIndexReader reader = this.entityManager.getReader("hotspot");
        final NumericRangeQuery<Long> range = NumericRangeQuery.newLongRange("startTime", start, end, true,
                true);
        assertTrue(reader.search(range).length > 0);
    }

    /**
     * tests the version information is loaded
     */
    @Test
    public void testVersionInfo() {
        getLoader("test.data.path.versions.info", "versions.csv").loadVersionInformation();
        assertLoaded(1, "versionInfo", "version", "ESV");
    }

    /**
     * for this one we need a real jsword service because we will test that scripture refs are resolved
     * correctly.
     */
    @Test
    public void testLexiconDefinitions() {
        getLoader("test.data.path.lexicon.definitions.greek", "lexicon_sample.txt").loadLexiconDefinitions();
        assertLoaded(1, "definition", "strongNumber", "G0132");
    }

    /**
     * for this one we need a real jsword service because we will test that scripture refs are resolved
     * correctly.
     */
    @Test
    public void testSpecificForms() {
        final Loader l = getLoader("test.data.path.lexicon.forms", "specific_forms.txt");
        l.loadSpecificForms();
        assertLoaded(4, "specificForm", "strongNumber", "GC001");
    }

    /**
     * tests loading of robinson's morphology codes
     */
    @Test
    public void testRobinsonMorphology() {
        getLoader("test.data.path.morphology.robinson", "robinson_morphology.csv").loadRobinsonMorphology();

        // check verb columns
        EntityDoc[] entities = getEntities(1, "morphology", "code", "V-2AAP-DSM");
        EntityDoc e = entities[0];
        assertEquals("Verb", e.get("function"));
        assertEquals("2nd Aorist", e.get("tense"));
        assertEquals("Active", e.get("voice"));
        assertEquals("Participle", e.get("mood"));
        assertEquals("Dative", e.get("case"));
        assertEquals("Singular", e.get("number"));
        assertEquals("Masculine", e.get("gender"));

        // check person and function
        entities = getEntities(1, "morphology", "code", "F-1ASM");
        e = entities[0];
        assertEquals("1st", e.get("person"));
        assertEquals("Reflexive pronoun", e.get("function"));

        // check person and function
        entities = getEntities(1, "morphology", "code", "F-1ASM");
        e = entities[0];
        assertEquals("1st", e.get("person"));
        assertEquals("Reflexive pronoun", e.get("function"));

        entities = getEntities(1, "morphology", "code", "D-NPM-C");
        e = entities[0];
        assertEquals("Contracted form", e.get("suffix"));
    }

    /**
     * Gets a loader to be tested
     * 
     * @param key the key to the properties
     * @param file where the file that should be tested is
     * @return the loader
     */
    private Loader getLoader(final String key, final String file) {
        final Properties coreProperties = new Properties();
        coreProperties.put(key, file);
        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();
        return new Loader(new JSwordPassageServiceImpl(versificationService, null, null, null), null,
                coreProperties, this.entityManager);
    }

    /**
     * Uses an "exact term" approach
     * 
     * @param num the number of entities that should be loaded
     * @param entityName the entity name
     * @param key the key for a search using searchUniqueBySingleField
     * @param value the value to use in the search
     */
    private void assertLoaded(final int num, final String entityName, final String key, final String value) {
        final EntityDoc[] searchUniqueBySingleField = getEntities(num, entityName, key, value);
        assertEquals(num, searchUniqueBySingleField.length);
    }

    /**
     * Uses a normal lucene query
     * 
     * @param num the number of entities that should be loaded
     * @param entityName the entity name
     * @param key the key for a search using searchUniqueBySingleField
     * @param value the value to use in the search
     */
    private void assertExists(final int num, final String entityName, final String key, final String value) {
        getIndexReader(entityName).searchSingleColumn(key, value);
    }

    /**
     * Returns all the entities found
     * 
     * @param num the max number
     * @param entityName the name of the entity
     * @param key the key to the search field
     * @param value the value
     * @return all found entities, within numb
     */
    private EntityDoc[] getEntities(final int num, final String entityName, final String key,
            final String value) {
        final EntityIndexReader reader = getIndexReader(entityName);
        return reader.searchExactTermBySingleField(key, num, value);
    }

    /**
     * @param entityName name of entity
     * @return reader to the relevant index
     */
    private EntityIndexReader getIndexReader(final String entityName) {
        final EntityIndexReader reader = this.entityManager.getReader(entityName);
        return reader;
    }

}
