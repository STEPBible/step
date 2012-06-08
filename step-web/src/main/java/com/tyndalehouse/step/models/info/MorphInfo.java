/*******************************************************************************
 * Copyright (c) 01, Directors of the Tyndale STEP Project
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
package com.tyndalehouse.step.models.info;

import java.io.Serializable;

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

/**
 * Captures information related to morphology
 * 
 * @author chrisburrell
 * 
 */
public class MorphInfo implements Serializable {
    private static final long serialVersionUID = 4573131041334419L;
    private String function = "";
    private String functionNotes = "";
    private String tense = "";
    private String voice = "";
    private String mood = "";
    private String wordCase = "";
    private String person = "";
    private String number = "";
    private String gender = "";
    private String suffix = "";
    private String tenseNotes = "";

    /**
     * for serialisation
     */
    public MorphInfo() {

    }

    /**
     * constructs a morph info from a {@link Morphology}
     * 
     * @param m see {@link Morphology}
     */
    public MorphInfo(final Morphology m) {
        setFunction(m.getFunction());
        setGender(m.getGender());
        setMood(m.getMood());
        setNumber(m.getNumber());
        setPerson(m.getPerson());
        setSuffix(m.getSuffix());
        setTense(m.getTense());
        setVoice(m.getVoice());
        setWordCase(m.getWordCase());
    }

    /**
     * @return the function
     */
    public String getFunction() {
        return this.function;
    }

    /**
     * @param function the function to set
     */
    public void setFunction(final String function) {
        this.function = function;
    }

    /**
     * @return the tense
     */
    public String getTense() {
        return this.tense;
    }

    /**
     * @param tense the tense to set
     */
    public void setTense(final String tense) {
        this.tense = tense;
    }

    /**
     * @return the voice
     */
    public String getVoice() {
        return this.voice;
    }

    /**
     * @param voice the voice to set
     */
    public void setVoice(final String voice) {
        this.voice = voice;
    }

    /**
     * @return the mood
     */
    public String getMood() {
        return this.mood;
    }

    /**
     * @param mood the mood to set
     */
    public void setMood(final String mood) {
        this.mood = mood;
    }

    /**
     * @return the wordCase
     */
    public String getWordCase() {
        return this.wordCase;
    }

    /**
     * @param wordCase the wordCase to set
     */
    public void setWordCase(final String wordCase) {
        this.wordCase = wordCase;
    }

    /**
     * @return the person
     */
    public String getPerson() {
        return this.person;
    }

    /**
     * @param person the person to set
     */
    public void setPerson(final String person) {
        this.person = person;
    }

    /**
     * @return the number
     */
    public String getNumber() {
        return this.number;
    }

    /**
     * @param number the number to set
     */
    public void setNumber(final String number) {
        this.number = number;
    }

    /**
     * @return the gender
     */
    public String getGender() {
        return this.gender;
    }

    /**
     * @param gender the gender to set
     */
    public void setGender(final String gender) {
        this.gender = gender;
    }

    /**
     * @return the suffix
     */
    public String getSuffix() {
        return this.suffix;
    }

    /**
     * @param suffix the suffix to set
     */
    public void setSuffix(final String suffix) {
        this.suffix = suffix;
    }

    /**
     * @return the functionNotes
     */
    public String getFunctionNotes() {
        return this.functionNotes;
    }

    /**
     * @param functionNotes the functionNotes to set
     */
    public void setFunctionNotes(final String functionNotes) {
        this.functionNotes = functionNotes;
    }

    /**
     * @param tenseNotes the tenseNotes to set
     */
    public void setTenseNotes(final String tenseNotes) {
        this.tenseNotes = tenseNotes;
    }

    /**
     * @return the tenseNotes
     */
    public String getTenseNotes() {
        return this.tenseNotes;
    }

    /**
     * @param function function
     */
    private void setFunction(final Function function) {
        if (function != null) {
            this.function = function.toString();
            if (function.getNotes() != null) {
                this.functionNotes = function.getNotes();
            }
        }
    }

    /**
     * 
     * @param gender gender
     */
    private void setGender(final Gender gender) {
        if (gender != null) {
            this.gender = gender.toString();
        }

    }

    /**
     * 
     * @param mood mood
     */
    private void setMood(final Mood mood) {
        if (mood != null) {
            this.mood = mood.toString();
        }
    }

    /**
     * 
     * @param number number
     */
    private void setNumber(final Number number) {
        if (number != null) {
            this.number = number.toString();
        }
    }

    /**
     * 
     * @param person person
     */
    private void setPerson(final Person person) {
        if (person != null) {
            this.person = person.toString();
        }

    }

    /**
     * 
     * @param suffix suffix
     */
    private void setSuffix(final Suffix suffix) {
        if (suffix != null) {
            this.suffix = suffix.toString();
        }
    }

    /**
     * 
     * @param tense tense
     */
    private void setTense(final Tense tense) {
        if (tense != null) {
            this.tense = tense.toString();
            if (tense.getNotes() != null) {
                this.tenseNotes = tense.getNotes();
            }
        }
    }

    /**
     * 
     * @param voice voice
     */
    private void setVoice(final Voice voice) {
        if (voice != null) {
            this.voice = voice.toString();
        }
    }

    /**
     * @param wordCase word case
     */
    private void setWordCase(final Case wordCase) {
        if (wordCase != null) {
            this.wordCase = wordCase.toString();
        }
    }
}
