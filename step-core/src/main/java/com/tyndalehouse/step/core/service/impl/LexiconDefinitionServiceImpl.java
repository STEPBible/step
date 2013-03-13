package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.service.LexiconDefinitionService;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

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
    public Map<String, LexiconSuggestion> lookup(final Set<String> strongNumbers) {
        final Map<String, LexiconSuggestion> results = new HashMap<String, LexiconSuggestion>(strongNumbers.size()*2);
        StringBuilder query = new StringBuilder(strongNumbers.size() * 7);
        for(String strong : strongNumbers) {
            query.append(strong);
            query.append(' ');
        }

        final EntityDoc[] lexiconDefitions = definitions.searchSingleColumn("strongNumber", query.toString());
        for (EntityDoc lexiconDefinition : lexiconDefitions) {
            final String strongNumber = lexiconDefinition.get("strongNumber");

            LexiconSuggestion suggestion = new LexiconSuggestion();
            suggestion.setGloss(lexiconDefinition.get("stepGloss"));
            suggestion.setMatchingForm(lexiconDefinition.get("accentedUnicode"));
            suggestion.setStepTransliteration(lexiconDefinition.get("stepTransliteration"));
            suggestion.setStrongNumber(strongNumber);

            results.put(strongNumber, suggestion);
        }

        return results;
    }
}
