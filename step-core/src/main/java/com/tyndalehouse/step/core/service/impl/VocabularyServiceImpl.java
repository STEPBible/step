/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 *
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.UserExceptionType;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.VocabResponse;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.VocabularyService;
import com.tyndalehouse.step.core.service.helpers.OriginalWordUtils;
import com.tyndalehouse.step.core.utils.SortingUtils;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import org.codehaus.jackson.map.util.LRUMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.*;
import java.util.Map.Entry;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;

/**
 * defines all vocab related queries
 *
 * @author chrisburrell
 */
@Singleton
public class VocabularyServiceImpl implements VocabularyService {
    private static final String MULTI_WORD_SEPARATOR = " | ";
    private static final Logger LOGGER = LoggerFactory.getLogger(VocabularyServiceImpl.class);
    private static final String STRONG_SEPARATORS = "[ ,]+";
    private static final String HIGHER_STRONG = "STRONG:";
    private static final String LOWER_STRONG = "strong:";
    private static final int START_STRONG_KEY = HIGHER_STRONG.length();
    private static final LRUMap<String, EntityDoc[]> DEFINITION_CACHE = new LRUMap<>(512, 1024);
    private final EntityIndexReader definitions;
    private final StrongAugmentationService strongAugmentationService;

    // define a few extraction methods
    private final LexiconDataProvider transliterationProvider = new LexiconDataProvider() {
        @Override
        public String getData(final EntityDoc l) {
            return l.get("stepTransliteration");
        }
    };
    private final LexiconDataProvider englishVocabProvider = new LexiconDataProvider() {
        @Override
        public String getData(final EntityDoc l) {
            return l.get("stepGloss");
        }
    };
	private final LexiconDataProvider es_VocabProvider = new LexiconDataProvider() {
        @Override
        public String getData(final EntityDoc l) {
            return l.get("es_Gloss");
        }
    };
    private final LexiconDataProvider zh_tw_VocabProvider = new LexiconDataProvider() {
        @Override
        public String getData(final EntityDoc l) {
            return l.get("zh_tw_Gloss");
        }
    };
    private final LexiconDataProvider zh_VocabProvider = new LexiconDataProvider() {
        @Override
        public String getData(final EntityDoc l) {
            return l.get("zh_Gloss");
        }
    };
    private final LexiconDataProvider greekVocabProvider = new LexiconDataProvider() {
        @Override
        public String getData(final EntityDoc l) {
            return l.get("accentedUnicode");
        }
    };

    /**
     * @param manager the entity manager
     * @param strongAugmentationService service to look up and process Strong augmentation
     */
    @Inject
    public VocabularyServiceImpl(final EntityManager manager, final StrongAugmentationService strongAugmentationService) {
        this.strongAugmentationService = strongAugmentationService;
        this.definitions = manager.getReader("definition");
    }

    /**
     * Pads a strong number with the correct number of 0s
     *
     * @param strongNumber the strong number
     * @param prefix       true to indicate the strongNumber is preceded with strong:
     * @return the padded strong number
     */
    public static String padStrongNumber(final String strongNumber, final boolean prefix) {
        final int baseIndex = prefix ? START_STRONG_KEY : 0;
        String subStrong = null;
        try {
            subStrong = strongNumber.substring(baseIndex + 1);
            return String.format("%c%04d", strongNumber.charAt(baseIndex), Integer.parseInt(subStrong));
        } catch (final NumberFormatException e) {
            LOGGER.trace("Unable to parse strong number.", e);
            // deals with dodgy modules
            // perhaps someone added some random information at the end
            if (subStrong != null && subStrong.length() > 3) {
                final String first4Chars = subStrong.substring(0, 4);
                try {
                    String suffix = subStrong.length() > 4 && Character.isAlphabetic(subStrong.charAt(4)) ? subStrong.substring(4, 5) : "";
                    return String.format("%c%04d%s", strongNumber.charAt(baseIndex),
                            Integer.parseInt(first4Chars), suffix);
                } catch (final NumberFormatException ex) {
                    // couldn't convert to a padded number
                    LOGGER.trace("Unable to convert [{}] to a padded number.", first4Chars);
                    return strongNumber;
                }
            }

            return "err";
        }
    }

    @Override
    public VocabResponse getDefinitions(final String version, final String reference, final String vocabIdentifiers, final String userLanguage) {
        notBlank(vocabIdentifiers, "Vocab identifiers was null", UserExceptionType.SERVICE_VALIDATION_ERROR);
        final String[] strongList = this.strongAugmentationService.augment(version, reference, getKeys(vocabIdentifiers));

        if (strongList.length != 0) {
            final EntityDoc[] strongDefs = this.definitions.searchUniqueBySingleField("strongNumber", userLanguage, strongList);
            for (int i = 0; i < strongDefs.length; i ++) {
                if ((userLanguage != null) && (!userLanguage.equals(""))) {
                    if (!userLanguage.equalsIgnoreCase("es")) {
                        strongDefs[0].removeField("es_Gloss");
                        strongDefs[0].removeField("es_Definition");
                    }
                    if (!userLanguage.equalsIgnoreCase("zh")) {
                        strongDefs[0].removeField("zh_Gloss");
                        strongDefs[0].removeField("zh_Definition");
                    }
                    if (!userLanguage.equalsIgnoreCase("zh_tw")) {
                        strongDefs[0].removeField("zh_tw_Gloss");
                        strongDefs[0].removeField("zh_tw_Definition");
                    }
                    if (!userLanguage.equalsIgnoreCase("vi")) {
                        strongDefs[0].removeField("vi_Definition");
                    }
                }
            }
            final EntityDoc[] definitions = reOrder(strongList, strongDefs);
            final Map<String, List<LexiconSuggestion>> relatedWords = readRelatedWords(definitions, userLanguage);
            return new VocabResponse(definitions, relatedWords);
        }

        return new VocabResponse();
    }


    /**
     * Read related words, i.e. all the words that are in the related numbers fields.
     *
     * @param defs the definitions that have been looked up.
     * @return the map
     */
    private Map<String, List<LexiconSuggestion>> readRelatedWords(final EntityDoc[] defs, final String userLanguage) {
        // this map keys the original word strong number to all the related codes
        final Map<String, SortedSet<LexiconSuggestion>> relatedWords = new HashMap<>(
                defs.length * 2);

        // to avoid doing lookups twice, we key each short definition by its code as well
        final Map<String, LexiconSuggestion> lookedUpWords = new HashMap<>(
                defs.length * 2);

        for (final EntityDoc doc : defs) {
            final String sourceNumber = doc.get("strongNumber");
            final String relatedWordNumbers = doc.get("relatedNumbers");
            final String[] allRelatedWords = split(relatedWordNumbers, "[ ,]+");
            for (final String relatedWord : allRelatedWords) {
                LexiconSuggestion shortLexiconDefinition = lookedUpWords.get(relatedWord);

                // look up related word from index
                if (shortLexiconDefinition == null) {
                    final EntityDoc[] relatedDoc = this.definitions.searchUniqueBySingleField("strongNumber", userLanguage, relatedWord);
                    // assume first doc
                    if (relatedDoc.length > 0) {
                        shortLexiconDefinition = OriginalWordUtils.convertToSuggestion(relatedDoc[0], userLanguage);
                        lookedUpWords.put(relatedWord, shortLexiconDefinition);
                    }
                }

                // store as a link to its source number
                if (shortLexiconDefinition != null) {
                    SortedSet<LexiconSuggestion> associatedNumbersSoFar = relatedWords.get(sourceNumber);
                    if (associatedNumbersSoFar == null) {
                        associatedNumbersSoFar = new TreeSet<>(
                                SortingUtils.LEXICON_SUGGESTION_COMPARATOR);
                        relatedWords.put(sourceNumber, associatedNumbersSoFar);
                    }

                    associatedNumbersSoFar.add(shortLexiconDefinition);
                }
            }
        }
        return convertToListMap(relatedWords);
    }

    /**
     * Convert to list map, from a map of sets to a map of lists. This also orders the definitions.
     *
     * @param relatedWords the related words
     * @return the map
     */
    private Map<String, List<LexiconSuggestion>> convertToListMap(
            final Map<String, SortedSet<LexiconSuggestion>> relatedWords) {
        final Map<String, List<LexiconSuggestion>> results = new HashMap<>();
        for (final Entry<String, SortedSet<LexiconSuggestion>> relatedWordSet : relatedWords.entrySet()) {
            results.put(relatedWordSet.getKey(), new ArrayList<>(relatedWordSet.getValue()));
        }
        return results;
    }

    /**
     * Re-orders based on the input.
     *
     * @param strongList the order list of stongs
     * @param strongDefs the definitions that have been found
     * @return the entity doc[]
     */
    private EntityDoc[] reOrder(final String[] strongList, final EntityDoc[] strongDefs) {
        final Map<String, EntityDoc> entitiesByStrong = new HashMap<>(strongList.length * 2);
        for (final EntityDoc def : strongDefs) {
            entitiesByStrong.put(def.get("strongNumber"), def);
        }

        final EntityDoc[] results = new EntityDoc[strongDefs.length];
        int current = 0;
        for (final String strong : strongList) {
            final EntityDoc entityDoc = entitiesByStrong.get(strong);
            if (entityDoc != null) {
                results[current++] = entityDoc;
            }
        }

        return results;
    }

    @Override
    public VocabResponse getQuickDefinitions(final String version, final String reference, final String vocabIdentifiers, final String userLanguage) {
        notBlank(vocabIdentifiers, "Vocab identifiers was null", UserExceptionType.SERVICE_VALIDATION_ERROR);
        final String[] strongList = this.strongAugmentationService.augment(version, reference, getKeys(vocabIdentifiers));

        if (strongList.length != 0) {
            EntityDoc[] strongNumbers = this.definitions.searchUniqueBySingleField("strongNumber", userLanguage, strongList);
            final EntityDoc[] definitions = reOrder(strongList, strongNumbers);
            return new VocabResponse(definitions);
        }
        return new VocabResponse();
    }

    @Override
    public String getTransliteration(final String originalText) {
        return StringConversionUtils.transliterate(originalText);
    }

    @Override
    public String getEnglishVocab(final String version, final String reference, final String vocabIdentifiers) {
        return getDataFromLexiconDefinition(version, reference, checkStrongCode(vocabIdentifiers), this.englishVocabProvider);
    }

    // The Spanish SpaRV1909 uses a "Strong:" tag.  Change "Strong:" or "StRoNg:" (any upper or lower case) to "strong:"
    public String checkStrongCode(final String input) {
        String result = input;
        if (result.length() > 10) {
            String prefixTmp = result.substring(0, 7);
            if ((!prefixTmp.equals("strong:")) && (prefixTmp.equalsIgnoreCase("strong:")))
                result = "strong:" + result.substring(7);
        }
        return result;
    }

    @Override
    public String get_es_Vocab(final String version, final String reference, String vocabIdentifiers) {
        return getDataFromLexiconDefinition(version, reference, checkStrongCode(vocabIdentifiers), this.es_VocabProvider);
    }
	
    @Override
    public String get_zh_tw_Vocab(final String version, final String reference, final String vocabIdentifiers) {
        return getDataFromLexiconDefinition(version, reference, vocabIdentifiers, this.zh_tw_VocabProvider);
    }

    @Override
    public String get_zh_Vocab(final String version, final String reference, final String vocabIdentifiers) {
        return getDataFromLexiconDefinition(version, reference, vocabIdentifiers, this.zh_VocabProvider);
    }

    @Override
    public String getGreekVocab(final String version, final String reference, final String vocabIdentifiers) {
        return getDataFromLexiconDefinition(version, reference, checkStrongCode(vocabIdentifiers), this.greekVocabProvider);
    }

    @Override
    public String getDefaultTransliteration(final String version, final String reference, final String vocabIdentifiers) {
        return getDataFromLexiconDefinition(version, reference, checkStrongCode(vocabIdentifiers), this.transliterationProvider);
    }

    /**
     * gets data from the matched lexicon definitions
     *
     * @param reference        the reference that anchors the strong number
     * @param vocabIdentifiers the identifiers
     * @param provider         the provider used to get data from it
     * @return the data in String form
     */
    private String getDataFromLexiconDefinition(final String version, final String reference, final String vocabIdentifiers,
                                                final LexiconDataProvider provider) {

        // else we lookup and concatenate
        EntityDoc[] lds = getLexiconDefinitions(vocabIdentifiers, version, reference);

        if (lds.length == 0) {
            return vocabIdentifiers;
        }
        else if (lds.length == 1) {
            return provider.getData(lds[0]);
        }

        // otherwise, we need to resort to concatenating the fields
        final StringBuilder sb = new StringBuilder(lds.length * 32);
        sb.append('[');

        for (int ii = 0; ii < lds.length; ii++) {
            final EntityDoc l = lds[ii];
            sb.append(provider.getData(l));
            if (ii + 1 < lds.length) {
                sb.append(MULTI_WORD_SEPARATOR);
            }
        }
        sb.append(']');
        return sb.toString();
    }

    @Override
    public synchronized EntityDoc[] getLexiconDefinitions(final String vocabIdentifiers, final String version, final String reference) {
        final String[] keys = this.strongAugmentationService.augment(version, reference, getKeys(vocabIdentifiers));
        if (keys.length == 0) {
            return new EntityDoc[0];
        }

        EntityDoc[] entityDocsResults = new EntityDoc[keys.length];
        int resultArrayIndex = 0;
        for (String key : keys) {
            if ((key.substring(0, 1).equalsIgnoreCase("h")) ||
                    (key.substring(0, 1).equalsIgnoreCase("g"))) {
                EntityDoc[] strongNumber = DEFINITION_CACHE.get(key);
                if (strongNumber != null) {
                    entityDocsResults[resultArrayIndex] = strongNumber[0];
                    resultArrayIndex++;
                } else {
                    String[] tmpKeys = {key};
                    boolean triedA = false;
                    boolean triedG = false;
                    while (tmpKeys[0].length() > 0) {
                        strongNumber = this.definitions.searchUniqueBySingleField("strongNumber", null, tmpKeys);
                        if ((strongNumber != null) && (strongNumber.length > 0)) {
                            DEFINITION_CACHE.put(key, strongNumber);
                            entityDocsResults[resultArrayIndex] = strongNumber[0];
                            resultArrayIndex++;
                            tmpKeys[0] = "";
                        } else {
                            if ((tmpKeys[0].length() >= 5) && ((!triedA) || (!triedG))) {
                                if (!Character.isDigit(tmpKeys[0].charAt(tmpKeys[0].length() - 1)))
                                    tmpKeys[0] = tmpKeys[0].substring(0, tmpKeys[0].length() - 1); // remove last character which is not a digit
                                if (!triedA) {
                                    triedA = true;
                                    tmpKeys[0] = tmpKeys[0].concat("A");
                                } else if (!triedG) { // Java compiler warns that this is always 'true'.  Compiler is not correct.
                                    triedG = true;
                                    tmpKeys[0] = tmpKeys[0].concat("G");
                                }
                            } else tmpKeys[0] = "";
                        }
                    }
                }
            }
        }

        if (resultArrayIndex == keys.length) return entityDocsResults;
        else if (resultArrayIndex == 0) return new EntityDoc[0];
        else if ((resultArrayIndex < keys.length) && (resultArrayIndex > 0)) {
            EntityDoc[] entityDocsResults2 = new EntityDoc[resultArrayIndex];
            System.arraycopy(entityDocsResults, 0, entityDocsResults2, 0, resultArrayIndex);
            return entityDocsResults2;
        }
        return new EntityDoc[0]; // Something wrong (resultArrayIndex = 0 or resultArrayIndex > keys.length)
    }

    /**
     * Extracts a compound key into several keys
     *
     * @param vocabIdentifiers the vocabulary identifiers
     * @return the list of all keys to lookup
     */
    String[] getKeys(final String vocabIdentifiers) {
        if (isBlank(vocabIdentifiers)) {
            return new String[0];
        }

        final String[] ids = vocabIdentifiers.split(STRONG_SEPARATORS);

        for (int ii = 0; ii < ids.length; ii++) {
            final char firstChar = ids[ii].charAt(0);
            if (firstChar == 'G' || firstChar == 'H') {
                ids[ii] = padStrongNumber(ids[ii], false);
            } else if ((ids[ii].startsWith(HIGHER_STRONG) || ids[ii].startsWith(LOWER_STRONG))
                    && ids[ii].length() > START_STRONG_KEY) {
                ids[ii] = padStrongNumber(ids[ii].substring(START_STRONG_KEY), false);
            }
        }
        return ids;
    }
}
