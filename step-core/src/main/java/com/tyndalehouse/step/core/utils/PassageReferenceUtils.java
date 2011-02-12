package com.tyndalehouse.step.core.utils;

import static java.lang.Integer.valueOf;
import static org.apache.commons.lang.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.passage.KeyFactory;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.NoSuchVerseException;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.RocketPassage;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.ScriptureTarget;
import com.tyndalehouse.step.core.data.entities.reference.TargetType;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * A helper class to deal with passage references
 * 
 * @author Chris
 * 
 * 
 */
public final class PassageReferenceUtils {
    private static final Logger LOG = LoggerFactory.getLogger(PassageReferenceUtils.class);

    /** prevent initialisation */
    private PassageReferenceUtils() {
        // no implementation
    }

    /**
     * 
     * @param references a list of references
     * @param target id of the event
     * @return the list of references strongly-typed
     */
    public static List<ScriptureReference> getPassageReferences(final ScriptureTarget target,
            final String references) {
        final List<ScriptureReference> refs = new ArrayList<ScriptureReference>();

        if (isNotBlank(references)) {
            LOG.debug("Resolving references for [{}]", references);
            try {
                final KeyFactory keyFactory = PassageKeyFactory.instance();
                final RocketPassage rp = (RocketPassage) keyFactory.getKey(references);
                for (int ii = 0; ii < rp.countRanges(RestrictionType.NONE); ii++) {
                    final VerseRange vr = rp.getRangeAt(ii, RestrictionType.NONE);
                    final Verse start = vr.getStart();
                    final Verse end = vr.getEnd();

                    final int startVerseId = start.getOrdinal();
                    final int endVerseId = end.getOrdinal();

                    LOG.trace("Found reference [{}] to [{}]", valueOf(startVerseId), valueOf(endVerseId));
                    final ScriptureReference sr = new ScriptureReference();

                    // TODO fix this:
                    sr.setTarget(target);

                    sr.setStartVerseId(startVerseId);
                    sr.setEndVerseId(endVerseId);
                    sr.setTargetType(TargetType.TIMELINE_EVENT);
                    refs.add(sr);
                }
            } catch (final NoSuchVerseException nsve) {
                // Nehemiah 6.20 might not exist for example...
                LOG.error("Scripture reference does not exist", nsve);
            } catch (final NoSuchKeyException e) {
                throw new StepInternalException(e.getMessage(), e);
            }
        }
        return refs;
    }
}
