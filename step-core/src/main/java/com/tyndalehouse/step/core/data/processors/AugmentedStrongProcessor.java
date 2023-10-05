package com.tyndalehouse.step.core.data.processors;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.create.PostProcessor;
import org.apache.lucene.document.Document;

/**
 * Adds generated fields to the entity document - affects both "definition" and "specificForm"
 */
public class AugmentedStrongProcessor implements PostProcessor {

    @Override
    public void process(final EntityConfiguration config, final Document doc) {
    }
}
