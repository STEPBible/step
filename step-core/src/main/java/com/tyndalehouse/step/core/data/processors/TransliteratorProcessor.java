package com.tyndalehouse.step.core.data.processors;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.adaptForTransliterationForIndexing;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.transliterate;

import org.apache.lucene.document.Document;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.create.PostProcessor;
import com.tyndalehouse.step.core.utils.language.HebrewUtils;
import org.apache.lucene.document.Field;

/**
 * Adds generated fields to the entity document - affects both "definition" and "specificForm"
 */
public class TransliteratorProcessor implements PostProcessor {
    private static final String STEP_SIMPLIFIED_TRANSLITERATION = "simplifiedStepTransliteration";
    private static final String STEP_TRANSLITERATION = "stepTransliteration";

    @Override
    public void process(final EntityConfiguration config, final Document doc) {
        final String accentedUnicode = doc.get("accentedUnicode");

        if (accentedUnicode == null || accentedUnicode.length() == 0) {
            return;
        }

        final boolean isHebrew = HebrewUtils.isHebrewText(accentedUnicode);
        final String transliteration = transliterate(accentedUnicode);

        doStepTransliteration(config, doc, transliteration);
        doSimplifiedStepTransliterations(doc, isHebrew, transliteration, config);
    }

    /**
     * Does the simplified transliterations by expanding the terms
     * 
     * @param doc the document
     * @param isHebrew true for hebrew
     * @param transliteration the transliteration
     * @param config the config for the entity
     */
    private void doSimplifiedStepTransliterations(final Document doc, final boolean isHebrew,
            final String transliteration, final EntityConfiguration config) {
        doc.add(config.getField(STEP_SIMPLIFIED_TRANSLITERATION,
                adaptForTransliterationForIndexing(transliteration, !isHebrew)));
    }

    /**
     * Step transliteration
     * 
     * @param config the configuration
     * @param doc the document
     * @param transliteration the transliteration that needs to be stored/indexed
     */
    private void doStepTransliteration(final EntityConfiguration config, final Document doc,
            final String transliteration) {
        doc.add(config.getField(STEP_TRANSLITERATION, transliteration));
    }
}
