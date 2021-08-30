package com.tyndalehouse.step.core.service.impl;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.SuggestionType;
import com.tyndalehouse.step.core.service.LexiconDefinitionService;

/**
 * @author chrisburrell
 */
public class LexiconDefinitionServiceImpl implements LexiconDefinitionService {
    private final EntityIndexReader definitions;

    /**
     * @param entityManager the entity manager
     */
    @Inject
    public LexiconDefinitionServiceImpl(final EntityManager entityManager) {
        this.definitions = entityManager.getReader("definition");
    }

    @Override
    public Map<String, LexiconSuggestion> lookup(final Set<String> strongNumbers, final String userLanguage) {

        final Map<String, LexiconSuggestion> results = new HashMap<String, LexiconSuggestion>(
                strongNumbers.size() * 2);

        // exit early if no strong numbers
        if (strongNumbers.size() == 0) {
            return results;
        }

        final StringBuilder query = new StringBuilder(strongNumbers.size() * 7);
        for (final String strong : strongNumbers) {
            query.append(strong);
            query.append(' ');
        }

        final EntityDoc[] lexiconDefitions = this.definitions.searchSingleColumn("strongNumber",
                query.toString());
        for (final EntityDoc lexiconDefinition : lexiconDefitions) {
            final String strongNumber = lexiconDefinition.get("strongNumber");

            final LexiconSuggestion suggestion = getLexiconSuggestion(lexiconDefinition, strongNumber, userLanguage);
            results.put(strongNumber, suggestion);
        }

        return results;
    }

    @Override
    public LexiconSuggestion lookup(final String strongNumber) {
        final EntityDoc[] lexiconDefinitions = this.definitions.searchSingleColumn("strongNumber",
                strongNumber.toString());
        if(lexiconDefinitions == null || lexiconDefinitions.length == 0) {
            return null;
        }
        return getLexiconSuggestion(lexiconDefinitions[0], strongNumber, "");
    }
    
    /**
     * Converts the entity documents to its lexicon suggestion 
     * @param lexiconDefinition the lexicon definition
     * @param strongNumber the strong number
     * @return the lexicon suggestion with transliteration, gloss, etc.
     */
    private LexiconSuggestion getLexiconSuggestion(final EntityDoc lexiconDefinition, final String strongNumber, final String userLanguage) {
        final LexiconSuggestion suggestion = new LexiconSuggestion();
        if (userLanguage.equalsIgnoreCase("es")) suggestion.setGloss(lexiconDefinition.get("es_Gloss"));
        else if (userLanguage.equalsIgnoreCase("zh")) suggestion.setGloss(lexiconDefinition.get("zh_Gloss"));
        else if (userLanguage.equalsIgnoreCase("zh_tw")) suggestion.setGloss(lexiconDefinition.get("zh_tw_Gloss"));
        else suggestion.setGloss(lexiconDefinition.get("stepGloss"));
        suggestion.setMatchingForm(lexiconDefinition.get("accentedUnicode"));
        suggestion.setStepTransliteration(lexiconDefinition.get("stepTransliteration"));
        suggestion.setStrongNumber(strongNumber);
        return suggestion;
    }
}
