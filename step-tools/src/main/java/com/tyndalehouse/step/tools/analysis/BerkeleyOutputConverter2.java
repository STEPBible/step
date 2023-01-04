// Chris Bradshaw
package com.tyndalehouse.step.tools.analysis;

import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.commons.io.FileUtils;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.FSDirectory;

import java.io.File;
import java.io.BufferedWriter;
import java.io.OutputStreamWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.lang.String;

public class BerkeleyOutputConverter2 {
    private static final Map<String, String> entries = new HashMap<String, String>(12000);
    private static final Map<String, String> greekEntries = new HashMap<String, String>(12000);

    public static void main(String[] args) throws IOException {

        // David'
        final String root = "C:\\Users\\David IB\\Dropbox\\STEP-Tagging(DIB)\\autoTag\\BibleSample\\ChrisExperiments\\";
//        final String root = "C:\\Users\\chbradsh\\Documents\\GitHub\\dev\\BibleSample\\";
        final String strongs = FileUtils.readFileToString(new File(root + "NT.s"));        // strongs #
        final String other = FileUtils.readFileToString(new File(root + "NT.u"));          // stems only
        final String results = FileUtils.readFileToString(new File(root + "NT.training.align")); // alignment from Berkeley
        final String keyFile = FileUtils.readFileToString(new File(root + "NT.keyList.txt"));    // refs only

        List<String[]> strongSentences = splitByWord(strongs);
        List<String[]> otherSentences = splitByWord(other);
        List<String[]> resultSentences = splitByWord(results);
        List<String[]> keyList = splitByWord(keyFile);

        final File path = new File("C:\\Users\\David IB\\AppData\\Roaming\\JSword\\step\\entities\\definition");
//        final File path = new File("C:\\Users\\chbradsh\\AppData\\Roaming\\JSword\\step\\entities\\definition");
        FSDirectory directory = FSDirectory.open(path);
        final IndexSearcher indexSearcher = new IndexSearcher(directory);
        final BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("C:\\Users\\David IB\\Dropbox\\STEP-Tagging(DIB)\\autoTag\\BibleSample\\ChrisExperiments\\NT.tagging+Gk.txt"), "UTF8"));
//        final BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("C:\\Users\\chbradsh\\Documents\\GitHub\\dev\\BibleSample\\outfilename.txt"), "UTF8"));

        String resultTagging = parseResults(resultSentences, strongSentences, otherSentences, indexSearcher, keyList, out);
        out.close();
        FileUtils.writeStringToFile(new File(root + "NT.tagging.txt"), resultTagging);
    }

    private static String parseResults(final List<String[]> resultSentences, final List<String[]> strongSentences, final List<String[]> otherSentences, final IndexSearcher indexSearcher, final List<String[]> keyList, final BufferedWriter out) throws IOException {
        StringBuilder resultingTagging = new StringBuilder(8000000);
        int prev;
        prev = -1;

        for (int i = 0; i < resultSentences.size(); i++) {
            String[] sentence = resultSentences.get(i);

            String ref = keyList.get(i)[0];
            if (i % 200 == 0) {
                System.out.println(ref);
            }
            resultingTagging.append('\n');
            resultingTagging.append("$");

            out.write('\n');
            out.write("$");

            sentence = reOrder(sentence);
            int[][] sentence_array = new int[resultSentences.get(i).length +1][2];
            int word_counter = 0;
            //construct an array for this sentence
            for (String word : sentence) {

                String[] stringIndexes = word.split("-");

                sentence_array[word_counter][0] = Integer.parseInt(stringIndexes[0]);
                sentence_array[word_counter][1] = Integer.parseInt(stringIndexes[1]);
                word_counter++;
            }

            prev =-1;
            boolean first = true;
            int tab_count = 0;
            word_counter = 0;
            for (String word : sentence) {

                String[] stringIndexes = word.split("-");

                try {
                    int[] indexes = new int[]{Integer.parseInt(stringIndexes[0]), Integer.parseInt(stringIndexes[1])};
                    if (indexes[0] == 0 && indexes[1] == 0) {      // not sure what this used to be for
                        //            continue;
                    }

                    //find word in sentence in each bible.
                    String strong = strongSentences.get(i)[indexes[0]];
                    String other = otherSentences.get(i)[indexes[1]];

                    //Add reference before the first word in the sentence
                    if (word_counter == 0) {
                        out.write(ref);
                    }

                    //Add unaligned 'other' words
                    if (indexes[1]-1 != prev) {
                        for (int j = prev+1; j < indexes[1]; j++) {
                            out.write("\n");
                            out.write(otherSentences.get(i)[j]);
                        }
                    }

                    //Add aligned 'other word'
                    if (indexes[1] != prev) {
                        out.write("\n");
                        out.write(other);
                        out.write("\t");
                    }

                    // Add strong
                    out.write(String.format("%03d", indexes[0] + 1));
                    out.write("-");
                    out.write(strong);
                    out.write("{");

                    appendLexicalEntry(indexSearcher, resultingTagging, strong, out);
                    out.write("=");
                    appendGreekEntry(indexSearcher, resultingTagging, strong, out);

                    out.write("}\t");


                    //add next Greek word(s) if not tagged
                    int testStrong;
                    boolean missingGreek;
                    String checkMissing;
                    if (first){
                        first = false;
                        for (int l=0; l < indexes[0]; l++){
                            missingGreek = true;
                            checkMissing = Integer.toString(l) + "-";
                            for (int m = 0; m < sentence.length; m++) {
                                if (sentence[m].startsWith(checkMissing)) {
                                    missingGreek = false;
                                    break;
                                }
                            }
                            if (missingGreek) {
                                String missingStrong = strongSentences.get(i)[l];
                                out.write(String.format("%03d", l+1));
                                out.write("-");
                                out.write(missingStrong);
                                out.write("{");
                                appendLexicalEntry(indexSearcher, resultingTagging, missingStrong, out);
                                out.write("=");
                                appendGreekEntry(indexSearcher, resultingTagging, missingStrong, out);
                                out.write("}\t");
                            }
                        }

                    }

                    for (int n=indexes[0]+1; n < strongSentences.get(i).length; n++){
                        missingGreek = true;
                        testStrong = n;
                        checkMissing = Integer.toString(testStrong) + "-";
                        for (int k = 0; k < sentence.length; k++) {
                            if (sentence[k].startsWith(checkMissing)) {
                                missingGreek = false;
                                break;
                            }
                        }
                        if (!missingGreek) break;
                        String missingStrong = strongSentences.get(i)[testStrong];
                        out.write(String.format("%03d", testStrong+1));
                        out.write("-");
                        out.write(missingStrong);
                        out.write("{");

                        appendLexicalEntry(indexSearcher, resultingTagging, missingStrong, out);
                        out.write("=");
                        appendGreekEntry(indexSearcher, resultingTagging, missingStrong, out);
                        out.write("}\t");
                    }

                    int additional_word = 0; //Have we added an extra word?
                    if (indexes[1] != prev) {   // add aligned word

                        int n = 1;
                        // If there is more than one trans word for this Greek word, add it now
                        while (sentence_array[word_counter + n][0] == indexes[0]) {
                            out.write("\n");
                            out.write(otherSentences.get(i)[indexes[1]+n]);
                            additional_word++;
                            n++;
                        }
                        prev = indexes[1] + additional_word;
                    }

                } catch (Exception e) {
                    System.out.println("Error in verse " + ref + " for word: " + word);
                    System.out.println(e.getMessage());
                }

                word_counter++;
            }

            // get unaligned end of sentence
            int otherLength = otherSentences.get(i).length;
            if (prev < otherLength) {
                for (int j = prev + 1; j < otherLength; j++) {
                    out.write("\n");
                    out.write(otherSentences.get(i)[j]);
                }
                out.write("\n");
                out.write("~");
            }
        }
        return resultingTagging.toString();
    }

    private static String[] reOrder(final String[] sentence) {
        List<String> words = Arrays.asList(sentence);

        Collections.sort(words, new Comparator<String>() {
            @Override
            public int compare(final String o1, final String o2) {
                if (o1 == null || o1.length() == 0) {
                    return 1;
                }

                if (o2 == null || o2.length() == 0) {
                    return -1;
                }


                return ((Integer) Integer.parseInt(o1.split("-")[1])).compareTo(Integer.parseInt(o2.split("-")[1]));
            }
        });

        return words.toArray(new String[words.size()]);
    }

    private static void appendLexicalEntry(final IndexSearcher indexSearcher, final StringBuilder resultingTagging, String strong, BufferedWriter out) throws IOException {
        if (strong.length() > 5 && strong.charAt(1) == '0') {
            strong = strong.substring(0, 1) + strong.substring(2);
        }

        String gloss = entries.get(strong);
        if (gloss == null) {

            final TopDocs lexicalEntries = indexSearcher.search(new TermQuery(new Term("strongNumber", StringConversionUtils.getStrongPaddedKey(strong))), Integer.MAX_VALUE);
            if (lexicalEntries.scoreDocs.length > 0) {
                gloss = indexSearcher.doc(lexicalEntries.scoreDocs[0].doc).get("stepGloss");
            } else {
                gloss = "";
            }
            entries.put(strong, gloss);
        }
        resultingTagging.append(gloss);
        out.write(gloss);
    }

    private static void appendGreekEntry(final IndexSearcher indexSearcher, final StringBuilder resultingTagging, String strong, final BufferedWriter out) throws IOException {
        if (strong.length() > 5 && strong.charAt(1) == '0') {
            strong = strong.substring(0, 1) + strong.substring(2);
        }

        String greek = greekEntries.get(strong);
        if (greek == null) {

            final TopDocs lexicalEntries = indexSearcher.search(new TermQuery(new Term("strongNumber", StringConversionUtils.getStrongPaddedKey(strong))), Integer.MAX_VALUE);
            if (lexicalEntries.scoreDocs.length > 0) {
                greek = indexSearcher.doc(lexicalEntries.scoreDocs[0].doc).get("accentedUnicode");
            } else {
                greek = "";
            }
            greekEntries.put(strong, greek);
        }
        out.write(greek);
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
