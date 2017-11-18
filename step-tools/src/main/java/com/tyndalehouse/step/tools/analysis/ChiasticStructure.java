package com.tyndalehouse.step.tools.analysis;

import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.FSDirectory;
import org.crosswire.jsword.book.*;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.Verse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * @author chrisburrell
 */
public class ChiasticStructure {
    private static Logger LOGGER = LoggerFactory.getLogger(ChiasticStructure.class);
    private Map<String, String> entries = new HashMap<String, String>(256);
    private String ref;

    private class KeyValuePair<T, S> {
        private T key;
        private S value;


        public KeyValuePair(final T key, final S value) {
            this.key = key;
            this.value = value;
        }
    }

    private class Match {
        private Key source;
        private Key target;
        private int distance;
        private int commonality;
        private Key currentMin;
        private Key currentMax;
    }

    public ChiasticStructure(final String ref) {
        this.ref = ref;
    }

    private void appendLexicalEntry(StringBuilder stringResults, final IndexSearcher indexSearcher, String strong) throws IOException {
        if (strong.length() > 5 && strong.charAt(1) == '0') {
            strong = strong.substring(0, 1) + strong.substring(2);
        }

        String gloss = entries.get(strong);
        if (gloss == null) {

            final TopDocs lexicalEntries = indexSearcher.search(new TermQuery(new Term("strongNumber", strong)), Integer.MAX_VALUE);
            if (lexicalEntries.scoreDocs.length > 0) {
                gloss = indexSearcher.doc(lexicalEntries.scoreDocs[0].doc).get("stepGloss");
            } else {
                gloss = "";
            }
            entries.put(strong, gloss);
        }

        stringResults.append(strong);
        stringResults.append(":");
        stringResults.append(gloss);
        stringResults.append(" ");
    }

    private void search() throws Exception {
        final File path = new File("C:\\Users\\Chris\\AppData\\Roaming\\JSword\\step\\entities\\definition");
        FSDirectory directory = FSDirectory.open(path);
        final IndexSearcher indexSearcher = new IndexSearcher(directory);

        Book esv = Books.installed().getBook("ESV_th");
        final Key key = esv.getKey(ref);

        final Iterator<Key> iterator = key.iterator();
        List<KeyValuePair<Key, Set<String>>> strongsInVerses = new ArrayList<KeyValuePair<Key, Set<String>>>();
        TreeMap<Key, List<Match>> matchesByVerse = new TreeMap<Key, List<Match>>();
        while (iterator.hasNext()) {
            final Key singleVerse = iterator.next();
            if (createStrongData(esv, key, strongsInVerses, singleVerse)) {
                matchesByVerse.put(singleVerse, findPreviouslyRelatedVerses(strongsInVerses, indexSearcher));
            }
        }

        findChiasms(matchesByVerse);
    }

    private void findChiasms(final TreeMap<Key, List<Match>> matchesByVerse) {
        //look for a set of matches that has a distance of 1
        int baseDistance = 1;
        for (Map.Entry<Key, List<Match>> verse : matchesByVerse.entrySet()) {
            LOGGER.debug("Processing verse {}", verse.getKey().getName());
            findMoreChiasticVerses(new Stack<Match>(), baseDistance, matchesByVerse, null, false);
        }
    }

    private void findMoreChiasticVerses(final Stack<Match> matchesSoFar, int distance, final TreeMap<Key, List<Match>> matchesByVerse,
                                        Match currentMatch, boolean lastChance) {
        List<Match> chiasticVerses = detectChiasm(distance, matchesByVerse, currentMatch, lastChance);
        if (chiasticVerses.size() != 0) {
//            LOGGER.debug("Recursive matches have been found for distance {} in verses: {}.", distance, verseKey);

            StringBuilder tabs = new StringBuilder();
            for (int ii = 0; ii < matchesSoFar.size(); ii++) {
                tabs.append('\t');
            }

            //then go looking for the next door neighbours
            for (Match chiasticVerse : chiasticVerses) {
                matchesSoFar.push(chiasticVerse);
                LOGGER.trace("{}between verses {} and {}", tabs, chiasticVerse.source, chiasticVerse.target);

                //not sure this line is correct either.
                findMoreChiasticVerses(matchesSoFar, chiasticVerse.distance, matchesByVerse, chiasticVerse, false);
                log(matchesSoFar);
                matchesSoFar.pop();
            }
        } else if (!lastChance) {
            //need to pass in something for parameter 4
            findMoreChiasticVerses(matchesSoFar, distance, matchesByVerse, currentMatch, true);
        }
    }

    private void log(final Stack<Match> matchesSoFar) {
        StringBuilder sb = new StringBuilder();
        if(matchesSoFar.size() > 2) {
            for(Match m : matchesSoFar) {
                sb.append('(');
                sb.append(m.source.getName());
                sb.append('-');
                sb.append(m.target.getName());
                sb.append(") ");
            }
        LOGGER.debug(sb.toString());
        }
    }

    private List<Match> detectChiasm(final int currentDistance, final Map<Key, List<Match>> matches, Match currentMatch, boolean lastChance) {
        List<Match> potentialChiasticVerses = new ArrayList<Match>();

        //look for matches at a particular distance
        for (List<Match> matchByVerse : matches.values()) {
            for (Match match : matchByVerse) {
                if(match == currentMatch) {
                    continue;
                }
                
                //if we're between 1 or 2 of the sought distance then return;
                boolean foundMatch = currentMatch == null && currentDistance - match.distance >= -2;
                if (currentMatch != null && !foundMatch && match.distance >= currentDistance) {
                    final int sourceDistance = ((Verse) currentMatch.source).getOrdinal() - ((Verse) match.source).getOrdinal();
                    final int targetDistance = ((Verse) match.target).getOrdinal() - ((Verse) currentMatch.target).getOrdinal();
                    int extraAllowed = lastChance ? 2 : 0;
                    foundMatch = sourceDistance >= 0 && sourceDistance <= 2 + extraAllowed && targetDistance >= 0 && targetDistance <= 2 + extraAllowed;
                }

                if (foundMatch) {
                    potentialChiasticVerses.add(match);
                    LOGGER.trace("Found {} potential chiastic verses.", potentialChiasticVerses.size());
                }
            }
        }
        return potentialChiasticVerses;
    }

    /**
     * Looks back from the end of the array trying to match based on the fact it matches similar strong numbers
     *
     * @param strongsInVerses
     */
    private List<Match> findPreviouslyRelatedVerses(final List<KeyValuePair<Key, Set<String>>> strongsInVerses, IndexSearcher searcher) throws IOException {
        List<Match> matches = new ArrayList<Match>(64);
        //take the last verse and try and match it
        final KeyValuePair<Key, Set<String>> lastVerse = strongsInVerses.get(strongsInVerses.size() - 1);
        for (int ii = strongsInVerses.size() - 2; ii >= 0; ii--) {
            final KeyValuePair<Key, Set<String>> previousVerse = strongsInVerses.get(ii);
            StringBuilder matchesString = new StringBuilder();
            final Match match = matches(strongsInVerses.size() - ii, lastVerse, previousVerse, matchesString, searcher);
            if (match != null) {
                LOGGER.debug("{} matches verse {} on {} counts at distance {}: {}",
                        lastVerse.key.getName(), previousVerse.key.getName(),
                        match.commonality, match.distance, matchesString);
                matches.add(match);
            }
        }
        return matches;
    }

    private Match matches(final int distance, final KeyValuePair<Key, Set<String>> lastVerse, final KeyValuePair<Key, Set<String>> previousVerse, StringBuilder matchesString, IndexSearcher searcher) throws IOException {
        Set<String> previousStrongs = previousVerse.value;
        Set<String> lastStrongs = lastVerse.value;
        int count = 0;

        for (String s : lastStrongs) {
            if (previousStrongs.contains(s)) {
                this.appendLexicalEntry(matchesString, searcher, s);
                count++;
            }
        }

        if (count > 1) {
            //assume a match
            Match m = new Match();
            m.source = previousVerse.key;
            m.target = lastVerse.key;
            m.distance = distance;
            m.commonality = count;
            return m;
        }
        return null;
    }

    private boolean createStrongData(final Book esv, final Key key, final List<KeyValuePair<Key, Set<String>>> strongsInVerses, final Key singleVerse) throws BookException {
        BookData data = new BookData(esv, singleVerse);
        String strongs = OSISUtil.getStrongsNumbers(data.getOsisFragment());

        if (StringUtils.isBlank(strongs)) {
            //a key without strongs
            return false;
        }

        String[] strongsArray = strongs.split(" ");
        Set<String> strongsSet = new HashSet<String>(Arrays.asList(strongsArray));

        //add set of strongs to the hash map of verse to strongs
        strongsInVerses.add(new KeyValuePair<Key, Set<String>>(singleVerse, strongsSet));
        return true;
    }


    public static void main(String[] args) throws Exception {
        new ChiasticStructure("Gen.3").search();
    }
}
