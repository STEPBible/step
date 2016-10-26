// Chris Bradshaw
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Date;

/**
 * @author chrisburrell
 */

public class BerkeleyOutputConverter {
    private static final Map<String, String> entries = new HashMap<String, String>(12000);
    private static final Map<String, String> greekEntries = new HashMap<String, String>(12000);
    public static String strDebug = ""; //Will store debug information, which will then be dumped into a log file (it requires a successful execution)

    public static void main(String[] args) throws IOException {
        boolean bDebug = true;
        long startTime = System.currentTimeMillis();


        if (bDebug) { WriteDebug("Reading data. Elapsed time: (" + (System.currentTimeMillis() - startTime) + ")"); }

        //This file needs some variables set to work properly on one's system. They follow here.
        // Stefan's
        //portionPassage indicates the passage to be processed. It is located (1) in a corresponding subdirectory, (2) having corresponding filenames. So if desired, they can all be distinguished at one point from each-other, just by virtue of their filenames. Having a special directory, allows the easy processing of portions of passages, and allows for later access for backreferencing.
        final String portionPassage = "OT";
        final String root = "C:\\Users\\David IB\\Dropbox\\STEP-Tagging(DIB)\\autoTag\\NIV\\NIV2011A_NT+OT-SimplifiedHebTags\\";
        String strongs = FileUtils.readFileToString(new File(root + portionPassage + ".s"));        // Original Text in Strong Numbers; strongs # in a file for a section of verses; each verse on a new line
        String other = FileUtils.readFileToString(new File(root + portionPassage + ".u"));          // Target Language in Stems Only; stems only -- Done with Paratext?; each verse on a new line
        String results = FileUtils.readFileToString(new File(root + portionPassage + ".align.txt")); // Original Language Aligned with Target Language; alignment from Berkeley; each verse on a new line
        String keyFile = FileUtils.readFileToString(new File(root + portionPassage + ".keyList.txt"));    // Book/Chapter/Verse Division as Key; refs only (indicates verses)
        final String strJSwordPath = "C:\\Users\\David IB\\AppData\\Roaming\\JSword\\step\\entities\\definition"; //path to the JSword directory
        final String strOutputFileName = root + portionPassage + ".Output.txt"; //file in which the output is written
        final String strDebugFileName = root + portionPassage + "._DebugLog.txt"; //file in which the output is written


/**
 * David's
 final String root = "C:\\Users\\chbradsh\\Documents\\GitHub\\dev\\BibleSample\\";
 final String strongs = FileUtils.readFileToString(new File(root + "NT.s"));        // strongs #
 final String other = FileUtils.readFileToString(new File(root + "NT.u"));          // stems only
 final String results = FileUtils.readFileToString(new File(root + "NT.training.align")); // alignment from Berkeley
 final String keyFile = FileUtils.readFileToString(new File(root + "NT.keyList.txt"));    // refs only
 */
/**
 * Chris'
 final String strongs = FileUtils.readFileToString(new File("c:\\temp\\bible.s"));
 final String other = FileUtils.readFileToString(new File("c:\\temp\\bible.o"));
 final String results = FileUtils.readFileToString(new File("c:\\temp\\training.align"));
 final String keyFile = FileUtils.readFileToString(new File("c:\\temp\\keyList.txt"));
 */

        //Pre-processing
        if (bDebug) { WriteDebug("Preprocessing. Elapsed time: (" + (System.currentTimeMillis() - startTime) + ")"); }
        other = preStringProcessing (other);
        results = preStringProcessing (results);
        strongs = preStringProcessing (strongs);
        keyFile = preStringProcessing (keyFile);

        if (bDebug) { WriteDebug("Processing. Elapsed time: (" + (System.currentTimeMillis() - startTime) + ")"); }
        List<String[]> strongSentences = splitByWord(strongs);
        List<String[]> otherSentences = splitByWord(other);
        List<String[]> resultSentences = splitByWord(results);
        List<String[]> keyList = splitByWord(keyFile);


        final File path = new File(strJSwordPath);
//        final File path = new File("C:\\Users\\David IB\\AppData\\Roaming\\JSword\\step\\entities\\definition");
//        final File path = new File("C:\\Users\\chbradsh\\AppData\\Roaming\\JSword\\step\\entities\\definition");
        FSDirectory directory = FSDirectory.open(path);
        final IndexSearcher indexSearcher = new IndexSearcher(directory);
        final BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(strOutputFileName), "UTF8"));
//        final BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("C:\\Users\\David IB\\Dropbox\\STEP-Tagging\\autoTag\\BibleSample\\ChrisExperiments\\NT.tagging+Gk.txt"), "UTF8"));
//        final BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("C:\\Users\\chbradsh\\Documents\\GitHub\\dev\\BibleSample\\outfilename.txt"), "UTF8"));


        String resultTagging = parseResults(resultSentences, strongSentences, otherSentences, indexSearcher, keyList, out);
        out.close();
        //Postprocessing
        if (bDebug) { WriteDebug("Postprocessing. Elapsed time: (" + (System.currentTimeMillis() - startTime) + ")"); }
        resultTagging = postStringProcessing (strOutputFileName);
        FileUtils.writeStringToFile(new File(strOutputFileName + "postprocessed.txt"), resultTagging );
        if (bDebug) { WriteDebug("Completed. Elapsed time: (" + (System.currentTimeMillis() - startTime) + ")"); }
        FileUtils.writeStringToFile(new File(strDebugFileName), strDebug);
        strDebug="";
    }

    private static void WriteDebug (final String strInput) {
        System.out.println(strInput);
        strDebug = strDebug + "\n" + strInput;
        //return Pattern.compile(strOriginalExpression).matcher(strInput).replaceAll(strReplacingExpression);
    }

    private static String preStringProcessing (String strInput)  {
        //Process Data
        strInput = preStringProcessing_replaceCarriageReturnByNewLine(strInput);
        strInput = preStringProcessing_replaceDoubleNewLinesWithASingleNewLine(strInput);
        //strInput = preStringProcessing_removeSingleLeftPointingAngleQuotationMark (strInput);
        //strInput = preStringProcessing_removeSingleRightPointingAngleQuotationMark (strInput);
        //Return Data
        return strInput;
    }

    private static String preStringProcessing_replaceCarriageReturnByNewLine (final String strInput) {
        final String strOriginalExpression = "\r";
        final String strReplacingExpression = "\n";
        return strInput.replace(strOriginalExpression, strReplacingExpression);
        //return Pattern.compile(strOriginalExpression).matcher(strInput).replaceAll(strReplacingExpression);
    }

    private static String preStringProcessing_replaceDoubleNewLinesWithASingleNewLine (final String strInput) {
        final String strOriginalExpression = "\n\n";
        final String strReplacingExpression = "\n";
        return strInput.replace(strOriginalExpression, strReplacingExpression);
        //return Pattern.compile(strOriginalExpression).matcher(strInput).replaceAll(strReplacingExpression);
    }

    private static String preStringProcessing_removeSingleLeftPointingAngleQuotationMark (final String strInput) {
        final String strOriginalExpression = "‹";
        final String strReplacingExpression = "<";
        return strInput.replace(strOriginalExpression, strReplacingExpression);
        //return Pattern.compile(strOriginalExpression).matcher(strInput).replaceAll(strReplacingExpression);
    }

    private static String preStringProcessing_removeSingleRightPointingAngleQuotationMark (final String strInput) {
        final String strOriginalExpression = "›";
        final String strReplacingExpression = ">";
        return strInput.replace(strOriginalExpression, strReplacingExpression);
        //return Pattern.compile(strOriginalExpression).matcher(strInput).replaceAll(strReplacingExpression);
    }

    //Stefan 12/01/2016: PostProcesses the output into a better readable format
    private static String postStringProcessing (final String strFileName)  throws IOException {
        //Get Data
        String strOutputFileContents = FileUtils.readFileToString(new File(strFileName)); //read the contents of the output file

        //Process Data
        //-removeDoubleQuotes
        strOutputFileContents = postStringProcessing_removeDoubleQuotes (strOutputFileContents);
        //-fix, where the initial word in the target language is not tabbed by the following parsing
        strOutputFileContents = postStringProcessing_FixUntabbed (strOutputFileContents);
        //-TagDifferentTargetWordsTaggedWithSameSourceWord
        strOutputFileContents = postStringProcessing_TagDifferentTargetWordsTaggedWithSameSourceWord (strOutputFileContents);

        //Return Data
        return strOutputFileContents;
    }

    private static String postStringProcessing_FixUntabbed (String strInput) {
        //Init
        String strIndicatorDoubleOccurrence = "\\~"; //The tagging of a Double Match
        boolean bDebug = false;

        String strPattern = "";

        //Pattern for splitting the verse itself: see http://regexr.com/
        String strPunctuationSigns = ""; //"\\:?\\:?\\,?\\.?";

        strPattern = strPattern  + "(\\w{2,}[^\t]*?)";
        strPattern = strPattern  + "(?:" + strPunctuationSigns + ")"; // Sometimes a word is not separated by a tab. This is a bug that is here resolved.
        strPattern = strPattern  + "((([0-9]{3})\\-([A-Z][0-9]{1,5}[a-z]?\\{[^=]{1,}[=][^}]{1,}\\})))";
        strPattern = strPattern  + "";

        if (bDebug) { WriteDebug("Pattern for finding non-tabbed word/parsing in a verse: " + strPattern + ":::"); }

        //Replacement of the matched
        String strReplacePattern = "$1\t$3";

        if (bDebug) WriteDebug("Pattern (non-tabbed): " + strReplacePattern + ":::");

        strInput = strInput.replaceAll(strPattern, strReplacePattern);

        return strInput;
    }

    //Stefan 13/01/2016: TagDifferentTargetWordsTaggedWithSameSourceWord
    private static String postStringProcessing_TagDifferentTargetWordsTaggedWithSameSourceWord (String strInput) {
        /*
        * when a Greek word is used to tag more than one Swahili word, it needs to be marked.
        eg in v.16 pais is tagged to both "watoto" and "kiume"  I think a good way to mark this is to preceded all occurrences with an "~"
        (we want to try to get each Greek word occurring only once if poss.)
        eg watoto       ~016-G3816{child= pais}
        wote            014-G3956{all= pas}
        wa              015-G3588{the/this/who=ho}
        */
        //      Init FD
        //      Identify WORD                       :
        //      Identify MATCH
        //      NOT in same verse AND a DIFFERENT WORD

        //Init
        String strOutput = "";
        String strIndicatorDoubleOccurrence = "\\~"; //The tagging of a Double Match
        boolean bDebug = false;

        String strPattern = ""; //   "(?s)";//
        String strPatternVerse = "";

        //Sample entry (FULL): 40_Mat.002.016-002		Herode	G2264{Herod=Ἡρώδης}

        //***Match first occurrence
        // Sample:              Herode	002-G2264{Herod=Ἡρώδης}
        // <Target Language: Word>/t<position number>-<Strong #>{<English Translation>=<Source Language>}

        //MASSIVE FRUSTRATION, I cannot backreference more than 9. It should work, but it doesn't!
        //Because of this, I'll have to do it in two steps!!! First split it into verses and then do the actual matching.

        //Pattern for splitting the text into verses
        strPatternVerse = strPatternVerse+ "(\\$[0-9]{2}\\_[0-9A-Z][a-zA-Z]{1,4}\\.[0-9]{1,3}\\.[0-9]{1,3})"; //David adjusted the numbering 18/2/16 --> [0-9]{3}\.[0-9]{3} -->  [0-9]{1,3}\.[0-9]{1,3}
        strPatternVerse = strPatternVerse+ "(([^\n]*[\n])*?)";
        strPatternVerse = strPatternVerse+ "(\\~)";
        if (bDebug) { WriteDebug("Pattern for versification: " + strPatternVerse + ":::"); }

        //Pattern for splitting the verse itself: see http://regexr.com/
        String strPunctuationSigns = ""; //"\\:?\\:?\\,?\\.?";
        strPattern = strPattern  + "(";
        strPattern = strPattern  + "(\\w{2,})";
        strPattern = strPattern  + "(?:" + strPunctuationSigns + "\\t?)"; // Sometimes a word is not separated by a tab. This is a bug that is here resolved.
        strPattern = strPattern  + "(((?!\\~)([0-9]{3})\\-([A-Z][0-9]{1,5}[a-z]?\\{[^=]{1,}[=][^}]{1,}\\}\\t)){0,8})";
        strPattern = strPattern  + "(((?!\\~)([0-9]{3})\\-([A-Z][0-9]{1,5}[a-z]?\\{[^=]{1,}[=][^}]{1,}\\}\\t?)){1})";
        strPattern = strPattern  + "(((?!\\~)([0-9]{3})\\-([A-Z][0-9]{1,5}[a-z]?\\{[^=]{1,}[=][^}]{1,}\\}\\t?)){0,8})";
        strPattern = strPattern  + ")";
        strPattern = strPattern  + "(([^\n]*[\n])*?)";
        strPattern = strPattern  + "(\\w{2,})";
        strPattern = strPattern  + "(?:" + strPunctuationSigns + "\\t?)"; // Sometimes a word is not separated by a tab. This is a bug that is here resolved.
        strPattern = strPattern  + "(";
        strPattern = strPattern  + "(((?!\\~)([0-9]{3})\\-([A-Z][0-9]{1,5}[a-z]\\{[^=]{1,}[=][^}]{1,}\\}\\t)){0,8})";
        strPattern = strPattern  + "\\8";
        strPattern = strPattern + "(((?!\\~)([0-9]{3})\\-([A-Z][0-9]{1,5}[a-z]\\{[^=]{1,}[=][^}]{1,}\\}\\t?)){0,8})";
        strPattern = strPattern  + ")";
        /*        strPattern = strPattern  + "(";
        strPattern = strPattern  + "(\\w{2,})"; //Target Language (Swahili) Word--Storing this for backref, maybe followed by garbage, e.g. another word or punctuation
        //tab
        strPattern = strPattern  + "(?:\\:?\\,?\\.?\\t?)";
        strPattern = strPattern  + "(("; //a Single Matching or more, up to nine (I doubt there'll be more)
        strPattern = strPattern  + "(?!" + strIndicatorDoubleOccurrence + ")"; //exclude previously double matches
        strPattern = strPattern  + "([0-9]{3})\\-"; //<position number>-
        //<Strong #>{<English Translation>=<Source Language>}
        strPattern = strPattern  + "([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t)"; //Match Strong indication--Storing this for backref(\3) (probably could just do [AHG] (Aramaic, Greek, Hebrew)
        strPattern = strPattern  + "){0,8})"; //Line, Book#,BookName,Chap,Verse--Storing this for backref, followed by the matching word
        strPattern = strPattern  + "(("; //a Single Matching or more, up to nine (I doubt there'll be more)
        strPattern = strPattern  + "(?!" + strIndicatorDoubleOccurrence + ")"; //exclude previously double matches
        strPattern = strPattern  + "([0-9]{3})\\-"; //<position number>-
        //<Strong #>{<English Translation>=<Source Language>}
        strPattern = strPattern  + "([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t?)"; //Match Strong indication--Storing this for backref(\3) (probably could just do [AHG] (Aramaic, Greek, Hebrew)
        strPattern = strPattern  + "){1})"; //Line, Book#,BookName,Chap,Verse--Storing this for backref, followed by the matching word
        strPattern = strPattern  + "(("; //a Single Matching or more, up to nine (I doubt there'll be more)
        strPattern = strPattern  + "(?!" + strIndicatorDoubleOccurrence + ")"; //exclude previously double matches
        strPattern = strPattern  + "([0-9]{3})\\-"; //<position number>-
        //<Strong #>{<English Translation>=<Source Language>}
        strPattern = strPattern  + "([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t?)"; //Match Strong indication--Storing this for backref(\3) (probably could just do [AHG] (Aramaic, Greek, Hebrew)
        strPattern = strPattern  + "){0,8})"; //Line, Book#,BookName,Chap,Verse--Storing this for backref, followed by the matching word
        strPattern = strPattern  + ")"; //Line, Book#,BookName,Chap,Verse--Storing this for backref, followed by the matching word
        //Sample entry section: (Negative Lookahead) & BackRef#6: Possible Garbage at the end of the Original Line
        //strPattern = strPattern  + "([^\n]*)[\n]"; //exclude lines that have already been matched
        //Sample entry section: BackRef#7 and #8: Other lines (Note $8 is not referenced later on, on purpose, because it is duplicating)
        strPattern = strPattern  + "(([^\n]*[\n])*?)";
        //strPattern = strPattern  + "(?![0-9]{2}\\_[a-zA-Z]{2,5}\\.[0-9]{3}\\.[0-9]{3})";
        //Rematch with a second occurrence, verse wise
        strPattern = strPattern  + "(\\w{2,})"; //1st backref
        strPattern = strPattern  + "(?:\\:?\\,?\\.?\\t?)";
        strPattern = strPattern  + "("; //All Matchings
        strPattern = strPattern  + "(("; //a Single Matching or more, up to nine (I doubt there'll be more)
        strPattern = strPattern  + "(?!" + strIndicatorDoubleOccurrence + ")"; //exclude previously double matches
        strPattern = strPattern  + "([0-9]{3})\\-"; //<position number>-
        //<Strong #>{<English Translation>=<Source Language>}
        strPattern = strPattern  + "([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t)"; //Match Strong indication--Storing this for backref(\3) (probably could just do [AHG] (Aramaic, Greek, Hebrew)
        strPattern = strPattern  + "){0,8})"; //Line, Book#,BookName,Chap,Verse--Storing this for backref, followed by the matching word
        strPattern = strPattern  + "\\7"; //<position number>-
        strPattern = strPattern  + "(("; //a Single Matching or more, up to nine (I doubt there'll be more)
        strPattern = strPattern  + "(?!" + strIndicatorDoubleOccurrence + ")"; //exclude previously double matches
        strPattern = strPattern  + "([0-9]{3})\\-"; //<position number>-
        //<Strong #>{<English Translation>=<Source Language>}
        strPattern = strPattern  + "([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t?)"; //Match Strong indication--Storing this for backref(\3) (probably could just do [AHG] (Aramaic, Greek, Hebrew)
        strPattern = strPattern  + "){0,8})"; //Line, Book#,BookName,Chap,Verse--Storing this for backref, followed by the matching word
        strPattern = strPattern  + ")"; //Line, Book#,BookName,Chap,Verse--Storing this for backref, followed by the matching word
        strPattern = strPattern  + ")"; //Line, Book#,BookName,Chap,Verse--Storing this for backref, followed by the matching word
        */
        if (bDebug) { WriteDebug("Pattern for finding duplicates in verse: " + strPattern + ":::"); }

        //Sample entry section: BackRef#9: Different Position in the verse
        //strPattern = strPattern  + "(\\-[0-9]{3})\t\t"; //Word Number is different
        //Sample entry section: BackRef#10: Different Target Language Word
        //strPattern = strPattern  + "(?!\\3)(\\w{2,})"; //Exclude places with the exact same word //Word is different too
        //Sample entry section: BackRef#11: Different Postword Rubbish
        //strPattern = strPattern  + "([^	]{0,}	)";
        //Rematch with a second occurrence, Original Language Match-wise
        //strPattern = strPattern  + "\\5"; //The Original stuff is the same. If this is all true, we got a match

        /* Handy for Debug
        Pattern pattern = Pattern.compile(strPattern, Pattern.DOTALL); //, Pattern.MULTILINE  | Pattern.MULTILINE
        Matcher matcher = pattern.matcher(strInput);
        System.out.println("found: " + strPattern + ":::");
        System.out.println("Did we have a match?: " + matcher.find()+ ":::");
        */

        //Replacement of the matched
        String strReplacePattern = "$2\t$3" + strIndicatorDoubleOccurrence + "$8$11";
        //Inbetween Lines
        strReplacePattern = strReplacePattern + "$15";
        //Counterpart Match + Additions
        strReplacePattern = strReplacePattern + "$17\t$19" + strIndicatorDoubleOccurrence + "$8$23";
//        strReplacePattern = strReplacePattern + "$31$33";
        if (bDebug) WriteDebug("Pattern: " + strReplacePattern + ":::");
        //strPattern = "(\\w{2,})(\\:?\\,?\\.?\\t?)((((?!SCHEET)([0-9]{3})\\-([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t?)){0,8})(((?!SCHEET)([0-9]{3})\\-([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t?)){1})(((?!SCHEET)([0-9]{3})\\-([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t?)){0,8}))(([^\\n]*[\\n])*)(?![0-9]{2}\\_[a-zA-Z]{2,5}\\.[0-9]{3}\\.[0-9]{3})(\\w{2,})(\\:?\\,?\\.?\\t?)((((?!SCHEET)([0-9]{3})\\-([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t?)){0,8})\\8(((?!SCHEET)([0-9]{3})\\-([A-Z][0-9]{1,5}\\{[^=]{1,}[=][^}]{1,}\\}\\t?)){0,8}))";
        //Return altered strInput

        //Now get each verse, and try the individual matching
        Pattern p = Pattern.compile(strPatternVerse);
        Matcher m = p.matcher(strInput);
        int lastMatchPos = 0;
        int intNumMatch = 0;
        String strCurrentVerse;
        while (m.find()) {
            intNumMatch=intNumMatch + 1;
            strCurrentVerse = m.group(1) + "" + m.group(2)+ "" + m.group(4);
            if (bDebug) {WriteDebug("<Match: " + intNumMatch + ">" + strCurrentVerse + "</Match: " + intNumMatch + ">" ); }
            //Sometimes multiple matches need to iteratively be performed
            //Match the elements within the verse!
            while (strCurrentVerse != strCurrentVerse.replaceAll(strPattern, strReplacePattern)) {
                strCurrentVerse = strCurrentVerse.replaceAll(strPattern, strReplacePattern);
            }
            strOutput = strOutput + "\n" + strCurrentVerse ;
            lastMatchPos = m.end();
        }
        if (lastMatchPos != strInput.length()) {
            if (bDebug) {WriteDebug("No Matches found!"); }
            //If nothing is to be matched, which would be odd, then return the input
            strOutput = strInput;
        }

        return strOutput;
    }

    //Stefan 13/01/2016: removeDoubleQuotes
    private static String postStringProcessing_removeDoubleQuotes (final String strInput) {
        final String strOriginalExpression = "\""; //We need to get rid of double quotes
        final String strReplacingExpression = "“"; //We do not need anything in its stead
        return Pattern.compile(strOriginalExpression).matcher(strInput).replaceAll(strReplacingExpression);
    }


    private static String parseResults(final List<String[]> resultSentences, final List<String[]> strongSentences, final List<String[]> otherSentences, final IndexSearcher indexSearcher, final List<String[]> keyList, final BufferedWriter out) throws IOException {
        StringBuilder resultingTagging = new StringBuilder(8000000);
        int prev;
        boolean bDebug = false;
        String strTemp = "";
        prev = -1;

        for (int i = 0; i < resultSentences.size(); i++) {
            String[] sentence = resultSentences.get(i);

            if (bDebug) { WriteDebug("Array number --" + i + " of " + resultSentences.size() + "-- of resultSentences. \t\t   The sentence starts with: " + keyList.get(i)[0] + "\t(" + sentence[0] + ")"); }
            if (bDebug) { //Debug attempt 22/2/16
                try {
                    strTemp = keyList.get(i)[0]; //keyList.get(i);
                } catch (IndexOutOfBoundsException e) {
                    WriteDebug("Array falls on the --" + i + " of " + resultSentences.size() + "-- of resultSentences. \t\t   The previous sentence started with: " + keyList.get(i-1)[0]);
                }
            }

            String ref = keyList.get(i)[0];
            if (i % 200 == 0) {
                WriteDebug("Every 200th entry (" + i + "): " + ref);
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
                    WriteDebug("Error in verse " + ref + " for word: " + word);
                    WriteDebug(e.getMessage());
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
