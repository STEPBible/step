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

    private String functionExplained = "";
    private String tenseExplained = "";
    private String voiceExplained = "";
    private String moodExplained = "";
    private String personExplained = "";
    private String caseExplained = "";
    private String numberExplained = "";
    private String genderExplained = "";
    private String suffixExplained = "";

    private String functionDescription = "";
    private String tenseDescription = "";
    private String voiceDescription = "";
    private String moodDescription = "";
    private String personDescription = "";
    private String caseDescription = "";
    private String numberDescription = "";
    private String genderDescription = "";
    private String suffixDescription = "";
    private String description = "";
    private String explanation = "";

    /**
     * for serialisation
     */
    public MorphInfo() {
        // no-op
    }

    /**
     * constructs a morph info from a {@link Morphology}
     * 
     * @param m see {@link Morphology}
     */
    public MorphInfo(final Morphology m, final boolean includeAllInfo) {
        setFunction(m.getFunction());
        setGender(m.getGender());
        setMood(m.getMood());
        setNumber(m.getNumber());
        setPerson(m.getPerson());
        setSuffix(m.getSuffix());
        setTense(m.getTense());
        setVoice(m.getVoice());
        setWordCase(m.getWordCase());

        if (includeAllInfo) {
            setExplanation(m.getExplanation());
            setDescription(m.getDescription());

            setFunctionExplained(m.getFunctionExplained());
            setGenderExplained(m.getGenderExplained());
            setMoodExplained(m.getMoodExplained());
            setNumberExplained(m.getNumberExplained());
            setPersonExplained(m.getPersonExplained());
            setSuffixExplained(m.getSuffixExplained());
            setTenseExplained(m.getTenseExplained());
            setVoiceExplained(m.getVoiceExplained());
            setCaseExplained(m.getCaseExplained());

            setFunctionDescription(m.getFunctionDescription());
            setGenderDescription(m.getGenderDescription());
            setMoodDescription(m.getMoodDescription());
            setNumberDescription(m.getNumberDescription());
            setPersonDescription(m.getPersonDescription());
            setSuffixDescription(m.getSuffixDescription());
            setTenseDescription(m.getTenseDescription());
            setVoiceDescription(m.getVoiceDescription());
            setCaseDescription(m.getCaseDescription());
        }
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

    /**
     * @return the functionExplained
     */
    public String getFunctionExplained() {
        return this.functionExplained;
    }

    /**
     * @param functionExplained the functionExplained to set
     */
    public void setFunctionExplained(final String functionExplained) {
        this.functionExplained = functionExplained;
    }

    /**
     * @return the tenseExplained
     */
    public String getTenseExplained() {
        return this.tenseExplained;
    }

    /**
     * @param tenseExplained the tenseExplained to set
     */
    public void setTenseExplained(final String tenseExplained) {
        this.tenseExplained = tenseExplained;
    }

    /**
     * @return the voiceExplained
     */
    public String getVoiceExplained() {
        return this.voiceExplained;
    }

    /**
     * @param voiceExplained the voiceExplained to set
     */
    public void setVoiceExplained(final String voiceExplained) {
        this.voiceExplained = voiceExplained;
    }

    /**
     * @return the moodExplained
     */
    public String getMoodExplained() {
        return this.moodExplained;
    }

    /**
     * @param moodExplained the moodExplained to set
     */
    public void setMoodExplained(final String moodExplained) {
        this.moodExplained = moodExplained;
    }

    /**
     * @return the personExplained
     */
    public String getPersonExplained() {
        return this.personExplained;
    }

    /**
     * @param personExplained the personExplained to set
     */
    public void setPersonExplained(final String personExplained) {
        this.personExplained = personExplained;
    }

    /**
     * @return the caseExplained
     */
    public String getCaseExplained() {
        return this.caseExplained;
    }

    /**
     * @param caseExplained the caseExplained to set
     */
    public void setCaseExplained(final String caseExplained) {
        this.caseExplained = caseExplained;
    }

    /**
     * @return the numberExplained
     */
    public String getNumberExplained() {
        return this.numberExplained;
    }

    /**
     * @param numberExplained the numberExplained to set
     */
    public void setNumberExplained(final String numberExplained) {
        this.numberExplained = numberExplained;
    }

    /**
     * @return the genderExplained
     */
    public String getGenderExplained() {
        return this.genderExplained;
    }

    /**
     * @param genderExplained the genderExplained to set
     */
    public void setGenderExplained(final String genderExplained) {
        this.genderExplained = genderExplained;
    }

    /**
     * @return the suffixExplained
     */
    public String getSuffixExplained() {
        return this.suffixExplained;
    }

    /**
     * @param suffixExplained the suffixExplained to set
     */
    public void setSuffixExplained(final String suffixExplained) {
        this.suffixExplained = suffixExplained;
    }

    /**
     * @return the functionDescription
     */
    public String getFunctionDescription() {
        return this.functionDescription;
    }

    /**
     * @param functionDescription the functionDescription to set
     */
    public void setFunctionDescription(final String functionDescription) {
        this.functionDescription = functionDescription;
    }

    /**
     * @return the tenseDescription
     */
    public String getTenseDescription() {
        return this.tenseDescription;
    }

    /**
     * @param tenseDescription the tenseDescription to set
     */
    public void setTenseDescription(final String tenseDescription) {
        this.tenseDescription = tenseDescription;
    }

    /**
     * @return the voiceDescription
     */
    public String getVoiceDescription() {
        return this.voiceDescription;
    }

    /**
     * @param voiceDescription the voiceDescription to set
     */
    public void setVoiceDescription(final String voiceDescription) {
        this.voiceDescription = voiceDescription;
    }

    /**
     * @return the moodDescription
     */
    public String getMoodDescription() {
        return this.moodDescription;
    }

    /**
     * @param moodDescription the moodDescription to set
     */
    public void setMoodDescription(final String moodDescription) {
        this.moodDescription = moodDescription;
    }

    /**
     * @return the personDescription
     */
    public String getPersonDescription() {
        return this.personDescription;
    }

    /**
     * @param personDescription the personDescription to set
     */
    public void setPersonDescription(final String personDescription) {
        this.personDescription = personDescription;
    }

    /**
     * @return the caseDescription
     */
    public String getCaseDescription() {
        return this.caseDescription;
    }

    /**
     * @param caseDescription the caseDescription to set
     */
    public void setCaseDescription(final String caseDescription) {
        this.caseDescription = caseDescription;
    }

    /**
     * @return the numberDescription
     */
    public String getNumberDescription() {
        return this.numberDescription;
    }

    /**
     * @param numberDescription the numberDescription to set
     */
    public void setNumberDescription(final String numberDescription) {
        this.numberDescription = numberDescription;
    }

    /**
     * @return the genderDescription
     */
    public String getGenderDescription() {
        return this.genderDescription;
    }

    /**
     * @param genderDescription the genderDescription to set
     */
    public void setGenderDescription(final String genderDescription) {
        this.genderDescription = genderDescription;
    }

    /**
     * @return the suffixDescription
     */
    public String getSuffixDescription() {
        return this.suffixDescription;
    }

    /**
     * @param suffixDescription the suffixDescription to set
     */
    public void setSuffixDescription(final String suffixDescription) {
        this.suffixDescription = suffixDescription;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * @return the explanation
     */
    public String getExplanation() {
        return this.explanation;
    }

    /**
     * @param explanation the explanation to set
     */
    public void setExplanation(final String explanation) {
        this.explanation = explanation;
    }

}
