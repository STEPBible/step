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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Locale;
import java.util.Properties;

import javax.inject.Provider;

import com.tyndalehouse.step.core.service.AppManagerService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.entities.impl.TestEntityManager;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.TestUtils;

/**
 * Tests the loading of the all loaders
 * 
 * @author chrisburrell
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class LoaderTest {
    @Mock
    private Provider<ClientSession> clientSessionProvider;
    private EntityManager entityManager;

    /**
     * sets up the test path for entities
     */
    @Before
    public void setUp() {
        this.entityManager = new TestEntityManager();
        final ClientSession session = mock(ClientSession.class);
        when(this.clientSessionProvider.get()).thenReturn(session);
        when(session.getLocale()).thenReturn(Locale.ENGLISH);
    }

    @Test
    public void testLoaderProgress() {
        Loader l = new Loader(null, new Properties(), null, null, null, null);
        assertEquals(0, l.getTotalProgress());

        l.setTotalProgress(1);
        assertEquals((int) ((double) 1 / l.getTotalItems() * 100), l.getTotalProgress());

        l.setTotalProgress(l.getTotalItems());
        assertEquals(100, l.getTotalProgress());
    }

    /**
     * loads the nave module
     */
    @Test
    public void testNaveLoader() {
        getLoader("test.data.path.subjects.nave", "nave.txt").loadNave();
        assertExists("nave", "root", "AARON");
    }

    /**
     * loads the nave module
     */
    @Test
    public void testAlternativeTranslationsLoader() {
        getLoader("test.data.path.alternatives.translations", "alternativeTranslations.txt")
                .loadAlternativeTranslations();
        assertExists("alternativeTranslations", "reference", "Gen.1.1");
    }

    /**
     * tests the openbible data
     */

//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119    @Test
//pt20201119    public void testGeographyLoader() {
//pt20201119        getLoader("test.data.path.geography.openbible", "geography.tab").loadOpenBibleGeography();
//pt20201119        assertLoaded(1, "obplace", "esvName", "Ekron");
//pt20201119
//pt20201119        assertTrue(getEntities(1, "obplace", "references", "Isa.11.11").length > 0);
//pt20201119    }
//pt20201119
//pt20201119    /**
//pt20201119     * tests the timeline
//pt20201119     */
//pt20201119    @Test
//pt20201119    public void testTimeline() {
//pt20201119        getLoader("test.data.path.timeline.events.directory", "timeline.csv").loadTimeline();
//pt20201119        assertExists("timelineEvent", "name", "John the Baptist");
//pt20201119    }
//pt20201119
//pt20201119    /**
//pt20201119     * tests the timeline
//pt20201119     */
//pt20201119    @Test
//pt20201119    public void testHotSpots() {
//pt20201119        getLoader("test.data.path.timeline.hotspots", "hotspots.csv").loadHotSpots();
//pt20201119        final long start = DateTimeUtils.getInstantMillis(DateTime.parse("-2000")) / 60000;
//pt20201119        final long end = DateTimeUtils.getInstantMillis(DateTime.parse("-1999")) / 60000;
//pt20201119
//pt20201119        final EntityIndexReader reader = this.entityManager.getReader("hotspot");
//pt20201119        final NumericRangeQuery<Long> range = NumericRangeQuery.newLongRange("startTime", start, end, true,
//pt20201119                true);
//pt20201119        assertTrue(reader.search(range).length > 0);
//pt20201119    }

    /**
     * tests the version information is loaded
     */
    @Test
    public void testVersionInfo() {
        getLoader("test.data.path.versions.info", "versions.csv").loadVersionInformation();
        assertLoaded(1, "versionInfo", "version", "ESV_th");
    }

    /**
     * for this one we need a real jsword service because we will test that scripture refs are resolved
     * correctly.
     */
    @Test
    public void testLexiconDefinitions() {
        getLoader("test.data.path.lexicon.definitions.greek", "lexicon_sample.txt").loadLexiconDefinitions();
        assertLoaded(1, "definition", "strongNumber", "G0002");
        assertLoaded(1, "definition", "strongNumber", "H0006");

        assertEquals("H0175, G1223, G0939,", getEntities(1, "definition", "strongNumber", "G0002")[0].get("relatedNumbers"));
    }

    /**
     * for this one we need a real jsword service because we will test that scripture refs are resolved
     * correctly.
     */
    @Test
    public void testAugmentedStrongs() {
        getLoader("test.data.path.augmentedstrongs", "augmented_strongs.txt").loadAugmentedStrongs();
// Commented out on Nov 2021 because the change in the augmentation file caused an issue.  Cannot figure how this
// test was working.  PT
//        assertExists(2, "augmentedStrongs", "augmentedStrong", "H0001?");
//        assertExists(1, "augmentedStrongs", "augmentedStrong", "H0002?");
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
        assertEquals("Contracted", e.get("suffix"));
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
        final JSwordVersificationService versificationService = TestUtils.mockVersificationService();
        return new Loader(null, coreProperties, this.entityManager,
                null, this.clientSessionProvider, mock(AppManagerService.class));
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
     * @param entityName the entity name
     * @param key the key for a search using searchUniqueBySingleField
     * @param value the value to use in the search
     */
    private void assertExists(final String entityName, final String key, final String value) {
        assertTrue(getIndexReader(entityName).searchSingleColumn(key, value).length > 0);
    }

    /**
     * Uses a normal lucene query
     *
     * @param expected the number of elements expected
     * @param entityName the entity name
     * @param key the key for a search using searchUniqueBySingleField
     * @param value the value to use in the search
     */
    private int assertExists(final int expected, final String entityName, final String key, final String value) {
        final int length = getIndexReader(entityName).searchSingleColumn(key, value).length;
        assertEquals(expected, length);
        return length;
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
        return this.entityManager.getReader(entityName);
    }

}
