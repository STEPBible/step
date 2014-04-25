package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import com.tyndalehouse.step.core.models.AvailableFeatures;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.PassageOptionsValidationService;
import com.tyndalehouse.step.core.service.jsword.JSwordMetadataService;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.entities.impl.TestEntityManager;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectHeadingSearchEntry;
import com.tyndalehouse.step.core.models.search.TimelineEventSearchEntry;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordSearchServiceImpl;
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
    private TestEntityManager entityManager;

    @Before
    public void setUp() {
        entityManager = new TestEntityManager();
    }

    /**
     * Random tests
     */
    @Test
    public void testMultiVersionSearch() {
        final List<SearchEntry> results = getSearchServiceUnderTest().search(
                new SearchQuery("t=elijah", new String[] {"ESV", "KJV","ASV"}, "false", 0, 1, 1)).getResults();
        assertFalse(results.isEmpty());
    }

    /** test exact strong match */
    @Test
    public void testSubjectSearch() {
        final SearchResult searchSubject = getSearchServiceUnderTest().search(
                new SearchQuery("s=elijah", new String[] {"ESV"}, "false", 0, 1, 1));

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
                new SearchQuery("d=calf",new String[] {"ESV"}, "false", 0, 1, 10));
        final TimelineEventSearchEntry timelineEventSearchEntry = (TimelineEventSearchEntry) result
                .getResults().get(0);
        assertEquals("Golden Calf episode", timelineEventSearchEntry.getDescription());

    }

    /**
     * @return the search service to test
     */
    private SearchServiceImpl getSearchServiceUnderTest() {
        final JSwordMetadataService meta = mock(JSwordMetadataService.class);
        final JSwordModuleService module = mock(JSwordModuleService.class);
        final JSwordVersificationService versificationService = TestUtils.mockVersificationService();
        final PassageOptionsValidationService optionsValidationService = mock(PassageOptionsValidationService.class);
        final JSwordPassageServiceImpl jsword = new JSwordPassageServiceImpl(versificationService, null,
                null, null, mock(VersionResolver.class), optionsValidationService);

        when(optionsValidationService.getAvailableFeaturesForVersion(any(String.class), any(List.class), any(String.class)))
                .thenReturn(new AvailableFeatures());

        when(module.isInstalled(any(String.class))).thenReturn(true);
        when(module.isIndexed(any(String.class))).thenReturn(true);
        when(meta.supportsFeature(any(String.class), any(LookupOption.class))).thenReturn(true);

        final JSwordSearchServiceImpl jswordSearch = new JSwordSearchServiceImpl(versificationService, null, jsword);
        return new SearchServiceImpl(jswordSearch, meta, versificationService, new SubjectSearchServiceImpl(entityManager,
                jswordSearch, jsword, meta, module), new TimelineServiceImpl(entityManager, jsword), null, entityManager, TestUtils.mockVersionResolver(),
                mock(LexiconDefinitionServiceImpl.class), null
        );
    }
}
