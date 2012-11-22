package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.entities.impl.TestEntityManager;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectHeadingSearchEntry;
import com.tyndalehouse.step.core.models.search.TimelineEventSearchEntry;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordSearchServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordVersificationServiceImpl;
import com.tyndalehouse.step.core.service.search.impl.SubjectSearchServiceImpl;
import com.tyndalehouse.step.core.utils.TestUtils;

/**
 * Search service testing
 * 
 * @author chrisburrell
 * 
 */
public class SearchServiceImplTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(SearchServiceImplTest.class);

    /**
     * Random tests
     */
    @Test
    public void testMultiVersionSearch() {
        final List<SearchEntry> results = getSearchServiceUnderTest().search(
                new SearchQuery("t=elijah in(ESV,KJV,ASV)", "false", 0, 1, 1)).getResults();
        assertFalse(results.isEmpty());
    }

    /** test exact strong match */
    @Test
    public void testSubjectSearch() {
        final SearchResult searchSubject = getSearchServiceUnderTest().search(
                new SearchQuery("s=elijah in (ESV)", "false", 0, 1, 1));

        final List<SearchEntry> entries = ((SubjectHeadingSearchEntry) searchSubject.getResults().get(0))
                .getHeadingsSearch().getResults();
        for (final SearchEntry e : entries) {
            LOGGER.debug(((VerseSearchEntry) e).getPreview());

        }
        assertTrue(searchSubject.getResults().size() > 0);
    }

    /** test exact strong match */
    @Test
    public void testSearchTimelineDescription() {
        TestUtils.createEntities("timelineEvent", "name", "Golden Calf episode");

        // write test event to db
        final SearchResult result = getSearchServiceUnderTest().search(
                new SearchQuery("d=calf in (ESV)", "false", 0, 1, 10));
        final TimelineEventSearchEntry timelineEventSearchEntry = (TimelineEventSearchEntry) result
                .getResults().get(0);
        assertEquals("Golden Calf episode", timelineEventSearchEntry.getDescription());

    }

    /**
     * @return the search service to test
     */
    private SearchServiceImpl getSearchServiceUnderTest() {
        final JSwordVersificationService versificationService = new JSwordVersificationServiceImpl();
        final JSwordPassageServiceImpl jsword = new JSwordPassageServiceImpl(versificationService, null,
                null, null);
        final TestEntityManager entityManager = new TestEntityManager();

        final JSwordSearchServiceImpl jswordSearch = new JSwordSearchServiceImpl(versificationService, jsword);
        return new SearchServiceImpl(jswordSearch, jsword, new SubjectSearchServiceImpl(entityManager,
                jswordSearch), new TimelineServiceImpl(entityManager, jsword), entityManager);
    }
}
