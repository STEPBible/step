package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.meanings.VersionPhraseAlternative;
import com.tyndalehouse.step.core.models.meanings.VersionVersePhraseOption;
import com.tyndalehouse.step.core.models.meanings.VersionVerses;
import com.tyndalehouse.step.core.models.meanings.VersionsData;
import com.tyndalehouse.step.core.service.AlternativeVersionsService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.lang.String.format;

/**
 * Gives access to the underlying index
 */
public class AlternativeTranslationsServiceImpl implements AlternativeVersionsService {
    private final JSwordPassageService passageService;
    private final EntityIndexReader alternativeTranslations;
    private final String[][] fields;

    /**
     * Instantiates a new alternative translations service impl.
     * 
     * @param passageService the passage service
     * @param entityManager the entity manager
     */
    @Inject
    public AlternativeTranslationsServiceImpl(final JSwordPassageService passageService,
            final EntityManager entityManager) {
        this.passageService = passageService;
        this.alternativeTranslations = entityManager.getReader("alternativeTranslations");

        this.fields = new String[10][3];
        // max fields currently at 10.
        for (int ii = 0; ii < 10; ii++) {
            this.fields[ii] = new String[] { format("optionsAlternative%d", ii), format("optionsType%d", ii),
                    format("optionsQualifier%d", ii) };
        }
    }

    @Override
    public VersionsData get(final String passage) {
        final String allReferences = this.passageService.getAllReferences(passage, "ESV_th");
        final EntityDoc[] docs = this.alternativeTranslations.searchSingleColumn("reference", allReferences);

        final Map<String, VersionVerses> referenceToVV = new HashMap<String, VersionVerses>();

        final List<VersionVerses> versionVerses = new ArrayList<VersionVerses>(64);
        final VersionsData data = new VersionsData(versionVerses);

        // iterate through each entry. There are multiple entries per verse, e.g. multiple fragments within
        // the same verse
        for (final EntityDoc d : docs) {
            // obtain the correct verse
            final VersionVerses vv = getCurrentRefVersionVerses(referenceToVV, versionVerses, d);

            // add an option
            final VersionVersePhraseOption phraseChangeOption = new VersionVersePhraseOption(
                    d.get("matchingText"), d.get("fullText"), new ArrayList<VersionPhraseAlternative>(8));
            vv.getOptions().add(phraseChangeOption);

            for (int ii = 0; ii < this.fields.length; ii++) {
                if (d.get(this.fields[ii][0]) != null) {
                    final VersionPhraseAlternative singlePhraseAlternative = new VersionPhraseAlternative(
                            d.get(this.fields[ii][0]), d.get(this.fields[ii][1]), d.get(this.fields[ii][2]));
                    phraseChangeOption.getPhraseAlternatives().add(singlePhraseAlternative);
                }
            }
        }

        return data;
    }

    /**
     * Gets the current versionVerses object for a particular reference, creating it if it does not already
     * exist
     * 
     * @param referenceToVV the reference to vv
     * @param versionVerses the version verses
     * @param d the d
     * @return the current ref version verses
     */
    private VersionVerses getCurrentRefVersionVerses(final Map<String, VersionVerses> referenceToVV,
            final List<VersionVerses> versionVerses, final EntityDoc d) {
        final String reference = d.get("reference");
        VersionVerses vv = referenceToVV.get(reference);
        if (vv == null) {
            vv = new VersionVerses(reference, new ArrayList<VersionVersePhraseOption>(8));

            // add to the set of verses returned
            versionVerses.add(vv);
            referenceToVV.put(reference, vv);
        }

        return vv;
    }
}
