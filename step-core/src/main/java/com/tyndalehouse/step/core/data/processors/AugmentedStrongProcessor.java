package com.tyndalehouse.step.core.data.processors;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.create.PostProcessor;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import org.apache.lucene.document.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.regex.Pattern;

/**
 * Adds generated fields to the entity document - affects both "definition" and "specificForm"
 *
 * @author chrisburrell
 */
public class AugmentedStrongProcessor implements PostProcessor {

    @Override
    public void process(final EntityConfiguration config, final Document doc) {
//        final String augmentedStrong = doc.get("augmentedStrong");
//        doc.add(config.getField("suffix", Character.toString(augmentedStrong.charAt(augmentedStrong.length()-1))));
    }
}
