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
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

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
public class LexiconDefinition implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @JoinColumn
    private String strong;
    private String original;
    private String originalWithoutAccents;
    private String transliteration;
    private String simpleTransliteration;
    private String pronunciation;
    private String shortDefinition;
    private String avTranslation;
    private String relatedStrongs;
    @Lob
    private String mounce;
    @Lob
    private String lsj;

    @ManyToOne
    @JoinColumn(name = "parent_definition")
    private LexiconDefinition parent;

    @OneToMany(targetEntity = LexiconDefinition.class, cascade = CascadeType.PERSIST, mappedBy = "parent")
    private List<LexiconDefinition> similarStrongs;

    /**
     * @return the strong
     */
    public String getStrong() {
        return this.strong;
    }

    /**
     * @param strong the strong to set
     */
    public void setStrong(final String strong) {
        this.strong = strong;
    }

    /**
     * @return the original
     */
    public String getOriginal() {
        return this.original;
    }

    /**
     * @param original the original to set
     */
    public void setOriginal(final String original) {
        this.original = original;
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
     * @return the simpleTransliteration
     */
    public String getSimpleTransliteration() {
        return this.simpleTransliteration;
    }

    /**
     * @param simpleTransliteration the simpleTransliteration to set
     */
    public void setSimpleTransliteration(final String simpleTransliteration) {
        this.simpleTransliteration = simpleTransliteration;
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
     * @return the shortDefinition
     */
    public String getShortDefinition() {
        return this.shortDefinition;
    }

    /**
     * @param shortDefinition the shortDefinition to set
     */
    public void setShortDefinition(final String shortDefinition) {
        this.shortDefinition = shortDefinition;
    }

    /**
     * @return the avTranslation
     */
    public String getAvTranslation() {
        return this.avTranslation;
    }

    /**
     * @param avTranslation the avTranslation to set
     */
    public void setAvTranslation(final String avTranslation) {
        this.avTranslation = avTranslation;
    }

    /**
     * @return the similarStrongs
     */
    public List<LexiconDefinition> getSimilarStrongs() {
        return this.similarStrongs;
    }

    /**
     * @return the relatedStrongs
     */
    public String getRelatedStrongs() {
        return this.relatedStrongs;
    }

    /**
     * @param relatedStrongs the relatedStrongs to set
     */
    public void setRelatedStrongs(final String relatedStrongs) {
        this.relatedStrongs = relatedStrongs;
    }

    /**
     * @param similarStrongs the similarStrongs to set
     */
    public void setSimilarStrongs(final List<LexiconDefinition> similarStrongs) {
        this.similarStrongs = similarStrongs;
    }

    /**
     * @return the mounce
     */
    public String getMounce() {
        return this.mounce;
    }

    /**
     * @param mounce the mounce to set
     */
    public void setMounce(final String mounce) {
        this.mounce = mounce;
    }

    /**
     * @return the lsj
     */
    public String getLsj() {
        return this.lsj;
    }

    /**
     * @param lsj the lsj to set
     */
    public void setLsj(final String lsj) {
        this.lsj = lsj;
    }

    /**
     * @return the originalWithoutAccents
     */
    public String getOriginalWithoutAccents() {
        return this.originalWithoutAccents;
    }

    /**
     * @param originalWithoutAccents the originalWithoutAccents to set
     */
    public void setOriginalWithoutAccents(final String originalWithoutAccents) {
        this.originalWithoutAccents = originalWithoutAccents;
    }

    /**
     * @return the parent
     */
    public LexiconDefinition getParent() {
        return this.parent;
    }

    /**
     * @param parent the parent to set
     */
    public void setParent(final LexiconDefinition parent) {
        this.parent = parent;
    }
}
