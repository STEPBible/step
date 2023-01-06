package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.JSwordRelatedVersesService;
import com.tyndalehouse.step.core.service.jsword.JSwordMetadataService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.JSwordUtils;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.*;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.KeyUtil;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.versification.VersificationsMapper;
import org.jdom2.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class JSwordRelatedVersesServiceImpl implements JSwordRelatedVersesService {
    private static final Logger LOG = LoggerFactory.getLogger(JSwordRelatedVersesServiceImpl.class);
    private static final int SIGNIFICANT_CUT_OFF = 200;
    private final JSwordSearchService jSwordSearchService;
    private final JSwordVersificationService jSwordVersificationService;
    private final JSwordMetadataService jSwordMetadataService;

    @Inject
    public JSwordRelatedVersesServiceImpl(final JSwordSearchService jSwordSearchService,
                                          final JSwordVersificationService jSwordVersificationService,
                                          final JSwordMetadataService jSwordMetadataService) {
        this.jSwordSearchService = jSwordSearchService;
        this.jSwordVersificationService = jSwordVersificationService;
        this.jSwordMetadataService = jSwordMetadataService;
    }


    @Override
    public Key getRelatedVerses(final String version, final String key) {
        try {
            //target book, and intermediary strong book
            final Book targetBook = jSwordVersificationService.getBookFromVersion(version);
            final Book strongBook = jSwordMetadataService.supportsStrongs(targetBook) ? targetBook :
                    jSwordVersificationService.getBookFromVersion(JSwordPassageService.REFERENCE_BOOK);

            //target and strong key
            final Key targetKey = targetBook.getKey(key);
            final Key strongKey = VersificationsMapper.instance().map(KeyUtil.getPassage(targetKey), jSwordVersificationService.getVersificationForVersion(strongBook));

            //get list of strong numbers
            final String[] strongs = this.getStrongsFromKey(new BookData(strongBook, strongKey));
            final IndexSearcher is = jSwordSearchService.getIndexSearcher(strongBook.getInitials());
            final List<String> filteredStrongs = keepInfrequentStrongs(strongs, is);
            return targetBook.getKey(getRelatedVerseReference(filteredStrongs, is));
        } catch (final NoSuchKeyException ex) {
            throw new StepInternalException(ex.getMessage(), ex);
        }
    }

    /**
     * Keeps the strongs that are less than SIGNIFICANT_CUT_OFF point
     *
     * @param strongs the total list of strongs
     * @param is      the index searcher
     * @return a reduced set of strongs
     */
    private List<String> keepInfrequentStrongs(final String[] strongs, final IndexSearcher is) {
        final List<String> keepList = new ArrayList<String>(strongs.length);
        try {
            for (String s : strongs) {
                if (is.docFreq(new Term(LuceneIndex.FIELD_STRONG, s)) < SIGNIFICANT_CUT_OFF) {
                    keepList.add(StringConversionUtils.getStrongPaddedKey(s));
                }
            }
            return keepList;
        } catch (IOException ex) {
            throw new StepInternalException(ex.getMessage(), ex);
        }
    }

    /**
     * Gets the list of all references as a string to be passed to JSword
     *
     * @param strongs the list of all strongs
     * @param is the index searcher
     * @return the related verses
     */
    private String getRelatedVerseReference(final List<String> strongs, final IndexSearcher is) {
        try {
            final BooleanQuery bq = getRelatedLuceneQuery(strongs);
            final TopScoreDocCollector collector = TopScoreDocCollector.create(50, true);
            is.search(bq, collector);
            final TopDocs topDocs = collector.topDocs();
            final ScoreDoc[] scoreDocs = topDocs.scoreDocs;
            final StringBuilder refs = new StringBuilder(128);
            for (final ScoreDoc scoreDoc : scoreDocs) {
                final String potentialVerse = is.doc(scoreDoc.doc).get(LuceneIndex.FIELD_KEY);
                if (refs.length() > 0) {
                    refs.append(' ');
                }
                refs.append(potentialVerse);
            }
            return refs.toString();
        } catch (final IOException ex) {
            throw new StepInternalException(ex.getMessage(), ex);
        }
    }

    /**
     * Constructs the query to find all related words
     *
     * @param strongs the list of all strongs
     * @return the query
     */
    private BooleanQuery getRelatedLuceneQuery(final List<String> strongs) {
        final BooleanQuery bq = new BooleanQuery();
        bq.setMinimumNumberShouldMatch(2);
        for (final String strongNumber : strongs) {
            // we're going to make a Lucene query to look for at least 2 of the strong numbers
            bq.add(new TermQuery(new Term(LuceneIndex.FIELD_STRONG, strongNumber)), BooleanClause.Occur.SHOULD);
        }
        return bq;
    }


    /**
     * Calculate counts for a particular key.
     *
     * @param strongBookData the book data to retrieve strong numbers from
     */
    private String[] getStrongsFromKey(BookData strongBookData) {
        final StringBuilder strongs = new StringBuilder(256);
        try {
            final List<Element> elements = JSwordUtils.getOsisElements(strongBookData);
            for (final Element e : elements) {
                if (strongs.length() != 0) {
                    strongs.append(' ');
                }
                strongs.append(OSISUtil.getStrongsNumbers(e));
            }
        } catch (final NoSuchKeyException ex) {
            LOG.warn("Unable to enhance verse numbers.", ex);
        } catch (final BookException ex) {
            LOG.warn("Unable to enhance verse number", ex);
        }
        return StringUtils.split(strongs.toString());
    }
}
