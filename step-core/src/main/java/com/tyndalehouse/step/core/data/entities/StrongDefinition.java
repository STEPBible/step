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
package com.tyndalehouse.step.core.data.entities;

import java.io.Serializable;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import com.avaje.ebean.annotation.CacheStrategy;

/**
 * A entitiy representing what we expect to see in a strong definition
 * 
 * @author chrisburrell
 * 
 */
/**
 * @author chrisburrell
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
public class StrongDefinition implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue
    private Integer id;

    private String originalLanguage;
    private String transliteration;
    private String pronunciation;
    private String kjvDefinition;
    private String strongsDerivation;
    private String lexiconSummary;

    /**
     * @return the id
     */
    public Integer getId() {
        return this.id;
    }

    /**
     * @param id the id to set
     */
    public void setId(final Integer id) {
        this.id = id;
    }

    /**
     * @return the originalLanguage
     */
    public String getOriginalLanguage() {
        return this.originalLanguage;
    }

    /**
     * @param originalLanguage the originalLanguage to set
     */
    public void setOriginalLanguage(final String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }

    /**
     * @return the transliteration
     */
    public String getTransliteration() {
        return this.transliteration;
    }

    /**
     * @param transliteration the transliteration to set
     */
    public void setTransliteration(final String transliteration) {
        this.transliteration = transliteration;
    }

    /**
     * @return the pronunciation
     */
    public String getPronunciation() {
        return this.pronunciation;
    }

    /**
     * @param pronunciation the pronunciation to set
     */
    public void setPronunciation(final String pronunciation) {
        this.pronunciation = pronunciation;
    }

    /**
     * @return the kjvDefinition
     */
    public String getKjvDefinition() {
        return this.kjvDefinition;
    }

    /**
     * @param kjvDefinition the kjvDefinition to set
     */
    public void setKjvDefinition(final String kjvDefinition) {
        this.kjvDefinition = kjvDefinition;
    }

    /**
     * @return the strongsDerivation
     */
    public String getStrongsDerivation() {
        return this.strongsDerivation;
    }

    /**
     * @param strongsDerivation the strongsDerivation to set
     */
    public void setStrongsDerivation(final String strongsDerivation) {
        this.strongsDerivation = strongsDerivation;
    }

    /**
     * @return the lexiconSummary
     */
    public String getLexiconSummary() {
        return this.lexiconSummary;
    }

    /**
     * @param lexiconSummary the lexiconSummary to set
     */
    public void setLexiconSummary(final String lexiconSummary) {
        this.lexiconSummary = lexiconSummary;
    }

}
