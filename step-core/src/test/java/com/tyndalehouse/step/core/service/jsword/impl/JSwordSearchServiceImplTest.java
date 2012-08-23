package com.tyndalehouse.step.core.service.jsword.impl;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;

/**
 * Tests the various searches
 * 
 * @author chrisburrell
 */
public class JSwordSearchServiceImplTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordSearchServiceImplTest.class);
    private JSwordSearchServiceImpl search;

    /**
     * sets up search service
     */
    @Before
    public void setUp() {
        final JSwordVersificationServiceImpl av11nService = new JSwordVersificationServiceImpl();
        this.search = new JSwordSearchServiceImpl(av11nService, new JSwordPassageServiceImpl(av11nService,
                null, null));
    }

    /**
     * Random tests
     */
    @Test
    public void testApproximateSingleSearch() {
        final List<SearchEntry> results = this.search.search("ESV", "Melchizedc~", false, 1).getResults();
        for (int i = 0; i < 10 || i < results.size(); i++) {
            LOGGER.debug(((VerseSearchEntry) results.get(i)).getKey());
        }
        assertTrue(results.size() > 0);
    }

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
