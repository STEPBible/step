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

        // now we can initialise the inline html
        final StringBuilder html = new StringBuilder(128);
        html.append("<span onclick='javascript:showDef(this)' ");
        html.append("title='");

        if (getFunction() != null && getFunction().getNotes() != null) {
            html.append(getFunction().getNotes());
            html.append(SPACE_SEPARATOR);
        }

        if (getTense() != null) {
            html.append(getTense());
            html.append(SPACE_SEPARATOR);

            if (getTense().getNotes() != null) {
                html.append(getTense().getNotes());
                html.append(SPACE_SEPARATOR);
            }
        }

        appendNonNullSpacedItem(html, getGender());
        appendNonNullSpacedItem(html, getNumber());

        html.append("' class='");
        html.append(this.cssClasses);
        html.append("'>");
        html.append(getFunction());
        html.append("</span>");
        this.inlineHtml = html.toString();
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
