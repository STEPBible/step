package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.entities.LexiconDefinition;
import com.tyndalehouse.step.core.models.SearchResult;
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
        final SearchServiceImpl si = new SearchServiceImpl(getEbean(), new JSwordPassageServiceImpl(
                versificationService, null, null), new JSwordSearchServiceImpl(versificationService));

        final SearchResult searchStrong = si.searchStrong("KJV", "G16");
        assertTrue(searchStrong.getResults().get(0).getKey().equals("1 Peter 4:19"));
    }

    /** test exact strong match */
    @Test
    public void testSearchRelatedStrongs() {
        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();
        final SearchServiceImpl si = new SearchServiceImpl(getEbean(), new JSwordPassageServiceImpl(
                versificationService, null, null), new JSwordSearchServiceImpl(versificationService));

        final LexiconDefinition ld = new LexiconDefinition();
        ld.setStrong("G16");
        final LexiconDefinition related = new LexiconDefinition();
        related.setStrong("G0015");
        final List<LexiconDefinition> similarStrongs = new ArrayList<LexiconDefinition>();
        similarStrongs.add(related);
        ld.setSimilarStrongs(similarStrongs);

        getEbean().save(ld);
        getEbean().save(related);

        final SearchResult searchStrong = si.searchRelatedStrong("KJV", "G16");
        assertEquals("strong:G16 strong:G0015", searchStrong.getQuery().trim());
    }
}
