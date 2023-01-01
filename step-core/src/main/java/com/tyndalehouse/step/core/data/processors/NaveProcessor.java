package com.tyndalehouse.step.core.data.processors;

import javax.inject.Inject;

import org.apache.lucene.document.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.create.PostProcessor;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

import java.util.regex.Pattern;

/**
 * Adds generated fields to the entity document - affects both "definition" and "specificForm"
 *
 * @author chrisburrell
 */
public class NaveProcessor implements PostProcessor {
    private static final Logger LOGGER = LoggerFactory.getLogger(NaveProcessor.class);
    private static final Pattern STRIP_ALTERNATIVES = Pattern.compile("\\s?\\[[^\\]]+]\\s?");
    private final JSwordPassageService jswordPassage;


    /**
     * Instantiates a new reference processor.
     *
     * @param jswordPassage the jsword passage
     */
    @Inject
    public NaveProcessor(final JSwordPassageService jswordPassage) {
        this.jswordPassage = jswordPassage;
    }

    @Override
    public void process(final EntityConfiguration config, final Document doc) {
        final String rootStem = doc.get("rootStem");
        final String fullHeaderAnalyzed = doc.get("fullHeaderAnalyzed");
        
        doc.add(config.getField("root", stripAlternatives(rootStem)));
        if (fullHeaderAnalyzed != null) {
            doc.add(config.getField("fullHeader", stripAlternatives(fullHeaderAnalyzed)));
        }
        doc.add(config.getField("expandedReferences", expandRefs(doc.get("references"))));
        doc.add(config.getField("fullTerm", rootStem + " " + fullHeaderAnalyzed));
    }

    /**
     * Strips the characters between a [ and ] to leave just the title
     *
     * @param rootFullAlternatives the root full alternatives
     * @return new title to use as the root element in the nave flattened tree
     */
    String stripAlternatives(final String rootFullAlternatives) {
        return STRIP_ALTERNATIVES.matcher(rootFullAlternatives).replaceAll(" ");
    }

    /**
     * Expand refs to their full blown set.
     *
     * @param refs the string
     * @return the string
     */
    private String expandRefs(final String refs) {
        try {
            return this.jswordPassage.getAllReferences(refs, "ESV_th");
        } catch (final StepInternalException ex) {
            LOGGER.error("Nave data: {}", ex.getMessage());
            LOGGER.trace("Expanded refs failed", ex);
        }
        return refs;
    }
}
