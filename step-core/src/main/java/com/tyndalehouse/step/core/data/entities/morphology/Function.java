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
package com.tyndalehouse.step.core.data.entities.morphology;

import static com.tyndalehouse.step.core.utils.EnumUtils.getReverseMap;

import java.util.Map;

import com.tyndalehouse.step.core.models.HasCsvValueName;

/**
 * Different functions a word can perform
 * 
 * @author chrisburrell
 */
// CHECKSTYLE:OFF

public enum Function implements HasCsvValueName {
    ADJECTIVE("Adjective"),
    ADVERB("Adverb"),
    ADVERB_WITH_PARTICLE_COMBINED("ADVerb or adverb and particle combined", "Adverb"),
    CONDITIONAL_PARTICLE("CONDitional particle or conjunction", "Conditional"),
    CONJUCTION("conjunction or conjunctive particle", "Conjunction"),
    CORRELATIVE_INTERROGATIVE_PRONOUN("Correlative or Interrogative pronoun", "Interrogative"),
    CORRELATIVE_PRONOUN("Correlative pronoun", "Pronoun", "Correlative pronoun"),
    DEFINITE_ARTICLE("Definite article", "Article"),
    DEMONSTRATIVE_PRONOUN("Demonstrative pronoun", "Pronoun", "Demonstrative pronoun"),
    HEBREW("HEBrew transliterated word", "Hebrew word"),
    INDECLINABLE_NOUN("Indeclinable Noun of Other type", "Noun", "Indeclinable noun"),
    INDECLINABLE_PROPER_NOUN("Indeclinable PRoper Noun", "Proper noun", "Indeclinable proper noun"),
    INDEFINITE_PRONOUN("Indefinite pronoun", "Pronoun", "Indefinite pronoun"),
    INTERJECTION("Interjection"),
    INTERROGATIVE_PRONOUN("Interrogative pronoun", "Interrogative"),
    NOUN("Noun"),
    PARTICLE("Particle"),
    PARTICLE_DISJUNCTIVE("Particle, Disjunctive particle", "Disjunctive"),
    PERSONAL_PRONOUN("Personal pronoun", "Pronoun", "Personal pronoun"),
    POSSESSIVE_PRONOUN("Posessive pronoun", "Pronoun", "Possessive pronoun"),
    PREPOSITION("Preposition"),
    RECIPROCAL_PRONOUN("Reciprocal pronoun", "Pronoun", "Reciprocal pronoun"),
    REFLEXIVE_PRONOUN("Reflexive pronoun", "Pronoun", "Reflexive pronoun"),
    RELATIVE_PRONOUN("Relative pronoun", "Pronoun", "Relative pronoun"),
    VERB("Verb");

    private static Map<String, Function> values = getReverseMap(values());
    private final String csvValueName;
    private final String displayName;
    private final String notes;

    /**
     * @param displayText name to be displayed on the screen
     */
    Function(final String csvValueName) {
        this(csvValueName, null, null);
    }

    /**
     * @param displayText name to be displayed on the screen
     */
    Function(final String csvValueName, final String displayName) {
        this(csvValueName, displayName, null);
    }

    /**
     * @param displayText name to be displayed on the screen
     */
    Function(final String csvValueName, final String displayName, final String notes) {
        this.csvValueName = csvValueName;
        this.displayName = displayName;
        this.notes = notes;
    }

    /**
     * @return the displayName
     */
    public String getCsvValueName() {
        return this.csvValueName;
    }

    public static Function resolveByCsvValueName(final String csvValueName) {
        return values.get(csvValueName);
    }

    /**
     * @return the displayName
     */
    public String getDisplayName() {
        if (this.displayName != null) {
            return this.displayName;
        }
        return this.csvValueName;
    }

    @Override
    public String toString() {
        return getDisplayName();
    }

    /**
     * @return the notes
     */
    public String getNotes() {
        return this.notes;
    }
}
