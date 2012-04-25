package com.tyndalehouse.step.core.data.entities;

import javax.persistence.Entity;

import com.avaje.ebean.annotation.CacheStrategy;

/**
 * A entitiy representing what we expect to see in a strong definition
 * 
 * @author Chris
 * 
 */
@CacheStrategy(readOnly = true)
@Entity
public class StrongDefinition {
    private String originalLanguage;
    private String transliteration;
    private String pronunciation;
    private String kjvDefinition;
    private String strongs_derivation;
    private String lexicon_summary;
    
    
}
