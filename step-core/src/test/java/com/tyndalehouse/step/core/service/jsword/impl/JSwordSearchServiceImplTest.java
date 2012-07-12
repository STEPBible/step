package com.tyndalehouse.step.core.service.jsword.impl;

import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

/**
 * Tests the various searches
 * 
 * @author chrisburrell
 */
public class JSwordSearchServiceImplTest {
    private JSwordSearchServiceImpl search;

    @Before
    public void setUp() {
        final JSwordVersificationServiceImpl av11nService = new JSwordVersificationServiceImpl();
        this.search = new JSwordSearchServiceImpl(av11nService, new JSwordPassageServiceImpl(av11nService,
                null, null));
    }

    @Test
    public void testMusings() {
        assertTrue(this.search.search("KJV", "strong:g0016").getResults().size() > 0);
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
