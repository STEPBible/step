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
public class Morphology {
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
    private String rootCode;

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
     * @return the rootCode
     */
    public String getRootCode() {
        return this.rootCode;
    }

    /**
     * @param rootCode the rootCode to set
     */
    public void setRootCode(final String rootCode) {
        this.rootCode = rootCode;
    }
}
