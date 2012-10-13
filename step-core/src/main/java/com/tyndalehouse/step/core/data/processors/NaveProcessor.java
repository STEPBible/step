package com.tyndalehouse.step.core.data.processors;

import org.apache.lucene.document.Document;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.create.PostProcessor;

/**
 * Adds generated fields to the entity document - affects both "definition" and "specificForm"
 * 
 * @author chrisburrell
 * 
 */
public class NaveProcessor implements PostProcessor {

    @Override
    public void process(final EntityConfiguration config, final Document doc) {
        doc.add(config.getField("rootStem", doc.get("root")));

    }
}
