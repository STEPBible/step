package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.models.LookupOption.INTERLINEAR;
import static com.tyndalehouse.step.core.models.LookupOption.STRONG_NUMBERS;
import static org.apache.commons.lang.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.FeatureType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.EnrichedLookupOption;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Command handler returning all available bible versions
 * 
 * @author CJBurrell
 */
public class BibleInformationServiceImpl implements BibleInformationService {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private JSwordService jsword;

    public List<BibleVersion> getBibleVersions() {
        this.logger.info("Getting bible versions");
        final List<Book> bibles = this.jsword.getModules(BookCategory.BIBLE);

        final List<BibleVersion> versions = new ArrayList<BibleVersion>();

        // we only send back what we need
        for (final Book b : bibles) {
            final BibleVersion v = new BibleVersion();
            v.setName(b.getName());
            v.setInitials(b.getInitials());
            v.setLanguage(b.getLanguage().getName());
            v.setHasStrongs(b.hasFeature(FeatureType.STRONGS_NUMBERS));
            versions.add(v);
        }

        this.logger.debug("Returning {} versions", bibles.size());
        return versions;
    }

    public String getPassageText(final String version, final String reference, final List<LookupOption> options,
            final String interlinearVersion) {
        return this.jsword.getOsisText(version, reference, options, interlinearVersion);
    }

    public List<EnrichedLookupOption> getAllFeatures() {
        final LookupOption[] lo = LookupOption.values();
        final List<EnrichedLookupOption> elo = new ArrayList<EnrichedLookupOption>(lo.length + 1);

        for (int ii = 0; ii < lo.length; ii++) {
            final String displayName = lo[ii].getDisplayName();
            if (isNotBlank(displayName)) {
                elo.add(new EnrichedLookupOption(displayName, lo[ii].toString(), lo[ii].isEnabledByDefault()));
            }
        }

        return elo;
    }

    public List<LookupOption> getFeaturesForVersion(final String version) {
        final List<LookupOption> features = this.jsword.getFeatures(version);
        if (features.contains(STRONG_NUMBERS)) {
            features.add(INTERLINEAR);
        }
        return features;
    }
}
