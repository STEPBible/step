package com.tyndalehouse.step.core.models;

import java.io.Serializable;

/**
 * @author chrisburrell
 */
public class SearchToken implements Serializable {
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

    private Object enhancedTokenInfo;
    private final String token;
    private final String tokenType;

    public SearchToken(final String tokenType, final String token) {
        this.token = token;
        this.tokenType = tokenType;
    }

    /**
     * @param tokenType         the type of token
     * @param token             the token itself
     * @param enhancedTokenInfo the enhanced token information, if any. Could remain null
     */
    public SearchToken(final String tokenType, final String token, final Object enhancedTokenInfo) {
        this(tokenType, token);
        this.enhancedTokenInfo = enhancedTokenInfo;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getToken() {
        return token;
    }

    /**
     * @return information used to display in the search box, which if
     * left solely with the token, may not be sufficient
     */
    public Object getEnhancedTokenInfo() {
        return enhancedTokenInfo;
    }

    /**
     * @param enhancedTokenInfo information used to display in the search box, which if
     *                          left solely with the token, may not be sufficient
     */
    public void setEnhancedTokenInfo(final Object enhancedTokenInfo) {
        this.enhancedTokenInfo = enhancedTokenInfo;
    }
}