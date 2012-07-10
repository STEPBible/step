package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

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
        assertTrue("1 Peter 4:19".equals(searchStrong.getResults().get(0).getKey()));
    }

    /** test exact strong match */
    @Test
    public void testSearchRelatedStrongs() {
        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();
        final SearchServiceImpl si = new SearchServiceImpl(getEbean(), new JSwordPassageServiceImpl(
                versificationService, null, null), new JSwordSearchServiceImpl(versificationService));

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
}
