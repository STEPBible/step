package com.tyndalehouse.step.core.data.entities.lexicon;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import com.avaje.ebean.annotation.CacheStrategy;

/**
 * Translation attached to a Lexicon {@link Definition}
 * 
 * @author chrisburrell
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
public class Translation {
    @Id
    private int id;
    private String alternativeTranslation;

    @ManyToOne
    @JoinColumn(name = "lexicon_definition_id")
    private Definition lexiconDefinition;

    /**
     * @return the lexiconDefinition
     */
    public Definition getLexiconDefinition() {
        return this.lexiconDefinition;
    }

    /**
     * @param lexiconDefinition the lexiconDefinition to set
     */
    public void setLexiconDefinition(final Definition lexiconDefinition) {
        this.lexiconDefinition = lexiconDefinition;
    }

    /**
     * @return the alternativeTranslation
     */
    public String getAlternativeTranslation() {
        return this.alternativeTranslation;
    }

    /**
     * @param alternativeTranslation the alternativeTranslation to set
     */
    public void setAlternativeTranslation(final String alternativeTranslation) {
        this.alternativeTranslation = alternativeTranslation;
    }
}
