package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.utils.StringUtils.split;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.service.MorphologyService;

/**
 * Provides quick access to the morphology from a code found in the xsl transformation
 */
@Singleton
public class MorphologyServiceImpl implements MorphologyService {
    private static final String SPACE_SEPARATOR = " ";
    private static final Logger LOGGER = LoggerFactory.getLogger(MorphologyServiceImpl.class);
    private static final String ROBINSON_PREFIX = "robinson:";
    private static final int ROBINSON_PREFIX_LENGTH = ROBINSON_PREFIX.length();
    private static final String NON_BREAKING_SPACE = "&nbsp;";
    private final EntityIndexReader morphology;

    /**
     * @param manager the entity manager
     */
    @Inject
    public MorphologyServiceImpl(final EntityManager manager) {
        this.morphology = manager.getReader("morphology");
    }

    @Override
    public List<EntityDoc> getMorphology(final String code) {
        // split code into keys
        final String[] codes = split(code, SPACE_SEPARATOR);
        final List<EntityDoc> morphs = new ArrayList<EntityDoc>(codes.length);
        for (final String c : codes) {
            // check cache for key, otherwise obtain from database
            final EntityDoc item = retrieveMorphologyByLongName(c);

            if (item != null) {
                morphs.add(item);
            }
        }
        return morphs;
    }

    @Override
    public List<EntityDoc> getQuickMorphology(final String code) {
        // very little information available, so let's return it all
        return getMorphology(code);
    }

    /**
     * Cache-based method, retrieves morphology information
     * 
     * @param code long code including scheme (e.g. robinson:) to the morphology item
     * @return the morphology of interest
     */
    @SuppressWarnings("PMD")
    private EntityDoc retrieveMorphologyByLongName(final String code) {
        final String key = code.startsWith(ROBINSON_PREFIX) ? code.substring(ROBINSON_PREFIX_LENGTH) : code;

        final long currentTimeNanos = System.nanoTime();
        final EntityDoc[] entry = this.morphology.searchExactTermBySingleField("code", 1, key);
        LOGGER.debug("Took [{}] nano-seconds", System.nanoTime() - currentTimeNanos);
        return entry.length > 0 ? entry[0] : null;
    }

    /**
     * @param code the code encountered during the xsl transformation
     * @return the string to be displayed to the user
     */
    public String getDisplayMorphology(final String code) {
        final List<EntityDoc> morphologies = getMorphology(code);
        final StringBuilder sb = new StringBuilder(128);
        for (final EntityDoc m : morphologies) {
            sb.append(m.get("inlineHtml"));
            sb.append(NON_BREAKING_SPACE);
        }
        return sb.toString();
    }
}
