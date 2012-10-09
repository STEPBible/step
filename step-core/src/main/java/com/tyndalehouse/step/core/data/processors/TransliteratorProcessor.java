package com.tyndalehouse.step.core.data.processors;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.adaptForQueryingSimplifiedTransliteration;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.isHebrewText;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.transliterate;

import java.util.Set;

import org.apache.lucene.document.Document;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.create.PostProcessor;

/**
 * Adds generated fields to the entity document - affects both "definition" and "specificForm"
 * 
 * @author chrisburrell
 * 
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

        final boolean isHebrew = isHebrewText(accentedUnicode);
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
        final Set<String> simplifiedTransliterations = adaptForQueryingSimplifiedTransliteration(
                transliteration, !isHebrew);
        for (final String s : simplifiedTransliterations) {
            doc.add(config.getField(STEP_SIMPLIFIED_TRANSLITERATION, s));
        }
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
