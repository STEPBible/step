package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.avaje.ebean.EbeanServer;
import com.tyndalehouse.step.core.data.entities.lexicon.Definition;
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
    private static final String STRONG_SEPARATORS = "[ ,]+";
    private static final String HIGHER_STRONG = "STRONG:";
    private static final String LOWER_STRONG = "strong:";
    private static final int START_STRONG_KEY = HIGHER_STRONG.length();
    private final EbeanServer ebean;

    // define a few extraction methods
    private final LexiconDataProvider transliterationProvider = new LexiconDataProvider() {
        @Override
        public String getData(final Definition l) {
            return l.getStepTransliteration();
        }
    };
    private final LexiconDataProvider englishVocabProvider = new LexiconDataProvider() {
        @Override
        public String getData(final Definition l) {
            return l.getStepGloss();
        }
    };
    private final LexiconDataProvider greekVocabProvider = new LexiconDataProvider() {
        @Override
        public String getData(final Definition l) {
            return l.getAccentedUnicode();
        }
    };

    /**
     * @param ebean the database server
     */
    @Inject
    public VocabularyServiceImpl(final EbeanServer ebean) {
        this.ebean = ebean;
    }

    @Override
    public List<Definition> getDefinitions(final String vocabIdentifiers) {
        notBlank(vocabIdentifiers, "Vocab identifiers was null", UserExceptionType.SERVICE_VALIDATION_ERROR);

        final List<String> strongList = getKeys(vocabIdentifiers);

        if (!strongList.isEmpty()) {
            return this.ebean.find(Definition.class).where().in("strongNumber", strongList).findList();
        }
        return new ArrayList<Definition>();

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
        final List<String> keys = getKeys(vocabIdentifiers);
        if (keys.isEmpty()) {
            return "";
        }

        // else we lookup and concatenate
        final List<Definition> lds = getLexiconDefinitions(keys);

        // TODO - if nothing there, for now we just return the ids we got
        if (lds.isEmpty()) {
            return vocabIdentifiers;
        }

        final StringBuilder sb = new StringBuilder(lds.size() * 32);
        for (final Definition l : lds) {
            sb.append(provider.getData(l));
        }

        return sb.toString();
    }

    /**
     * returns the lexicon definitions
     * 
     * @param keys the keys to match
     * @return the lexicon definitions that were found
     */
    private List<Definition> getLexiconDefinitions(final List<String> keys) {
        final List<Definition> lds = this.ebean.find(Definition.class)
                .select("accentedUnicode,stepTransliteration,stepGloss").where().in("strongNumber", keys)
                .findList();
        return lds;
    }

    /**
     * Extracts a compound key into several keys
     * 
     * @param vocabIdentifiers the vocabulary identifiers
     * @return the list of all keys to lookup
     */
    List<String> getKeys(final String vocabIdentifiers) {
        final List<String> idList = new ArrayList<String>();
        final String[] ids = vocabIdentifiers.split(STRONG_SEPARATORS);

        for (final String i : ids) {
            final char firstChar = i.charAt(0);
            if (firstChar == 'G' || firstChar == 'H') {
                idList.add(padStrongNumber(i, false));
            } else if ((i.startsWith(HIGHER_STRONG) || i.startsWith(LOWER_STRONG))
                    && i.length() > START_STRONG_KEY) {
                idList.add(padStrongNumber(i.substring(START_STRONG_KEY), false));
            }
        }
        return idList;
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
        return String.format("%c%04d", strongNumber.charAt(baseIndex),
                Integer.parseInt(strongNumber.substring(baseIndex + 1)));
    }
}
