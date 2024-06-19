package com.tyndalehouse.step.core.service;

import org.crosswire.jsword.passage.BitwisePassage;
import org.crosswire.jsword.passage.RocketPassage;
import org.crosswire.jsword.versification.system.Versifications;

import java.util.HashMap;

/**
 * Given a strong number, we find the augmented version in order to provide more accurate definitions and context
 */
public interface TranslationTipsService {

    void readAndLoad(final String translationTipsPath);

    public static BitwisePassage regularFormatedFN = new RocketPassage(Versifications.instance().getVersification("NRSV"));
    public static BitwisePassage alternativeFormatedFN = new RocketPassage(Versifications.instance().getVersification("NRSV"));
    public static HashMap<Integer, String> customFN = new HashMap<Integer, String>();
}
