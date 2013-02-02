package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.UserExceptionType;
import com.tyndalehouse.step.core.service.VocabularyService;

/**
 * defines all vocab related queries
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class VocabularyServiceImpl implements VocabularyService {
    private static final String MULTI_WORD_SEPARATOR = " | ";
    private static final Logger LOGGER = LoggerFactory.getLogger(VocabularyServiceImpl.class);
    private static final String STRONG_SEPARATORS = "[ ,]+";
    private static final String HIGHER_STRONG = "STRONG:";
    private static final String LOWER_STRONG = "strong:";
    private static final int START_STRONG_KEY = HIGHER_STRONG.length();
    private final EntityIndexReader definitions;

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
    private final LexiconDataProvider greekVocabProvider = new LexiconDataProvider() {
        @Override
        public String getData(final EntityDoc l) {
            return l.get("accentedUnicode");
        }
    };

    /**
     * @param manager the entity manager
     */
    @Inject
    public VocabularyServiceImpl(final EntityManager manager) {
        this.definitions = manager.getReader("definition");
    }

    @Override
    public EntityDoc[] getDefinitions(final String vocabIdentifiers) {
        notBlank(vocabIdentifiers, "Vocab identifiers was null", UserExceptionType.SERVICE_VALIDATION_ERROR);
        final String[] strongList = getKeys(vocabIdentifiers);

        if (strongList.length != 0) {
            return this.definitions.searchUniqueBySingleField("strongNumber", strongList);
        }
        return new EntityDoc[0];
    }

    @Override
    public EntityDoc[] getQuickDefinitions(final String vocabIdentifiers) {
        notBlank(vocabIdentifiers, "Vocab identifiers was null", UserExceptionType.SERVICE_VALIDATION_ERROR);
        final String[] strongList = getKeys(vocabIdentifiers);

        if (strongList.length != 0) {
            return this.definitions.searchUniqueBySingleField("strongNumber", strongList);
        }
        return new EntityDoc[0];
    }

    @Override
    public String getEnglishVocab(final String vocabIdentifiers) {
        return getDataFromLexiconDefinition(vocabIdentifiers, this.englishVocabProvider);
    }

    @Override
    public String getGreekVocab(final String vocabIdentifiers) {
        return getDataFromLexiconDefinition(vocabIdentifiers, this.greekVocabProvider);
    }

    @Override
    public String getDefaultTransliteration(final String vocabIdentifiers) {
        return getDataFromLexiconDefinition(vocabIdentifiers, this.transliterationProvider);
    }

    /**
     * gets data from the matched lexicon definitions
     * 
     * @param vocabIdentifiers the identifiers
     * @param provider the provider used to get data from it
     * @return the data in String form
     */
    private String getDataFromLexiconDefinition(final String vocabIdentifiers,
            final LexiconDataProvider provider) {
        final String[] keys = getKeys(vocabIdentifiers);
        if (keys.length == 0) {
            return "";
        }

        // else we lookup and concatenate
        final EntityDoc[] lds = getLexiconDefinitions(keys);

        if (lds.length == 0) {
            return vocabIdentifiers;
        }

        if (lds.length == 1) {
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

    /**
     * returns the lexicon definitions
     * 
     * @param keys the keys to match
     * @return the lexicon definitions that were found
     */
    private EntityDoc[] getLexiconDefinitions(final String[] keys) {
        return this.definitions.searchUniqueBySingleField("strongNumber", keys);
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

    /**
     * Pads a strong number with the correct number of 0s
     * 
     * @param strongNumber the strong number
     * @param prefix true to indicate the strongNumber is preceded with strong:
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
                return String.format("%c%04d", strongNumber.charAt(baseIndex), Integer.parseInt(first4Chars));
            }

            return "err";
        }
    }
}
