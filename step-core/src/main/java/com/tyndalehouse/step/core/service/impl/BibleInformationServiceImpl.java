package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.models.LookupOption.INTERLINEAR;
import static com.tyndalehouse.step.core.models.LookupOption.STRONG_NUMBERS;
import static com.tyndalehouse.step.core.utils.JSwordUtils.getSortedSerialisableList;
import static org.apache.commons.lang.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.BookCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
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
@Singleton
public class BibleInformationServiceImpl implements BibleInformationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(BibleInformationServiceImpl.class);
    private final List<String> defaultVersions;
    private final JSwordService jsword;

    /**
     * The bible information service, retrieving content and meta data
     * 
     * @param defaultVersions a list of the default versions that should be installed
     * @param jsword the jsword service
     */
    @Inject
    public BibleInformationServiceImpl(@Named("defaultVersions") final List<String> defaultVersions,
            final JSwordService jsword) {
        this.jsword = jsword;
        this.defaultVersions = defaultVersions;
    }

    @Override
    public List<BibleVersion> getAvailableBibleVersions() {
        LOGGER.info("Getting bible versions");
        return getSortedSerialisableList(this.jsword.getInstalledModules(BookCategory.BIBLE));
    }

    @Override
    public String getPassageText(final String version, final String reference,
            final List<LookupOption> options, final String interlinearVersion) {
        return this.jsword.getOsisText(version, reference, options, interlinearVersion);
    }

    @Override
    public List<EnrichedLookupOption> getAllFeatures() {
        final LookupOption[] lo = LookupOption.values();
        final List<EnrichedLookupOption> elo = new ArrayList<EnrichedLookupOption>(lo.length + 1);

        for (int ii = 0; ii < lo.length; ii++) {
            final String displayName = lo[ii].name();
            if (isNotBlank(displayName)) {
                elo.add(new EnrichedLookupOption(displayName, lo[ii].toString(), lo[ii].isEnabledByDefault()));
            }
        }

        return elo;
    }

    @Override
    public List<LookupOption> getFeaturesForVersion(final String version) {
        final List<LookupOption> features = this.jsword.getFeatures(version);
        if (features.contains(STRONG_NUMBERS)) {
            features.add(INTERLINEAR);
        }
        return features;
    }

    @Override
    public boolean hasCoreModules() {
        for (final String version : this.defaultVersions) {
            if (!this.jsword.isInstalled(version)) {
                return false;
            }
        }
        return true;
    }

    @Override
    public void installDefaultModules() {
        // we install the module for every core module in the list
        for (final String book : this.defaultVersions) {
            this.jsword.installBook(book);
        }
    }

    @Override
    public void installModules(final String reference) {
        this.jsword.installBook(reference);
    }
}
