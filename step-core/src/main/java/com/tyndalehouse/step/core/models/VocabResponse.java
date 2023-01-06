package com.tyndalehouse.step.core.models;

import com.tyndalehouse.step.core.data.EntityDoc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * The Class VocabResponse.
 */
public class VocabResponse {
    private EntityDoc[] definitions;
    private Map<String, List<LexiconSuggestion>> relatedWords;

    /**
     * Instantiates a new vocab response.
     * @param definitions the definitions
     * @param relatedWords the related words
     */
    public VocabResponse(final EntityDoc[] definitions,
                         final Map<String, List<LexiconSuggestion>> relatedWords) {
        this.definitions = definitions;
        this.relatedWords = relatedWords;
    }

    /**
     * Instantiates a new vocab response, all empty
     */
    public VocabResponse() {
        this(new EntityDoc[0]);
    }

    /**
     * Instantiates a new vocab response, only with definitions.
     * 
     * @param definitions the definitions
     */
    public VocabResponse(final EntityDoc[] definitions) {
        this(definitions, new HashMap<String, List<LexiconSuggestion>>());
    }

    /**
     * @return the definitions
     */
    public EntityDoc[] getDefinitions() {
        return this.definitions;
    }

    /**
     * @param definitions the definitions to set
     */
    public void setDefinitions(final EntityDoc[] definitions) {
        this.definitions = definitions;
    }

    /**
     * @return the relatedWords
     */
    public Map<String, List<LexiconSuggestion>> getRelatedWords() {
        return this.relatedWords;
    }

    /**
     * @param relatedWords the relatedWords to set
     */
    public void setRelatedWords(final Map<String, List<LexiconSuggestion>> relatedWords) {
        this.relatedWords = relatedWords;
    }
}
