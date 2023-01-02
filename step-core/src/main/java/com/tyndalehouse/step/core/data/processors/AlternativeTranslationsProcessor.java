package com.tyndalehouse.step.core.data.processors;

import javax.inject.Inject;

import org.apache.lucene.document.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.create.PostProcessor;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Takes the reference provided and turns into an Osis version
 */
public class AlternativeTranslationsProcessor implements PostProcessor {
    private static final Logger LOGGER = LoggerFactory.getLogger(AlternativeTranslationsProcessor.class);
    private final JSwordPassageService jswordPassage;

    /**
     * Instantiates a new reference processor.
     * 
     * @param jswordPassage the jsword passage
     */
    @Inject
    public AlternativeTranslationsProcessor(final JSwordPassageService jswordPassage) {
        this.jswordPassage = jswordPassage;
    }

    @Override
    public void process(final EntityConfiguration config, final Document doc) {
        final String reference = doc.get("reference");
        doc.removeField("reference");
        try {
            doc.add(config.getField("reference", this.jswordPassage.getKeyInfo(reference, "ESV_th", "ESV_th")
                    .getOsisKeyId()));
        } catch (final StepInternalException e) {
            LOGGER.error("Alternative Meanings: {}", e.getMessage());
            LOGGER.trace("Failed alternative mean verse:", e);
        }
    }
}
