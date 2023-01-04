//CHECKSTYLE:OFF
package com.tyndalehouse.step.tools.analysis;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.regex.Pattern;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.passage.Key;
import org.jdom2.Content;
import org.jdom2.Element;
import org.jdom2.Text;
import org.jdom2.filter.AttributeFilter;
import org.jdom2.filter.ElementFilter;
import org.jdom2.filter.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A tool to anaylise frequencies of each word in the bible
 */
@SuppressWarnings("unchecked")
public class BibleAnalysis {
    Pattern punctuation = Pattern.compile("[ *0-9:.<>,!\";]+");
    Logger LOGGER = LoggerFactory.getLogger(BibleAnalysis.class);
    private static final String SCOPE = "Gen-Mal";
    private String currentVerse;
    private int currentPosition;
    private Map<String, List<Word>> sourceWords;
    private Map<String, List<Word>> targetWords;
    private Map<String, List<Word>> targetPhrases;
    private Map<String, List<Word>> targetVerses;
    private Map<String, Integer> targetWordCounts;
    private Analysis targetAnalysis;
    private TaggedVersion taggedVersion;
    private Analysis strongAnalysis;

    // private TreeSet<WordCount> sourceKeyOrder;
    // private TreeSet<WordCount> targetKeyOrder;

    public static void main(final String[] args) throws Exception {
        new BibleAnalysis().read("OSMHB", "ESV_th");
        // processLeastFrequent(sortedKeys, this.sourceWords);

    }

    public void read(final String initials, final String targetLanguage) throws Exception {
        this.sourceWords = new HashMap<String, List<Word>>();

        this.targetWords = new HashMap<String, List<Word>>();
        this.targetPhrases = new HashMap<String, List<Word>>();
        this.targetVerses = new HashMap<String, List<Word>>();
        this.targetWordCounts = new HashMap<String, Integer>();
        this.targetAnalysis = read(targetLanguage, this.targetWords, this.targetPhrases, this.targetVerses,
                this.targetWordCounts);

        this.strongAnalysis = sourceToStrongAnalysis();
        prepareSolution();

        final List<AnalyzedWord> remainingStrongs = new ArrayList<AnalyzedWord>(
                this.strongAnalysis.analyzedWords.size() / 2);
        while (this.strongAnalysis.analyzedWords.size() != 0) {
            final AnalyzedWord processAnalyzedStrong = processAnalyzedStrong();
            if (processAnalyzedStrong != null) {
                remainingStrongs.add(processAnalyzedStrong);
            }
        }
        // processLeastFrequent();
        // processLeastFrequent();
        // processLeastFrequent();
        // }
        printSolution();
    }

    public void printSolution() {
        for (final Entry<String, TaggedVerse> v : this.taggedVersion.verses.entrySet()) {
            // this.LOGGER.trace("Outputting analysis for verse: [{}]", v.getKey());
            String lastWord = null;

            final List<ExactMatch> exactMatches = v.getValue().exactMatches;
            Collections.sort(exactMatches, new Comparator<ExactMatch>() {

                @Override
                public int compare(final ExactMatch o1, final ExactMatch o2) {
                    return o1.strongNumber.compareTo(o2.strongNumber);
                }
            });

            for (final ExactMatch m : exactMatches) {
                if (!m.strongNumber.equals(lastWord)) {
                    this.LOGGER.info("[{}] - exact match for strong [{}]", v.getKey(), m.strongNumber);
                    lastWord = m.strongNumber;
                }

                final AnalyzedWord word = m.word;
                final StringBuilder positions = new StringBuilder(16);
                for (final Integer i : word.versesToPositions.get(v.getKey())) {
                    positions.append(i);
                    positions.append(' ');
                }
                this.LOGGER.info("\t Word [{}] matching  [{}] in position [{}] of the verse", new Object[] {
                        word.word, m.sourceWord, positions });
                // this.LOGGER.info("\t\t[{}]", m.explanation);
            }
        }
    }

    private void prepareSolution() {
        this.taggedVersion = new TaggedVersion();

        for (final AnalyzedWord w : this.strongAnalysis.analyzedWords) {
            for (final String verse : w.verses) {
                TaggedVerse taggedVerse = this.taggedVersion.verses.get(verse);

                if (taggedVerse == null) {
                    taggedVerse = new TaggedVerse();
                    this.taggedVersion.verses.put(verse, taggedVerse);
                }

                taggedVerse.strongNumbers.add(w.markedStrongNumber);
                // taggedVerse.originalPosition.add(w.versesToPositions.get(verse));
            }
        }
    }

    private Analysis sourceToStrongAnalysis() {
        final Analysis strongAnalysis = new Analysis();
        final List<AnalyzedWord> analyzedStrongs = strongAnalysis.analyzedWords = new ArrayList<AnalyzedWord>(
                32000);
        final Map<String, AnalyzedWord> directStrongLinks = strongAnalysis.directLinks = new HashMap<String, AnalyzedWord>(
                8000);

        for (final List<Word> words : this.sourceWords.values()) {
            for (final Word w : words) {
                AnalyzedWord analyzedWord = directStrongLinks.get(w.strongNumber);
                if (analyzedWord == null) {
                    analyzedWord = new AnalyzedWord();
                    analyzedWord.word = w.word;
                    analyzedWord.markedStrongNumber = w.strongNumber;
                    analyzedWord.totalCount = 1;
                    addVerseToAnalysis(w, analyzedWord);
                    analyzedWord.words.add(w);
                    directStrongLinks.put(w.strongNumber, analyzedWord);
                } else {
                    // we have a word
                    addVerseToAnalysis(w, analyzedWord);
                    analyzedWord.totalCount++;
                }
            }
        }

        analyzedStrongs.addAll(directStrongLinks.values());
        Collections.sort(analyzedStrongs, new Comparator<AnalyzedWord>() {
            @Override
            public int compare(final AnalyzedWord o1, final AnalyzedWord o2) {
                return o1.occurencesInDifferentVerses < o2.occurencesInDifferentVerses ? -1
                        : o1.occurencesInDifferentVerses == o2.occurencesInDifferentVerses ? 0 : 1;
            }
        });

        if (this.LOGGER.isTraceEnabled()) {
            this.LOGGER.trace("The following strong analysis was performed:");
            for (final AnalyzedWord aw : analyzedStrongs) {
                this.LOGGER.trace("\t[{}]", aw);
                this.LOGGER.trace("\tFound in:");
                for (final String ref : aw.verses) {
                    this.LOGGER.trace("\t\t[{}]", ref);
                }
            }
        }

        return strongAnalysis;
    }

    private void addVerseToAnalysis(final Word w, final AnalyzedWord analyzedWord) {
        analyzedWord.verses.add(w.verse);
        List<Integer> list = analyzedWord.versesToPositions.get(w.verse);
        if (list == null) {
            analyzedWord.versesToPositions.put(w.verse, list);
            list = new ArrayList<Integer>();

        }
        list.add(w.position);
        analyzedWord.occurencesInDifferentVerses = analyzedWord.verses.size();
    }

    private AnalyzedWord processAnalyzedStrong() {
        // start in the middle
        final AnalyzedWord analyzedWord = this.strongAnalysis.analyzedWords
                .remove(this.strongAnalysis.analyzedWords.size() / 2);

        this.LOGGER.trace("Will be trying to match [{}]", analyzedWord.markedStrongNumber);
        if (this.LOGGER.isTraceEnabled()) {
            this.LOGGER.trace("[{}] occurs in: ");
            for (final String v : analyzedWord.verses) {
                this.LOGGER.trace("\t[{}]", v);
            }
        }

        final Set<AnalyzedWord> wordsInAllTargetVerses = getAnalyzedWordsFromVersesInTarget(analyzedWord.verses);
        final boolean foundWords = computeExactMatch(analyzedWord.verses, wordsInAllTargetVerses,
                analyzedWord);
        if (!foundWords) {
            // add the strong back into a list, so that we can work on it a bit further
            return analyzedWord;
        }
        return null;

        // computeMatchToFewerVerses(analyzedWord.verses, wordsInAllTargetVerses, analyzedWord);

        // // get most frequent
        // int max = -1;
        // List<String> maxEntries = new ArrayList<String>();
        // for (final Entry<String, Integer> e : wordsInAllTargetVerses.entrySet()) {
        // this.LOGGER.trace("Word [{}] occurs [{}] in the scanned text.", e.getKey(), e.getValue());
        // if (e.getValue() > max) {
        // maxEntries = new ArrayList<String>();
        // maxEntries.add(e.getKey());
        // max = e.getValue();
        // } else if (e.getValue() == max) {
        // maxEntries.add(e.getKey());
        // }
        // }
        //
        // this.LOGGER.trace(
        // "The following entries are likely matches with an ocurrence in all matching verses of: [{}]",
        // max);
        // if (this.LOGGER.isTraceEnabled()) {
        // for (final String s : maxEntries) {
        // this.LOGGER.trace("\t[{}]", s);
        // }
        // }
    }

    /**
     * @return number of words matched
     */
    private boolean computeExactMatch(final Set<String> verses,
            final Set<AnalyzedWord> wordsInAllTargetVerses, final AnalyzedWord strong) {
        // find all words with the exact match, i.e. the same
        boolean found = false;
        for (final AnalyzedWord w : wordsInAllTargetVerses) {
            if (w.occurencesInDifferentVerses == verses.size()) {
                found = true;

                // check if they are the same two verses, if so we have a match of very high confidence
                if (verses.containsAll(w.verses)) {
                    markExactMatch(verses, w, strong);

                }

            }
        }
        return found;
    }

    private void markExactMatch(final Set<String> verses, final AnalyzedWord w, final AnalyzedWord strong) {
        final String explanation = "Matches" + verses.toString();

        for (final String v : verses) {
            final TaggedVerse tv = this.taggedVersion.verses.get(v);
            final ExactMatch e = new ExactMatch();
            e.word = w;
            e.explanation = explanation;
            e.strongNumber = strong.markedStrongNumber;
            e.sourceWord = strong.word;
            e.numberVersesMatch = w.occurencesInDifferentVerses;
            e.numExtraVerses = 0;
            e.numVersesForStrong = w.occurencesInDifferentVerses;
            tv.exactMatches.add(e);
        }
    }

    private Set<AnalyzedWord> getAnalyzedWordsFromVersesInTarget(final Set<String> verses) {
        // the most frequent word is the most likely match by storing the words for the relevant verses,
        // against their counts
        final Set<AnalyzedWord> words = new HashSet<AnalyzedWord>(verses.size() * 16);

        // target words that occur in the same verse
        for (final String verseId : verses) {
            final List<Word> targetWordsInVerses = this.targetVerses.get(verseId);

            this.LOGGER.trace("The following words are found in the target verse [{}]:", verseId);

            if (targetWordsInVerses == null) {

                // TODO
                // TODO
                // TODO
                // TODO
                // TODO can still try and make an exact match of what's left.

                this.LOGGER.info("Skipping lookup for verse [{}] as not found in target text", verseId);
                continue;
            }

            for (final Word w : targetWordsInVerses) {
                this.LOGGER.trace("\t[{}]:", w);
                words.add(this.targetAnalysis.directLinks.get(w.word));
            }
        }

        if (this.LOGGER.isTraceEnabled()) {
            this.LOGGER.trace("The following analyzed words have been found: ");
            for (final AnalyzedWord w : words) {
                this.LOGGER.trace("\t {}", w);
            }
        }

        return words;
    }

    public Analysis read(final String initials, final Map<String, List<Word>> currentWords,
            final Map<String, List<Word>> currentPhrases, final Map<String, List<Word>> currentVerses,
            final Map<String, Integer> currentWordsCounts) throws Exception {
        final Book b = Books.installed().getBook(initials);

        final Filter filter = new ElementFilter("verse").and(new AttributeFilter(OSISUtil.ATTRIBUTE_W_LEMMA));
        final Key key = b.getKey(SCOPE);
        final BookData bookData = new BookData(b, key);
        final Element osis = bookData.getOsis();
        final Iterator<Element> descendants = osis.getDescendants(filter);

        this.currentVerse = null;
        this.currentPosition = 0;
        while (descendants.hasNext()) {
            final Element next = descendants.next();

            this.currentVerse = next.getAttributeValue("osisID");
            final ArrayList<Word> value = new ArrayList<Word>();
            currentVerses.put(this.currentVerse, value);

            this.currentPosition = 0;

            processVerseChildren(next, currentWords, currentPhrases, value);

        }

        // output stats
        return analyze(currentWords);
        // final TreeSet<WordCount> sortedKeys = sort(currentWords, currentWordsCounts);

        // this.LOGGER.trace("=======================================================");
        // this.LOGGER.trace(initials);
        // this.LOGGER.trace("=======================================================");
        // if (this.LOGGER.isTraceEnabled()) {
        // for (final WordCount wordCount : sortedKeys) {
        // final List<Word> words = currentWords.get(wordCount.key);
        // this.LOGGER.trace(String.format("%4d ocurrences of %s", words.size(), wordCount.key));
        // }
        // }

        // return sortedKeys;
    }

    class Analysis {
        List<AnalyzedWord> analyzedWords = new ArrayList<AnalyzedWord>();;
        Map<String, AnalyzedWord> directLinks = new HashMap<String, AnalyzedWord>();
    }

    private Analysis analyze(final Map<String, List<Word>> currentWords) {
        final Analysis analysis = new Analysis();

        final Set<Entry<String, List<Word>>> entrySet = currentWords.entrySet();
        for (final Entry<String, List<Word>> entry : entrySet) {
            final AnalyzedWord a = new AnalyzedWord();

            a.word = entry.getKey();
            a.totalCount = entry.getValue().size();
            final List<Word> values = entry.getValue();
            for (final Word w : values) {
                a.verses.add(w.verse);
                List<Integer> positions = a.versesToPositions.get(w.verse);
                if (positions == null) {
                    positions = new ArrayList<Integer>();
                    a.versesToPositions.put(w.verse, positions);
                }
                positions.add(w.position);

                List<String> strongs = a.versesToStrongNumbers.get(w.verse);
                if (strongs == null) {
                    strongs = new ArrayList<String>();
                    a.versesToStrongNumbers.put(w.verse, strongs);
                }
                positions.add(w.position);
            }

            a.occurencesInDifferentVerses = a.verses.size();
            analysis.analyzedWords.add(a);
            analysis.directLinks.put(a.word, a);

            this.LOGGER.trace("Analyzed word {}", a);
        }

        Collections.sort(analysis.analyzedWords, new Comparator<AnalyzedWord>() {

            @Override
            public int compare(final AnalyzedWord o1, final AnalyzedWord o2) {
                return o1.occurencesInDifferentVerses < o2.occurencesInDifferentVerses ? -1
                        : o1.occurencesInDifferentVerses == o2.occurencesInDifferentVerses ? 0 : 1;
            }
        });

        return analysis;
    }

    private void processVerseChildren(final Element next, final Map<String, List<Word>> currentWords,
            final Map<String, List<Word>> currentPhrases, final List<Word> currentVerses) throws Exception {
        final String nodeName = next.getName();
        if (nodeName.equals("note") || nodeName.equals("milestone")
                || ((nodeName.equals("div") && "colophon".equals(next.getAttributeValue("type"))))) {
            // pass
            return;
        }

        final List<Element> children = next.getChildren();
        if (children.size() == 0) {
            final String text = next.getText().toLowerCase().trim();
            addPhraseOrWord(next, currentWords, currentPhrases, text, currentVerses);
            this.currentPosition++;
        } else {
            // not leaf node, so iterate through the content to keep the ordering

            final List<Content> content = next.getContent();
            for (final Content c : content) {
                if (c instanceof Text) {
                    addPhraseOrWord(next, currentWords, currentPhrases, ((Text) c).getText().toLowerCase()
                            .trim(), currentVerses);
                } else if (c instanceof Element) {
                    processVerseChildren((Element) c, currentWords, currentPhrases, currentVerses);
                } else {
                    throw new Exception("What is this? " + content.getClass());
                }
                this.currentPosition++;
            }
        }

    }

    private void addPhraseOrWord(final Element next, final Map<String, List<Word>> currentWords,
            final Map<String, List<Word>> currentPhrases, final String text, final List<Word> currentVerses) {
        if (text.indexOf(' ') != -1) {
            addPhrase(currentPhrases, currentWords, text, this.currentVerse, this.currentPosition, next,
                    currentVerses);
        } else {
            addWord(currentWords, text, this.currentVerse, this.currentPosition, next, currentVerses);
        }
    }

    public class WordCount {
        String key;
        int occurence;

        /*
         * (non-Javadoc)
         * 
         * @see java.lang.Object#hashCode()
         */
        @Override
        public int hashCode() {
            return this.key.hashCode();
        }

        /*
         * (non-Javadoc)
         * 
         * @see java.lang.Object#equals(java.lang.Object)
         */
        @Override
        public boolean equals(final Object obj) {
            return this.key.equals(obj);
        }

        /*
         * (non-Javadoc)
         * 
         * @see java.lang.Object#toString()
         */
        @Override
        public String toString() {
            return "WordCount [key=" + this.key + ", occurence=" + this.occurence + "]";
        }

    }

    private void addPhrase(final Map<String, List<Word>> phrases, final Map<String, List<Word>> words,
            final String text, final String currentVerse, final int currentPosition, final Element next,
            final List<Word> currentVerses) {

        if (isBlank(text)) {
            return;
        }

        final Word w = new Word();
        w.position = currentPosition;
        w.strongNumber = next.getAttributeValue(OSISUtil.ATTRIBUTE_W_LEMMA);
        w.verse = currentVerse;
        w.word = text;

        List<Word> list = phrases.get(w.word);
        if (list == null) {
            list = new ArrayList<Word>();
            phrases.put(w.word, list);
        }
        list.add(w);

        // then add multiple words
        final String[] split = text.split("[ !.,;:?]+");
        for (final String s : split) {
            addWord(words, s, currentVerse, currentPosition, next, currentVerses);
        }
    }

    private void addWord(final Map<String, List<Word>> words, final String text, final String currentVerse,
            final int currentPosition, final Element next, final List<Word> currentVerses) {

        if (isBlank(text)) {
            return;
        }

        final String newText = this.punctuation.matcher(text).replaceAll("");
        if (isBlank(newText)) {
            return;
        }

        final Word w = new Word();
        w.position = currentPosition;
        w.strongNumber = next.getAttributeValue(OSISUtil.ATTRIBUTE_W_LEMMA);
        w.verse = currentVerse;
        w.word = newText;

        List<Word> list = words.get(w.word);
        if (list == null) {
            list = new ArrayList<Word>();
            words.put(w.word, list);
        }
        list.add(w);
        currentVerses.add(w);
    }
}
