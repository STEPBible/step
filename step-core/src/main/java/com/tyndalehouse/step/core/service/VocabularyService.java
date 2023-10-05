package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.models.VocabResponse;

/**
 * The service providing morphology information
 */
public interface VocabularyService {
    /**
     *
     * @param version
     * @param vocabIdentifiers the identifier of the vocab entry (e.g. strong:G0001)
     * @return the lexicon definitions
     */
    VocabResponse getDefinitions(final String version, String reference, String vocabIdentifiers, String userLanguage);

    /**
     * Gets the default transliteration as a string
     * 
     *
     * @param version
     * @param vocabIdentifiers the vocab identifiers
     * @param reference the reference in which the strongs can be found
     * @return the string to be displayed
     */
    String getDefaultTransliteration(final String version, String vocabIdentifiers, final String reference);

    /**
     * For a given version, we transliterate the top line
     * @param originalText the original text
     * @return the transliterated text
     */
    String getTransliteration(String originalText);

    /**
     * gets the English vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String getEnglishVocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * gets the Spanish vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String get_es_Vocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * gets the traditional Chinese vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String get_zh_tw_Vocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * gets the simplified Chinese vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String get_zh_Vocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * Gets the Greek vocab fields
     * 
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the vocab identifiers
     * @return the string to be displayed
     */
    String getGreekVocab(final String version, final String reference, String vocabIdentifiers);

    /**
     * Gets quick information about the particular identifiers
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the identifier
     * @return the quick information
     */
    VocabResponse getQuickDefinitions(final String version, final String reference, String vocabIdentifiers, String userLanguage);

    /**
     * returns the lexicon definitions
     *
     * @param version the version that ancors the reference
     * @param reference the reference in which the strongs can be found
     * @param vocabIdentifiers the identifier
     * @return the lexicon definitions that were found
     */
    EntityDoc[] getLexiconDefinitions(String vocabIdentifiers, String version, String reference);
}
