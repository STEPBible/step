package com.tyndalehouse.step.tools.esv;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.padPrefixedStrongNumber;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.versification.BookName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Strong number reports against each verse
 * 
 * @author chrisburrell
 * 
 */
public class EsvStrongNumberReport {
    private static final Logger LOGGER = LoggerFactory.getLogger(EsvStrongNumberReport.class);
    private static final String OT = "OSMHB";
    private static final String NT = "WHNU";
    private final Map<String, Map<String, Integer>> esvStrongsInVerses = new LinkedHashMap<String, Map<String, Integer>>(
            16000);
    private final Map<String, Map<String, Integer>> originalsStrongsInVerses = new LinkedHashMap<String, Map<String, Integer>>(
            16000);

    class WordCount {
        public String w;
        public int count = 0;

        /*
         * (non-Javadoc)
         * 
         * @see java.lang.Object#hashCode()
         */
        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            result = prime * result + getOuterType().hashCode();
            result = prime * result + ((this.w == null) ? 0 : this.w.hashCode());
            return result;
        }

        /*
         * (non-Javadoc)
         * 
         * @see java.lang.Object#equals(java.lang.Object)
         */
        @Override
        public boolean equals(final Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (getClass() != obj.getClass()) {
                return false;
            }
            final WordCount other = (WordCount) obj;
            if (!getOuterType().equals(other.getOuterType())) {
                return false;
            }
            if (this.w == null) {
                if (other.w != null) {
                    return false;
                }
            } else if (!this.w.equals(other.w)) {
                return false;
            }
            return true;
        }

        private EsvStrongNumberReport getOuterType() {
            return EsvStrongNumberReport.this;
        }
    }

    public static void main(final String[] args) throws Exception {
        new EsvStrongNumberReport().buildStats();
    }

    private void buildStats() throws Exception {
        BookName.setFullBookName(false);
        statsByVersion("ESV_th", this.esvStrongsInVerses);
        statsByVersion(OT, this.originalsStrongsInVerses);
//        statsByVersion(NT, this.originalsStrongsInVerses);

        checkAndReport();
    }

    private void checkAndReport() {
        LOGGER.warn("verse,Missing in the ESV,Present in the ESV,Difference in occurrences");
        for (final Map.Entry<String, Map<String, Integer>> entry : this.esvStrongsInVerses.entrySet()) {
            final Map<String, Integer> strongsInEsv = entry.getValue();
            final Map<String, Integer> originals = this.originalsStrongsInVerses.get(entry.getKey());

            if (strongsInEsv.size() == 0) {
                // no data available so just skip over it.
                continue;
            }

            if (originals == null) {
                LOGGER.warn("Verse {} not present in original language", originals);
                continue;
            }

            final StringBuilder presentInEsv = new StringBuilder(128);
            final StringBuilder presentInOriginal = new StringBuilder(128);
            final StringBuilder difference = new StringBuilder(128);

            for (final Map.Entry<String, Integer> esvEntry : strongsInEsv.entrySet()) {
                final String strongNumber = esvEntry.getKey();

                final Integer integer = originals.get(strongNumber);
                if (integer == null) {
                    // not present in original
                    presentInEsv.append(strongNumber);
                    presentInEsv.append(' ');
                } else if (integer.intValue() != esvEntry.getValue().intValue()) {
                    difference.append(strongNumber);

                    final int i = integer.intValue() - esvEntry.getValue().intValue();
                    if (i > 0) {
                        difference.append('+');
                    }
                    difference.append(i);
                    difference.append(' ');

                    originals.remove(strongNumber);
                } else {
                    originals.remove(strongNumber);
                }
            }

            // check all remaining keys
            for (final Entry<String, Integer> missingStrong : originals.entrySet()) {
                presentInOriginal.append(missingStrong.getKey());
                presentInOriginal.append('x');
                presentInOriginal.append(missingStrong.getValue());
                presentInOriginal.append(' ');
            }

            if (presentInEsv.length() > 0 || presentInOriginal.length() > 0 || difference.length() > 0) {
                LOGGER.warn("{},{},{},{}", new Object[] { entry.getKey(), presentInOriginal, presentInEsv,
                        difference });
            }
        }
    }

    private void statsByVersion(final String version, final Map<String, Map<String, Integer>> numbers)
            throws NoSuchKeyException, BookException {
        LOGGER.info("Loading {} stats", version);

        final Book book = Books.installed().getBook(version);
        final Key key = book.getKey("Gen.1-Mal");

        final Iterator<Key> iterator = key.iterator();
        while (iterator.hasNext()) {
            final Key next = iterator.next();

            if (next instanceof Verse) {
                final Verse verse = (Verse) next;
                final String v = verse.getOsisID();

                final BookData bd = new BookData(book, next);
                final String strongsNumbers = OSISUtil.getStrongsNumbers(bd.getOsisFragment());
                Map<String, Integer> words = null;

                final List<String> strongs = Arrays.asList(strongsNumbers.split(" "));
                for (final String s : strongs) {
                    if (isBlank(s)) {
                        continue;
                    }

                    if (words == null) {
                        words = numbers.get(v);
                        if (words == null) {
                            words = new HashMap<String, Integer>(32);
                            numbers.put(v, words);
                        }
                    }

                    final Integer count = words.get(s);
                    if (count != null) {
                        words.put(padPrefixedStrongNumber(s), count + 1);
                    } else {
                        words.put(padPrefixedStrongNumber(s), 1);
                    }
                }

            }
        }
    }
}
