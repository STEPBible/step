package com.tyndalehouse.step.core.service;

import org.crosswire.jsword.passage.BitwisePassage;
import org.crosswire.jsword.passage.RocketPassage;
import org.crosswire.jsword.versification.system.Versifications;

import java.io.Serializable;
import java.util.HashMap;

/**
 * Load translation tips to memory.  It is used in verses vocabulary.
 */
public interface TranslationTipsService {

    void readAndLoad(final String translationTipsPath, final String installFile);
    void loadFromSerialization(final String installFilePath);
    
    public static class TranslationTips implements Serializable {
        public BitwisePassage regularFormatedFN = new RocketPassage(Versifications.instance().getVersification("NRSV"));
        public BitwisePassage alternativeFormatedFN = new RocketPassage(Versifications.instance().getVersification("NRSV"));
        public HashMap<Integer, String> customFN = new HashMap<Integer, String>();

    }

    public static TranslationTips translationTips = new TranslationTips();
}
