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
package com.tyndalehouse.step.core.data.entities.lexicon;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Lob;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonProperty;

import com.avaje.ebean.annotation.CacheStrategy;
import com.tyndalehouse.step.core.models.ShortLexiconDefinition;

/**
 * A entitiy representing what we expect to see in a strong definition
 * 
 * @author chrisburrell
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
public class Definition implements Serializable, Cloneable {
    private static final long serialVersionUID = 172250669085074461L;

    @Id
    private long id;

    @JsonIgnore
    @ManyToMany(cascade = CascadeType.ALL, targetEntity = Definition.class)
    @JoinTable(name = "definition_relationships", joinColumns = { @JoinColumn(name = "strongNumber") }, inverseJoinColumns = { @JoinColumn(name = "other_strong") })
    private List<Definition> similarStrongs;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, targetEntity = Translation.class, mappedBy = "lexiconDefinition")
    private List<Translation> translations;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, targetEntity = SpecificForm.class, mappedBy = "strongNumber")
    @JoinColumn(name = "raw_strong_number")
    private List<SpecificForm> specificForms;

    private String alternativeTranslit1;
    private String alternativeTranslit1Unaccented;

    @Lob
    private String lsjDefs;

    @Column(unique = true)
    private String strongNumber;

    private String accentedUnicode;
    private String unaccentedUnicode;

    private String strongTranslit;
    private String strongPronunc;
    private String relatedNos;

    @Lob
    private String shortDef;
    @Lob
    private String mediumDef;
    private String stepGloss;
    private String stepTransliteration;
    private String unaccentedStepTransliteration;
    /**
     * Indicates that this word should not be returned when carrying out searches
     */
    @Column(nullable = false)
    private Boolean blacklisted;

    /**
     * @param id the id to set
     */
    public void setId(final long id) {
        this.id = id;
    }

    /**
     * @param similarStrongs the similarStrongs to set
     */
    public void setSimilarStrongs(final List<Definition> similarStrongs) {
        this.similarStrongs = similarStrongs;
    }

    /**
     * @param alternativeTranslit1 the alternativeTranslit1 to set
     */
    public void setAlternativeTranslit1(final String alternativeTranslit1) {
        this.alternativeTranslit1 = alternativeTranslit1;
    }

    /**
     * @param lsjDefs the lsjDefs to set
     */
    public void setLsjDefs(final String lsjDefs) {
        this.lsjDefs = lsjDefs;
    }

    /**
     * @param strongNumber the strongNumber to set
     */
    public void setStrongNumber(final String strongNumber) {
        this.strongNumber = strongNumber;
    }

    /**
     * @param accentedUnicode the accentedUnicode to set
     */
    public void setAccentedUnicode(final String accentedUnicode) {
        this.accentedUnicode = accentedUnicode;
    }

    /**
     * @param strongTranslit the strongTranslit to set
     */
    public void setStrongTranslit(final String strongTranslit) {
        this.strongTranslit = strongTranslit;
    }

    /**
     * @param strongPronunc the strongPronunc to set
     */
    public void setStrongPronunc(final String strongPronunc) {
        this.strongPronunc = strongPronunc;
    }

    /**
     * @param relatedNos the relatedNos to set
     */
    public void setRelatedNos(final String relatedNos) {
        this.relatedNos = relatedNos;
    }

    /**
     * @param shortDef the mShortDef to set
     */
    public void setShortDef(final String shortDef) {
        this.shortDef = shortDef;
    }

    /**
     * @param mediumDef the mMedDef to set
     */
    public void setMediumDef(final String mediumDef) {
        this.mediumDef = mediumDef;
    }

    /**
     * @param stepGloss the stepGloss to set
     */
    public void setStepGloss(final String stepGloss) {
        this.stepGloss = stepGloss;
    }

    /**
     * @param stepTransliteration the stepTransliteration to set
     */
    public void setStepTransliteration(final String stepTransliteration) {
        this.stepTransliteration = stepTransliteration;
    }

    /**
     * @return the id
     */
    public long getId() {
        return this.id;
    }

    /**
     * @return the similarStrongs
     */
    public List<Definition> getSimilarStrongs() {
        return this.similarStrongs;
    }

    /**
     * @return the alternativeTranslit1
     */
    public String getAlternativeTranslit1() {
        return this.alternativeTranslit1;
    }

    /**
     * @return the lsjDefs
     */
    public String getLsjDefs() {
        return this.lsjDefs;
    }

    /**
     * @return the strongNumber
     */
    public String getStrongNumber() {
        return this.strongNumber;
    }

    /**
     * @return the accentedUnicode
     */
    public String getAccentedUnicode() {
        return this.accentedUnicode;
    }

    /**
     * @return the strongTranslit
     */
    public String getStrongTranslit() {
        return this.strongTranslit;
    }

    /**
     * @return the strongPronunc
     */
    public String getStrongPronunc() {
        return this.strongPronunc;
    }

    /**
     * @return the relatedNos
     */
    public String getRelatedNos() {
        return this.relatedNos;
    }

    /**
     * @return the mShortDef
     */
    public String getShortDef() {
        return this.shortDef;
    }

    /**
     * @return the mMedDef
     */
    public String getMediumDef() {
        return this.mediumDef;
    }

    /**
     * @return the stepGloss
     */
    public String getStepGloss() {
        return this.stepGloss;
    }

    /**
     * @return the translitStep
     */
    public String getStepTransliteration() {
        return this.stepTransliteration;
    }

    /**
     * @return the unaccentedUnicode
     */
    public String getUnaccentedUnicode() {
        return this.unaccentedUnicode;
    }

    /**
     * @param unaccentedUnicode the unaccentedUnicode to set
     */
    public void setUnaccentedUnicode(final String unaccentedUnicode) {
        this.unaccentedUnicode = unaccentedUnicode;
    }

    /**
     * @return the unaccentedTransliteration
     */
    public String getStepUnaccentedTransliteration() {
        return this.unaccentedStepTransliteration;
    }

    /**
     * @param unaccentedStepTransliteration the unaccentedTransliteration to set
     */
    public void setUnaccentedStepTransliteration(final String unaccentedStepTransliteration) {
        this.unaccentedStepTransliteration = unaccentedStepTransliteration;
    }

    /**
     * @return the alternativeTranslit1Unaccented
     */
    public String getAlternativeTranslit1Unaccented() {
        return this.alternativeTranslit1Unaccented;
    }

    /**
     * @param alternativeTranslit1Unaccented the alternativeTranslit1Unaccented to set
     */
    public void setAlternativeTranslit1Unaccented(final String alternativeTranslit1Unaccented) {
        this.alternativeTranslit1Unaccented = alternativeTranslit1Unaccented;
    }

    /**
     * A special getter that returns a list of strongs without their lexicon definiton object
     * 
     * @return the list of strong codes
     */
    @JsonProperty("similarStrongs")
    public List<ShortLexiconDefinition> getSimilarStrongCodes() {
        final List<ShortLexiconDefinition> codes = new ArrayList<ShortLexiconDefinition>();
        for (final Definition l : this.similarStrongs) {
            codes.add(new ShortLexiconDefinition(l.getStrongNumber(), l.getAccentedUnicode()));
        }
        return codes;
    }

    /**
     * @return the translations
     */
    public List<Translation> getTranslations() {
        return this.translations;
    }

    /**
     * @param translations the translations to set
     */
    public void setTranslations(final List<Translation> translations) {
        this.translations = translations;
    }

    /**
     * @return the blacklisted
     */
    public Boolean getBlacklisted() {
        return this.blacklisted;
    }

    /**
     * @param blacklisted the blacklisted to set
     */
    public void setBlacklisted(final Boolean blacklisted) {
        this.blacklisted = blacklisted;
    }

    /**
     * @return the specificForms
     */
    public List<SpecificForm> getSpecificForms() {
        return this.specificForms;
    }

    /**
     * @param specificForms the specificForms to set
     */
    public void setSpecificForms(final List<SpecificForm> specificForms) {
        this.specificForms = specificForms;
    }

    /**
     * @return the unaccentedStepTransliteration
     */
    public String getUnaccentedStepTransliteration() {
        return this.unaccentedStepTransliteration;
    }
}
