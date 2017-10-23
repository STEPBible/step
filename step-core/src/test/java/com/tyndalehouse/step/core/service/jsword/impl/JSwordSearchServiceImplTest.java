package com.tyndalehouse.step.core.service.jsword.impl;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import com.tyndalehouse.step.core.models.AvailableFeatures;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.service.PassageOptionsValidationService;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.impl.SearchQuery;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.TestUtils;

/**
 * Tests the various searches
 * 
 * @author chrisburrell
 */
@SuppressWarnings("unchecked")
public class JSwordSearchServiceImplTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordSearchServiceImplTest.class);
    private JSwordSearchServiceImpl search;

    /**
     * sets up search service
     */
    @Before
    public void setUp() {
        final JSwordVersificationService mockVersificationService = TestUtils.mockVersificationService();
        final PassageOptionsValidationService mockOptionsService = mock(PassageOptionsValidationService.class);
        when(mockOptionsService.getAvailableFeaturesForVersion(any(String.class), any(List.class), any(String.class), any(InterlinearMode.class)))
                .thenReturn(new AvailableFeatures());
        this.search = new JSwordSearchServiceImpl(mockVersificationService, null, new JSwordPassageServiceImpl(
                mockVersificationService, null, null, null, TestUtils.mockVersionResolver(), mockOptionsService));
    }

    /**
     * tests that estimations of search results can be returned
     */
    @Test
    public void testEstimation() {
        assertTrue(this.search.estimateSearchResults(new SearchQuery("John", new String[] {"ESV_th"}, "false", 0, 0, 0, null)) > 100);
    }

    /**
     * Random tests
     */
    @Test
    public void testApproximateSingleSearch() {
        final List<SearchEntry> results = this.search.search(
                new SearchQuery("Melchizedc~", new String[] {"ESV_th"}, "false", 0, 1, 10, null), "ESV_th").getResults();
        for (int i = 0; i < 10 || i < results.size(); i++) {
            LOGGER.debug(((VerseSearchEntry) results.get(i)).getKey());
        }
        assertFalse(results.isEmpty());
    }

    /**
     * Random tests
     */
    @Test
    public void testGood() {
        final List<SearchEntry> results = this.search.search(
                new SearchQuery("+[Mat-Rev] good~", new String[] {"ESV_th"}, "true", 0, 1, 1000000, null), "ESV_th").getResults();
        for (SearchEntry result : results) {
            LOGGER.trace(((VerseSearchEntry) result).getKey());
        }
        assertFalse(results.isEmpty());
    }

    /**
     * Random tests
     */
    @Test
    public void testMorphology() {
        final List<SearchEntry> results = this.search.search(
                new SearchQuery("+[Mat-Rev] +morph:G2570*A-NSM*", new String[] {"KJV"}, "true", 0, 1, 1000000, null), "ESV_th")
                .getResults();
        for (SearchEntry result : results) {
            LOGGER.info(((VerseSearchEntry) result).getKey());
        }
        assertFalse(results.isEmpty());
    }

    // @Test
    // public void testRebuildIndex() {
    // final IndexManager indexManager = IndexManagerFactory.getIndexManager();
    // try {
    // indexManager.scheduleIndexCreation(Books.installed().getBook("WLC"));
    //
    // Thread.sleep(60 * 20);
    // } catch (final InterruptedException e) {
    // e.printStackTrace();
    // }
    // }

    // @Test
    // public void testRebuildIndex() throws InterruptedException {
    // final List<Book> books = Books.installed().getBooks();
    // for (final Book b : books) {
    // try {
    // final IndexManager indexManager = IndexManagerFactory.getIndexManager();
    //
    // indexManager.scheduleIndexCreation(b);
    // Thread.sleep(5000);
    // } catch (final InterruptedException e) {
    // // TODO Auto-generated catch block
    // e.printStackTrace();
    // }
    // }
    //
    // Thread.sleep(60 * 10);
    // }

    // @Test
    // public void testJesusAndJoseph() {
    // final SearchResult r = this.search.search("KJV", "+Jesus +Joseph");
    // final List<SearchEntry> results = r.getResults();
    // int i = 50;
    // for (final SearchEntry e : results) {
    // // System.out.println(((VerseSearchEntry) e).getPreview());
    // i--;
    // if (i < 0) {
    // break;
    // }
    // }
    // }
}
