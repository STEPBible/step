package com.tyndalehouse.step.tools.analysis;

import org.apache.commons.io.FileUtils;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.FSDirectory;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author chrisburrell
 */
public class BerkeleyOutputToTaggingFormat {
    private static final Map<String, String> entries = new HashMap<String, String>(12000);

    public static void main(String[] args) throws IOException {


        // David'
        final String root = "C:\\Users\\David IB\\Dropbox\\STEP-Tagging\\autoTag\\Bibles\\";
        final String strongs = FileUtils.readFileToString(new File(root + "bible.s"));
        final String other = FileUtils.readFileToString(new File(root + "bible.o"));
        final String results = FileUtils.readFileToString(new File(root + "training.align"));
        final String keyFile = FileUtils.readFileToString(new File(root + "keyList.txt"));
/**
 * Chris'
        final String root = "C:\\temp\\berkeley\\berkeleyBibles\\output\\";
        final String strongs = FileUtils.readFileToString(new File(root + "bible.s"));
        final String other = FileUtils.readFileToString(new File(root + "bible.o"));
        final String results = FileUtils.readFileToString(new File(root + "training.align"));
        final String keyFile = FileUtils.readFileToString(new File(root + "keyList-nt.txt"));
 */


        List<String[]> strongSentences = splitByWord(strongs);
        List<String[]> otherSentences = splitByWord(other);
        List<String[]> resultSentences = splitByWord(results);
        List<String[]> keyList = splitByWord(keyFile);

        final File path = new File("C:\\Users\\David IB\\AppData\\Roaming\\JSword\\step\\entities\\definition");
//      final File path = new File("C:\\Users\\Chris\\AppData\\Roaming\\JSword\\step\\entities\\definition");
        FSDirectory directory = FSDirectory.open(path);
        final IndexSearcher indexSearcher = new IndexSearcher(directory);


        String resultTagging = parseResultsAsTable(resultSentences, strongSentences, otherSentences, indexSearcher, keyList);
        FileUtils.writeStringToFile(new File(root + "positionalTagging-table.txt"), resultTagging);
    }

    private static String parseResultsAsTable(final List<String[]> resultSentences, final List<String[]> strongSentences, final List<String[]> otherSentences, final IndexSearcher indexSearcher, final List<String[]> keyList) throws IOException {
        StringBuilder resultingTagging = new StringBuilder(8000000);

        //verse => results
        Map<String, Map<Integer, String>> verseToResults = new HashMap<String, Map<Integer, String>>(32000);
        for (int i = 0; i < resultSentences.size(); i++) {
            final String[] sentence = resultSentences.get(i);

            String ref = keyList.get(i)[0];
            if (i % 200 == 0) {
                System.out.println(ref);
            }

            Map<Integer, String> resultTagging = new HashMap<Integer, String>();
            verseToResults.put(ref, resultTagging);
            for (String word : sentence) {
                String[] stringIndexes = word.split("-");
                try {
                    int[] indexes = new int[]{Integer.parseInt(stringIndexes[0]), Integer.parseInt(stringIndexes[1])};
                    if (indexes[0] == 0 && indexes[1] == 0 && sentence.length == 1) {
                        continue;
                    }

                    //find word in sentence in each bible.
                    resultTagging.put(indexes[1], strongSentences.get(i)[indexes[0]]);
                } catch (Exception e) {
                    System.out.println("Error in verse " + ref + " for word: " + word);
                    System.out.println(e.getMessage());
                }
            }
        }

        for (int ii = 0; ii < otherSentences.size(); ii++) {
            //output every word
            String[] words = otherSentences.get(ii);
            int wordNumber = 0;
            final String verseRef = keyList.get(ii)[0];
//            resultingTagging.append("$");
            outputVerseRef(resultingTagging, verseRef, wordNumber);

            final Map<Integer, String> sentenceStrongs = verseToResults.get(verseRef);
            boolean wasStrongNumber = false;
            String lastStrongNumber = null;
            for (int jj = 0; jj < words.length; jj++) {
                wordNumber = jj;
                String strongNumber = sentenceStrongs.get(jj);
//                if (lastStrongNumber != null && !lastStrongNumber.equals(strongNumber)) {    // to avoid repeating same Strongs number twice. But sometimes supposed to repeat! eg Matt.1.2
                if (lastStrongNumber != null) {
                    outputStrongNumber(resultingTagging, verseRef, lastStrongNumber, indexSearcher);
                    outputVerseRef(resultingTagging, verseRef, wordNumber);
                }

                if (strongNumber == null) {
                    resultingTagging.append(words[jj]);
//                    if (wasStrongNumber) {
//                        resultingTagging.append('\n');
//                    } else {
                        resultingTagging.append(' ');
//                    }
                    wasStrongNumber = false;
                    lastStrongNumber = null;
                } else {
/*
                    if (wasStrongNumber && lastStrongNumber.equals(strongNumber)) {
                        resultingTagging.append(' ');
                    } else {
*/
                        resultingTagging.append('\t');
//                    }
                    resultingTagging.append(words[jj]);
//                    resultingTagging.append('\t');
                    wasStrongNumber = true;
                    lastStrongNumber = strongNumber;
                }
            }

            if (lastStrongNumber != null) {
                outputStrongNumber(resultingTagging, verseRef, lastStrongNumber, indexSearcher);
            }
            if(resultingTagging.charAt(resultingTagging.length() -1) != '\n') {
                resultingTagging.append('\n');
            }
        }

        return resultingTagging.toString();
    }

    private static void outputVerseRef(final StringBuilder resultingTagging, final String verseRef, final int wordNumber) {
//        resultingTagging.append("¦");
        resultingTagging.append(verseRef);
        resultingTagging.append('-');
        resultingTagging.append(String.format("%03d", wordNumber));
        resultingTagging.append('\t');
    }

    private static void outputStrongNumber(final StringBuilder resultingTagging, final String verseRef, final String lastStrongNumber, final IndexSearcher indexSearcher) {
        //output the strong number and a new line
        resultingTagging.append('\t');
        resultingTagging.append("<");
        resultingTagging.append(lastStrongNumber);
        resultingTagging.append("> = ");
        try {
            appendLexicalEntry(indexSearcher, resultingTagging, lastStrongNumber);
        } catch (IOException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }
        resultingTagging.append(" ¬");
        resultingTagging.append('\n');
    }

    private static String parseResults(final List<String[]> resultSentences, final List<String[]> strongSentences, final List<String[]> otherSentences, final IndexSearcher indexSearcher, final List<String[]> keyList) throws IOException {
        StringBuilder resultingTagging = new StringBuilder(8000000);

        for (int i = 0; i < resultSentences.size(); i++) {
            final String[] sentence = resultSentences.get(i);

            String ref = keyList.get(i)[0];
            if (i % 200 == 0) {
                System.out.println(ref);
            }
            resultingTagging.append(ref);
            resultingTagging.append(' ');

            for (String word : sentence) {
                String[] stringIndexes = word.split("-");
                try {
                    int[] indexes = new int[]{Integer.parseInt(stringIndexes[0]), Integer.parseInt(stringIndexes[1])};
                    if (indexes[0] == 0 && indexes[1] == 0 && sentence.length == 1) {
                        continue;
                    }

                    //find word in sentence in each bible.
                    String strong = strongSentences.get(i)[indexes[0]];
                    String other = otherSentences.get(i)[indexes[1]];

                    resultingTagging.append(other);
                    resultingTagging.append(" (");
                    appendLexicalEntry(indexSearcher, resultingTagging, strong);

                    resultingTagging.append(", ");
                    resultingTagging.append(strong);

                    resultingTagging.append(", ");
                    resultingTagging.append(word);
                    resultingTagging.append(") ");

                } catch (Exception e) {
                    System.out.println("Error in verse " + ref + " for word: " + word);
                    System.out.println(e.getMessage());
                }
            }

            resultingTagging.append('\n');
            resultingTagging.append('\n');
        }
        return resultingTagging.toString();
    }

    private static void appendLexicalEntry(final IndexSearcher indexSearcher, final StringBuilder resultingTagging, String strong) throws IOException {
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
        resultingTagging.append(gloss);
    }

    private static List<String[]> splitByWord(final String strongs) {
        final String[] sentences = strongs.split("\r?\n");
        List<String[]> sss = new ArrayList<String[]>(64000);


        for (String sentence : sentences) {
            final String[] split = org.apache.commons.lang3.StringUtils.split(sentence, ' ');
            sss.add(split);
        }

        return sss;
    }
}
