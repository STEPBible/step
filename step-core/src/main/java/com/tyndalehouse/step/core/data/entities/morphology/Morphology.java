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

import static com.tyndalehouse.step.core.data.entities.morphology.Mood.INFINITIVE;
import static com.tyndalehouse.step.core.data.entities.morphology.Mood.PARTICIPLE;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * Reference data for a morphological entity.
 * 
 * @author chrisburrell
 * 
 */
@Entity
public class Morphology implements Serializable {
    private static final long serialVersionUID = -9117616832904022032L;
    private static final char SPACE_SEPARATOR = ' ';

    @Id
    @Column(nullable = false)
    private String code;
    private Function function;
    private Tense tense;
    private Voice voice;
    private Mood mood;
    private Case wordCase;
    private Person person;
    private Number number;
    private Gender gender;
    private Suffix suffix;

    private String functionExplained;
    private String tenseExplained;
    private String voiceExplained;
    private String moodExplained;
    private String personExplained;
    private String caseExplained;
    private String numberExplained;
    private String genderExplained;
    private String suffixExplained;

    private String functionDescription;
    private String tenseDescription;
    private String voiceDescription;
    private String moodDescription;
    private String personDescription;
    private String caseDescription;
    private String numberDescription;
    private String genderDescription;
    private String suffixDescription;

    // used for displaying purposes
    private String cssClasses;
    private String inlineHtml;

    /**
     * @return the code
     */
    public String getCode() {
        return this.code;
    }

    /**
     * @param code the code to set
     */
    public void setCode(final String code) {
        this.code = code;
    }

    /**
     * @return the function
     */
    public Function getFunction() {
        return this.function;
    }

    /**
     * @param function the function to set
     */
    public void setFunction(final Function function) {
        this.function = function;
    }

    /**
     * @return the tense
     */
    public Tense getTense() {
        return this.tense;
    }

    /**
     * @param tense the tense to set
     */
    public void setTense(final Tense tense) {
        this.tense = tense;
    }

    /**
     * @return the voice
     */
    public Voice getVoice() {
        return this.voice;
    }

    /**
     * @param voice the voice to set
     */
    public void setVoice(final Voice voice) {
        this.voice = voice;
    }

    /**
     * @return the mood
     */
    public Mood getMood() {
        return this.mood;
    }

    /**
     * @param mood the mood to set
     */
    public void setMood(final Mood mood) {
        this.mood = mood;
    }

    /**
     * @return the wordCase
     */
    public Case getWordCase() {
        return this.wordCase;
    }

    /**
     * @param wordCase the wordCase to set
     */
    public void setWordCase(final Case wordCase) {
        this.wordCase = wordCase;
    }

    /**
     * @return the person
     */
    public Person getPerson() {
        return this.person;
    }

    /**
     * @param person the person to set
     */
    public void setPerson(final Person person) {
        this.person = person;
    }

    /**
     * @return the number
     */
    public Number getNumber() {
        return this.number;
    }

    /**
     * @param number the number to set
     */
    public void setNumber(final Number number) {
        this.number = number;
    }

    /**
     * @return the gender
     */
    public Gender getGender() {
        return this.gender;
    }

    /**
     * @param gender the gender to set
     */
    public void setGender(final Gender gender) {
        this.gender = gender;
    }

    /**
     * @return the suffix
     */
    public Suffix getSuffix() {
        return this.suffix;
    }

    /**
     * @param suffix the suffix to set
     */
    public void setSuffix(final Suffix suffix) {
        this.suffix = suffix;
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
     * @param inlineHtml the inlineHtml to set
     */
    public void setInlineHtml(final String inlineHtml) {
        this.inlineHtml = inlineHtml;
    }

    /**
     * @return the cssClasses
     */
    @Column(updatable = false)
    public String getCssClasses() {
        return this.cssClasses;
    }

    /**
     * @return the inlineHtml
     */
    public String getInlineHtml() {
        return this.inlineHtml;
    }

    /**
     * Initialises the inline html
     */
    public void initialise() {
        // initialise css
        initialiseCssClasses();

        boolean openBracket = false;

        // now we can initialise the inline html
        final StringBuilder html = new StringBuilder(128);
        html.append("<span onclick='javascript:showDef(this)' ");
        html.append("title='");

        if (getFunction() != null && getFunction().getNotes() != null) {
            html.append(getFunction().getNotes());
            html.append(SPACE_SEPARATOR);
        }

        if (getMood() == INFINITIVE) {
            html.append(INFINITIVE);
            html.append(SPACE_SEPARATOR);
        }

        appendNonNullSpacedItem(html, getGender());
        appendNonNullSpacedItem(html, getNumber());

        if (getTense() != null) {
            openBracket = openBracket(openBracket, html);
            html.append(getTense());
            html.append(SPACE_SEPARATOR);

            if (getTense().getNotes() != null) {
                html.append(getTense().getNotes());
                html.append(SPACE_SEPARATOR);
            }
        }

        if (getWordCase() != null) {
            openBracket = openBracket(openBracket, html);
            html.append(getWordCase().getDisplayName());
            html.append(SPACE_SEPARATOR);
        }

        closeBracket(openBracket, html);

        html.append("' class='");
        html.append(this.cssClasses);
        html.append("'>");

        if (getMood() == PARTICIPLE) {
            html.append(PARTICIPLE);
        } else {
            html.append(getFunction());
        }

        html.append("</span>");
        this.inlineHtml = html.toString();
    }

    /**
     * closes the bracket
     * 
     * @param openBracket indicates whether it was opened in the first place
     * @param html the html being built up
     */
    private void closeBracket(final boolean openBracket, final StringBuilder html) {
        if (openBracket) {
            // trim last space off
            if (html.charAt(html.length() - 1) == ' ') {
                html.deleteCharAt(html.length() - 1);
            }

            html.append(")");
        }
    }

    /**
     * opens a bracket safely
     * 
     * @param openBracket the open brakcet
     * @param html the html that is being built up
     * @return true to indicate the bracket has not been opened - always returns true
     */
    private boolean openBracket(final boolean openBracket, final StringBuilder html) {
        if (openBracket) {
            // append a comma
            html.append(",");
            html.append(SPACE_SEPARATOR);

            return true;
        }

        html.append("(");
        return true;
    }

    /**
     * initialises the css classes for the morphology item
     */
    private void initialiseCssClasses() {
        final StringBuilder sb = new StringBuilder(10);
        if (this.getNumber() != null) {
            sb.append(getNumber().getCssClass());
            sb.append(' ');
        }

        if (this.getGender() != null) {
            sb.append(getGender().getCssClass());
        }

        this.cssClasses = sb.toString();
    }

    /**
     * adds an item with a space afterwards if the item is not null
     * 
     * @param html the current content
     * @param item the item to add
     */
    private void appendNonNullSpacedItem(final StringBuilder html, final Object item) {
        if (item != null) {
            html.append(item);
            html.append(SPACE_SEPARATOR);
        }
    }
}
