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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.lexicon.Definition;
import com.tyndalehouse.step.core.data.entities.morphology.Case;
import com.tyndalehouse.step.core.data.entities.morphology.Function;
import com.tyndalehouse.step.core.data.entities.morphology.Gender;
import com.tyndalehouse.step.core.data.entities.morphology.Mood;
import com.tyndalehouse.step.core.data.entities.morphology.Morphology;
import com.tyndalehouse.step.core.data.entities.morphology.Number;
import com.tyndalehouse.step.core.data.entities.morphology.Person;
import com.tyndalehouse.step.core.data.entities.morphology.Suffix;
import com.tyndalehouse.step.core.data.entities.morphology.Tense;
import com.tyndalehouse.step.core.data.entities.morphology.Voice;
import com.tyndalehouse.step.core.models.HasCsvValueName;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordVersificationServiceImpl;

/**
 * Tests the loading of the geography loader
 * 
 * @author chrisburrell
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class LoaderTest extends DataDrivenTestExtension {
    private static final Logger LOG = LoggerFactory.getLogger(LoaderTest.class);

    @Mock
    private JSwordPassageService jsword;

    /**
     * tests the openbible data
     */
    @Test
    public void testGeographyLoader() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.geography.openbible", "geography.tab");

        final Loader l = new Loader(this.jsword, null, getEbean(), coreProperties);
        assertEquals(4, l.loadOpenBibleGeography());
    }

    /**
     * tests the timeline
     */
    @Test
    public void testTimeline() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.timeline.events.directory", "timeline.csv");

        final Loader l = new Loader(this.jsword, null, getEbean(), coreProperties);
        assertEquals(4, l.loadTimeline());
    }

    /**
     * tests the timeline
     */
    @Test
    public void testHotSpots() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.timeline.hotspots", "hotspots.csv");
        final Loader l = new Loader(this.jsword, null, getEbean(), coreProperties);

        assertEquals(3, l.loadHotSpots());
    }

    /**
     * for this one we need a real jsword service because we will test that scripture refs are resolved
     * correctly.
     */
    @Test
    public void testLexiconDefinitions() {

        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.lexicon.definitions", "step_gklexwithlsj-abridged3.txt");

        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();

        final Loader l = new Loader(new JSwordPassageServiceImpl(versificationService, null, null), null,
                getEbean(), coreProperties);
        final int count = l.loadLexiconDefinitions();

        assertEquals(19, count);
    }

    /**
     * for this one we need a real jsword service because we will test that scripture refs are resolved
     * correctly.
     */
    @Test
    public void testLexicalForms() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.lexicon.forms", "lexical_forms.txt");
        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();
        final Loader l = new Loader(new JSwordPassageServiceImpl(versificationService, null, null), null,
                getEbean(), coreProperties);

        // add G1 and G10 so that foreign key relationships are possible
        final Definition d1 = new Definition();
        d1.setStrongNumber("G1");

        final Definition d2 = new Definition();
        d2.setStrongNumber("G10");

        getEbean().save(d1);
        getEbean().save(d2);

        final int count = l.loadLexicalForms();

        assertTrue(count > 10);
    }

    /**
     * for this one we need a real jsword service because we will test that scripture refs are resolved
     * correctly.
     */
    @Test
    public void testDictionaryArticles() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.dictionary.easton", "dictionary_sample.txt");

        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();

        final Loader l = new Loader(new JSwordPassageServiceImpl(versificationService, null, null), null,
                getEbean(), coreProperties);
        final int count = l.loadDictionaryArticles();

        final int srCount = getEbean().find(ScriptureReference.class).findRowCount();
        assertEquals(4, count);
        assertTrue(srCount > 10);
    }

    // /**
    // * checks that the lexicon is loaded correctly with all its references
    // */
    // @Test
    // public void testLexicon() {
    // final Properties coreProperties = new Properties();
    // coreProperties.put("test.data.path.lexicon", "lexicon.csv");
    // final Loader l = new Loader(new JSwordPassageServiceImpl(null, null, null), null, getEbean(),
    // coreProperties);
    //
    // final int count = l.loadLexicon();
    // assertEquals(5, count);
    //
    // final LexiconDefinition firstStrong = getEbean().find(LexiconDefinition.class).where()
    // .eq("strong", "G0016").findUnique();
    //
    // assertEquals("G0016", firstStrong.getStrong());
    // assertFalse(firstStrong.getRelatedStrongs().contains("G0015"));
    // final List<LexiconDefinition> similarStrongs = firstStrong.getSimilarStrongs();
    //
    // assertEquals(4, similarStrongs.size());
    //
    // }

    /**
     * tests loading of robinson's morphology codes
     */
    @Test
    public void testRobinsonMorphology() {
        final Properties coreProperties = new Properties();
        coreProperties.put("test.data.path.morphology.robinson", "robinson_morphology.csv");
        final Loader l = new Loader(this.jsword, null, getEbean(), coreProperties);
        final int count = l.loadRobinsonMorphology();

        final Morphology m1 = getEbean().find(Morphology.class, "V-2AAP-DSM");

        // check verb columns
        assertEquals(Function.VERB, m1.getFunction());
        assertEquals(Tense.SECOND_AORIST, m1.getTense());
        assertEquals(Voice.ACTIVE, m1.getVoice());
        assertEquals(Mood.PARTICIPLE, m1.getMood());
        assertEquals(Case.DATIVE, m1.getWordCase());
        assertEquals(Number.SINGULAR, m1.getNumber());
        assertEquals(Gender.MASCULINE, m1.getGender());

        final Morphology m2 = getEbean().find(Morphology.class, "F-1ASM");
        assertEquals(Person.FIRST, m2.getPerson());
        assertEquals(Function.REFLEXIVE_PRONOUN, m2.getFunction());

        final Morphology m3 = getEbean().find(Morphology.class, "D-NPM-C");
        assertEquals(Suffix.CONTRACTED_FORM, m3.getSuffix());
        assertEquals(1093, count);

        checkAllEnumerationValuesUsed(getEbean().find(Morphology.class).findList());
    }

    /**
     * checks that we have loaded up all types of enumerations
     * 
     * @param morphs the list of all morphologies loaded up
     */
    private void checkAllEnumerationValuesUsed(final List<Morphology> morphs) {
        final Set<Function> functions = new HashSet<Function>();
        final Set<Case> cases = new HashSet<Case>();
        final Set<Gender> genders = new HashSet<Gender>();
        final Set<Mood> moods = new HashSet<Mood>();
        final Set<Number> numbers = new HashSet<Number>();
        final Set<Person> persons = new HashSet<Person>();
        final Set<Suffix> suffixes = new HashSet<Suffix>();
        final Set<Tense> tenses = new HashSet<Tense>();
        final Set<Voice> voices = new HashSet<Voice>();

        for (final Morphology m : morphs) {
            functions.add(m.getFunction());
            cases.add(m.getWordCase());
            genders.add(m.getGender());
            moods.add(m.getMood());
            numbers.add(m.getNumber());
            persons.add(m.getPerson());
            suffixes.add(m.getSuffix());
            tenses.add(m.getTense());
            voices.add(m.getVoice());
        }

        // now iterate through all enumerations
        final List<HasCsvValueName> missing = new ArrayList<HasCsvValueName>();
        missing.addAll(checkAllUsed(Function.values(), functions));
        missing.addAll(checkAllUsed(Case.values(), cases));
        missing.addAll(checkAllUsed(Gender.values(), genders));
        missing.addAll(checkAllUsed(Mood.values(), moods));
        missing.addAll(checkAllUsed(Number.values(), numbers));
        missing.addAll(checkAllUsed(Person.values(), persons));
        missing.addAll(checkAllUsed(Suffix.values(), suffixes));
        missing.addAll(checkAllUsed(Tense.values(), tenses));
        missing.addAll(checkAllUsed(Voice.values(), voices));

        for (final HasCsvValueName o : missing) {
            LOG.error("Missing [{}] for [{}]", o.getCsvValueName(), o.getClass().getSimpleName());
        }

        assertTrue(missing.isEmpty());
    }

    /**
     * @param values a list of values to be contained in a set of enum values
     * @param enumValues the set of enum values
     * @param <T> the type of the list elements
     * @return missing values from enumValues
     */
    private <T> List<T> checkAllUsed(final T[] values, final Set<T> enumValues) {
        final List<T> missing = new ArrayList<T>();

        for (final T t : values) {
            if (!enumValues.contains(t)) {
                missing.add(t);
            }
        }
        return missing;
    }
}
