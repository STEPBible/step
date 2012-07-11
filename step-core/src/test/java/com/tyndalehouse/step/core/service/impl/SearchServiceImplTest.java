package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.entities.LexiconDefinition;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.TimelineEventSearchEntry;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordSearchServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordVersificationServiceImpl;

/**
 * Search service testing
 * 
 * @author chrisburrell
 * 
 */
public class SearchServiceImplTest extends DataDrivenTestExtension {
    /** test exact strong match */
    @Test
    public void testSearchStrong() {
        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();
        final SearchServiceImpl si = new SearchServiceImpl(getEbean(), new JSwordSearchServiceImpl(
                versificationService), new JSwordPassageServiceImpl(versificationService, null, null));

        final SearchResult searchStrong = si.searchStrong("KJV", "G16");
        assertTrue("1 Peter 4:19".equals(((VerseSearchEntry) searchStrong.getResults().get(0)).getKey()));
    }

    /** test exact strong match */
    @Test
    public void testSearchRelatedStrongs() {
        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();
        final SearchServiceImpl si = new SearchServiceImpl(getEbean(), new JSwordSearchServiceImpl(
                versificationService), new JSwordPassageServiceImpl(versificationService, null, null));

        final LexiconDefinition ld = new LexiconDefinition();
        ld.setStrong("G0016");
        getEbean().save(ld);

        final LexiconDefinition related = new LexiconDefinition();
        related.setStrong("G0015");
        getEbean().save(related);

        ld.getSimilarStrongs().add(related);
        getEbean().save(ld);

        final SearchResult searchStrong = si.searchRelatedStrong("KJV", "G16");
        assertEquals("strong:g0016 strong:g0015", searchStrong.getQuery().trim());
    }

    /** test exact strong match */
    @Test
    public void testSearchTimelineDescription() {
        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();
        final SearchServiceImpl si = new SearchServiceImpl(getEbean(), new JSwordSearchServiceImpl(
                versificationService), new JSwordPassageServiceImpl(versificationService, null, null));

        // write test event to db
        final TimelineEvent e = new TimelineEvent();
        e.setName("Golden Calf episode");
        final List<ScriptureReference> references = new ArrayList<ScriptureReference>();
        final ScriptureReference sr = new ScriptureReference();
        sr.setStartVerseId(10);
        sr.setEndVerseId(15);
        references.add(sr);
        e.setReferences(references);
        getEbean().save(e);

        final SearchResult result = si.searchTimelineDescription("ESV", "calf");
        final TimelineEventSearchEntry timelineEventSearchEntry = (TimelineEventSearchEntry) result
                .getResults().get(0);
        assertEquals("Golden Calf episode", timelineEventSearchEntry.getDescription());
        assertEquals(timelineEventSearchEntry.getVerses().get(0).getKey(), "Genesis 1:7-12");
    }
}
