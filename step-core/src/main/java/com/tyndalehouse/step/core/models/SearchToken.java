package com.tyndalehouse.step.core.models;

/**
 * @author chrisburrell
 */
public class SearchToken {
    public static final String VERSION = "version"; 
    public static final String REFERENCE = "reference"; 
    public static final String SUBJECT_SEARCH = "subject"; 
    public static final String TEXT_SEARCH = "text"; 
    public static final String STRONG_NUMBER = "strong"; 
    public static final String GREEK_MEANINGS = "greekMeanings"; 
    public static final String HEBREW_MEANINGS = "hebrewMeanings"; 
    public static final String GREEK = "greek"; 
    public static final String HEBREW = "hebrew"; 
    public static final String MEANINGS = "meanings"; 
    
    private final String token;
    private final  String tokenType;

    public SearchToken(final String token, final String tokenType) {
        this.token = token;
        this.tokenType = tokenType;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getToken() {
        return token;
    }
}