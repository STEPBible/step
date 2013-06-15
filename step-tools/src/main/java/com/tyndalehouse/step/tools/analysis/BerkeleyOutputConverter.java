/**************************************************************************************************
 * Copyright (c) 2013, Directors of the Tyndale STEP Project                                      *
 * All rights reserved.                                                                           *
 *                                                                                                *
 * Redistribution and use in source and binary forms, with or without                             *
 * modification, are permitted provided that the following conditions                             *
 * are met:                                                                                       *
 *                                                                                                *
 * Redistributions of source code must retain the above copyright                                 *
 * notice, this list of conditions and the following disclaimer.                                  *
 * Redistributions in binary form must reproduce the above copyright                              *
 * notice, this list of conditions and the following disclaimer in                                *
 * the documentation and/or other materials provided with the                                     *
 * distribution.                                                                                  *
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)                        *
 * nor the names of its contributors may be used to endorse or promote                            *
 * products derived from this software without specific prior written                             *
 * permission.                                                                                    *
 *                                                                                                *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS                            *
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT                              *
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS                              *
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE                                 *
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                           *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,                           *
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;                               *
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER                               *
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT                             *
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING                                 *
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF                                 *
 * THE POSSIBILITY OF SUCH DAMAGE.                                                                *
 **************************************************************************************************/

package com.tyndalehouse.step.tools.analysis;

import com.tyndalehouse.step.core.utils.StringUtils;
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
public class BerkeleyOutputConverter {
    private static final Map<String, String> entries = new HashMap<String, String>(12000);

    public static void main(String[] args) throws IOException {

        final String strongs = FileUtils.readFileToString(new File("c:\\temp\\bible.s"));
        final String other = FileUtils.readFileToString(new File("c:\\temp\\bible.o"));
        final String results = FileUtils.readFileToString(new File("c:\\temp\\training.align"));
        final String keyFile = FileUtils.readFileToString(new File("c:\\temp\\keyList.txt"));


        List<String[]> strongSentences = splitByWord(strongs);
        List<String[]> otherSentences = splitByWord(other);
        List<String[]> resultSentences = splitByWord(results);
        List<String[]> keyList = splitByWord(keyFile);

        final File path = new File("C:\\Users\\Chris\\AppData\\Roaming\\JSword\\step\\entities\\definition");
        FSDirectory directory = FSDirectory.open(path);
        final IndexSearcher indexSearcher = new IndexSearcher(directory);


        String resultTagging = parseResults(resultSentences, strongSentences, otherSentences, indexSearcher, keyList);
        FileUtils.writeStringToFile(new File("c:\\temp\\positionalTagging.txt"), resultTagging);
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
                    if (indexes[0] == 0 && indexes[1] == 0) {
                        continue;
                    }

                    //find word in sentence in each bible.
                    String strong = strongSentences.get(i)[indexes[1]];
                    String other = otherSentences.get(i)[indexes[0]];

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
