package com.tyndalehouse.step.core.service.search.impl;

import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.models.StringAndCount;
import com.tyndalehouse.step.core.service.impl.IndividualSearch;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.Versification;

import java.util.regex.Matcher;

/**
 * An abstract class that helps build queries for the nave lucene index.
 */
public class AbstractSubjectSearchServiceImpl {
    private static final String NAVE_EXPANDED_REFS = "expandedReferences:";
    protected final JSwordVersificationService jSwordVersificationService;

    /**
     * @param jSwordVersificationService versification service
     */
    public AbstractSubjectSearchServiceImpl(final JSwordVersificationService jSwordVersificationService) {
        this.jSwordVersificationService = jSwordVersificationService;
    }

    /**
     * For searching against an index, it is not often the case that we want to expand the whole reference. This method
     * gives us the shortest viable prefix useful for searching.
     * <pre>
     *     For whole books, we can search for Matt.
     *     For chapters, we can search for Matt.1.
     *     For everything else, we expand the reference to its full OSIS Id
     * </pre>
     *
     * @param version   the master version
     * @param mainRange the key we want to restrict by, in the form +[a-z]
     * @return the shortest viable prefix in the form expandedReferences:Matt.11.1 expandedReferences:Mat.12.2
     */
    StringAndCount getInputReferenceForNaveSearch(final String version, final String mainRange) {
        if (StringUtils.isBlank(mainRange)) {
            return new StringAndCount("", 0);
        }

        //strip out any + and square brackets
        Matcher matcher = IndividualSearch.MAIN_RANGE.matcher(mainRange);
        final boolean hasReference = matcher.find();
        String key;
        if (!hasReference || matcher.groupCount() < 2) {
            //assume un-wrapped reference
            key = mainRange;
        } else {
            key = matcher.group(2);
        }

        final Book master = this.jSwordVersificationService.getBookFromVersion(version);
        final Key k;
        try {
            k = master.getKey(key);
        } catch (NoSuchKeyException e) {
            throw new TranslatedException(e, "invalid_reference_in_book", key, version);
        }

        //now work out what we're looking at
        String keyOsisID = k.getOsisID();

        boolean hasSpaces = keyOsisID.indexOf(' ') != -1;
        int firstDot = keyOsisID.indexOf('.');
        boolean hasDots = firstDot != -1;
        if (!hasSpaces && !hasDots) {
            //no spaces and no ., so has to be a whole book
            return wrapRefForLucene(keyOsisID, true);
        }

        if (hasSpaces) {
            //then we're looking at a list of things, so, let's make one last attempt, in case we're looking at whole books...
            String osisRef = k.getOsisRef();
            if(osisRef.indexOf('.') == -1) {
                //then we're looking at a series of books of some kind..., either joint (Gen-Exod) or disjointed
                //(Gen Lev Mar)
                return getBooksFromRefs(this.jSwordVersificationService.getVersificationForVersion(version), osisRef);
            }

            return prefixWithNaveRefTerm(keyOsisID);
        }

        //so no spaces, but does have dots
        //then we're looking at a single chapter - has to be. Because OSIS IDs for ranges gets expanded.
        // Or at a single verse
        int numDots = StringUtils.countMatches(keyOsisID, ".");
        if (numDots > 1) {
            //then definitely a verse, so return the exact osis id with no *
            return wrapRefForLucene(keyOsisID, false);
        }

        //only 1 dot, so we're either looking at a chapter (Matt.1, or a verse Obad.1)
        //otherwise, either looking at a chapter or a short book
        String bookName = keyOsisID.substring(0, firstDot);
        BibleBook bibleBook = BibleBook.fromExactOSIS(bookName);
        if (bibleBook.isShortBook()) {
            //then we're definitely looking at a verse
            return wrapRefForLucene(keyOsisID, false);
        }

        //long book, so chapter ref
        return wrapRefForLucene(keyOsisID, true);

    }

    private StringAndCount getBooksFromRefs(final Versification v11n, final String osisRef) {
        final StringBuilder lucenePrefix = new StringBuilder(32);
        lucenePrefix.append("+(");
        final String[] ranges = StringUtils.split(osisRef);
        int count = 0;
        for(String r : ranges) {
            if(r.indexOf('-') != -1) {
                final String[] bookStartEnd = StringUtils.split(r, "-");
                final BibleBook start = BibleBook.fromExactOSIS(bookStartEnd[0]);
                final BibleBook end = BibleBook.fromExactOSIS(bookStartEnd[1]);

                count++;
                appendLuceneBookPrefix(lucenePrefix, bookStartEnd[0]);

                BibleBook b = start;
                while((b = v11n.getNextBook(b)) != null && !b.equals(end)) {
                    count++;
                    appendLuceneBookPrefix(lucenePrefix, b.getOSIS());
                }

                appendLuceneBookPrefix(lucenePrefix, bookStartEnd[1]);
                count++;
            } else {
                count++;
                //single book
                appendLuceneBookPrefix(lucenePrefix, r);
            }
        }
        lucenePrefix.append(")");
        return new StringAndCount(lucenePrefix.toString(), count);
    }

    private void appendLuceneBookPrefix(StringBuilder lucenePrefix, String r) {
        lucenePrefix.append(NAVE_EXPANDED_REFS);
        lucenePrefix.append(r);
        lucenePrefix.append(".* ");
    }

    /**
     * Wraps around making this argument mandatory and prefixing the correct field
     *
     * @param keyOsisID the fragment to be wrapped
     * @return the fragment in the form +(arg*)
     */
    private StringAndCount wrapRefForLucene(String keyOsisID, boolean prefix) {
        return new StringAndCount(new StringBuilder().append("+(")
                .append(NAVE_EXPANDED_REFS).append(keyOsisID)
                .append(prefix ? ".*" : "")
                .append(")").toString(), 1);
    }

    /**
     * Splits the string and prefixes the nave expanded refs field
     *
     * @param keyOsisID the key to transform, in the form Matt.11.1 Matt.12.2
     * @return the prefix in the form expandedReferences:Matt.11.1 expandedReferences:Mat.12.2
     */
    private StringAndCount prefixWithNaveRefTerm(String keyOsisID) {
        final String[] parts = StringUtils.split(keyOsisID);
        final StringBuilder sb = new StringBuilder(2 * keyOsisID.length());

        int count = 0;
        sb.append("+(");
        for (int i = 0; i < parts.length; i++) {
            count++;
            String p = parts[i];
            sb.append(NAVE_EXPANDED_REFS);
            sb.append(p);
            if (i + 1 < parts.length) {
                sb.append(' ');
            }
        }
        sb.append(")");
        return new StringAndCount(sb.toString(), count);
    }
}
