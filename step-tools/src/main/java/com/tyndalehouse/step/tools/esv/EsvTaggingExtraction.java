package com.tyndalehouse.step.tools.esv;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.padPrefixedStrongNumber;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.usermodel.Paragraph;
import org.apache.poi.hwpf.usermodel.Range;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVWriter;

import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * Attempts to modify Word documents and add lexicon information to it.
 * 
 * @author chrisburrell
 * 
 */
public class EsvTaggingExtraction {
    private static final Logger LOGGER = LoggerFactory.getLogger(EsvTaggingExtraction.class);
    private static Pattern VERSE_LINE = Pattern.compile("[1-2]?[a-zA-Z]+ [0-9]+:[0-9]+");
    private static Pattern PUNCTUATION = Pattern.compile("[,?.!/\\-:;'\"]+");
    private static final String ROOT_FOLDER = "D:\\dropbox\\Dropbox\\Proofing";
    private CSVWriter outputWriter;
    private String currentVerseNumber;
    private boolean currentOT = true;
    private String file;
    private boolean seenEquals = false;

    public static void main(final String[] args) throws IOException {
        new EsvTaggingExtraction().process();
    }

    private void process() throws IOException {
        final Iterator<File> iterateFiles = FileUtils.iterateFiles(new File(ROOT_FOLDER),
                new String[] { "doc" }, true);

        final BufferedWriter newBufferedWriter = Files.newBufferedWriter(Paths.get("d:\\temp\\tagging.csv"),
                Charset.forName("UTF-8"));

        this.outputWriter = new CSVWriter(newBufferedWriter);

        processFiles(iterateFiles);
        this.outputWriter.close();
    }

    private void processFiles(final Iterator<File> iterateFiles) {
        while (iterateFiles.hasNext()) {
            final File f = iterateFiles.next();
            this.file = f.getName();

            if (f.getAbsolutePath().toLowerCase().contains("done")
                    || f.getAbsolutePath().toLowerCase().contains("proofed")) {
                System.out.println("Processing: " + f.getName());

                try {
                    processSingleFile(f);
                } catch (final Exception x) {
                    LOGGER.error("Aborting file: [{}]", f);
                    LOGGER.error("Unable to process", x);
                }
            }
        }
    }

    private void processSingleFile(final File input) throws IOException, FileNotFoundException {
        this.seenEquals = false;
        final HWPFDocument d = new HWPFDocument(new FileInputStream(input));

        final Range range = d.getRange();
        final int numParas = range.numParagraphs();
        for (int ii = 0; ii < numParas; ii++) {
            final Paragraph p = range.getParagraph(ii);

            parseParagraph2(p);

        }
    }

    private void parseParagraph2(final Paragraph p) throws IOException {
        final String newVerseNumber = getVerseFromParaLine(p.text());
        String paragrahText = p.text();

        if (paragrahText.contains("=======")) {
            this.seenEquals = true;
            return;
        }

        if (newVerseNumber != null) {
            // output and update current verse number
            this.currentVerseNumber = newVerseNumber;
            resetCurrentOT();
        }

        if (this.currentVerseNumber == null || !this.seenEquals) {
            return;
        }

        paragrahText = paragrahText.replace(this.currentVerseNumber, "");
        // paragrahText = GRAMMAR_PATTERN.matcher(paragrahText).replaceAll("");

        processParagraph(paragrahText);
    }

    void processParagraph(final String paragrahText) {
        int position = 0;

        boolean matchingStrong = false;
        boolean matchingCurly = false;
        boolean matchingGrammar = false;

        StringBuilder words = new StringBuilder(64);
        StringBuilder strongs = new StringBuilder(32);
        StringBuilder grammar = new StringBuilder(8);
        while (position < paragrahText.length()) {
            final char c = paragrahText.charAt(position);
            switch (c) {
                case '<':
                    matchingStrong = true;
                    if (strongs.length() > 0) {
                        strongs.append('|');
                    }
                    break;
                case '>':
                    matchingStrong = false;
                    break;
                case '{':
                    matchingCurly = true;
                    break;
                case '}':
                    matchingCurly = false;
                    break;
                case '(':
                    matchingGrammar = true;
                    break;
                case ')':
                    // append to last strong number
                    strongs.append('@');
                    strongs.append(grammar.toString());
                    grammar = new StringBuilder(8);
                    matchingGrammar = false;
                    break;
                default:
                    if (matchingStrong) {
                        strongs.append(c);
                    } else if (matchingGrammar) {
                        grammar.append(c);
                    } else if (matchingCurly) {
                        // do nothing
                    } else {
                        // append the word to the words
                        // if we're appending a word, and strongs is non-empty, then need to output out
                        if (strongs.length() > 0 && c != ' ') {
                            LOGGER.trace("{} => {}", words, strongs);
                            writeStrongEntry(words.toString().trim(), strongs.toString().trim());
                            words = new StringBuilder(64);
                            strongs = new StringBuilder(64);
                        }

                        words.append(c);
                    }
                    break;
            }
            position++;
        }

        writeStrongEntry(words.toString().trim(), strongs.toString().trim());
    }

    private void writeStrongEntry(final String words, final String strongs) {
        final String finalStrongs = getProperStrongs(strongs);

        final int lastIndexOf = words.lastIndexOf(' ');
        String taggedWord;
        String previousPhrase;

        if (lastIndexOf == -1) {
            // no space
            taggedWord = reduce(words);
            previousPhrase = "";
        } else {
            taggedWord = reduce(words.substring(lastIndexOf));
            previousPhrase = reduce(words.substring(0, lastIndexOf));
        }

        if (isNotBlank(previousPhrase)) {
            this.outputWriter.writeNext(new String[] { this.currentVerseNumber, previousPhrase });
        }

        if (isNotBlank(taggedWord)) {
            this.outputWriter.writeNext(new String[] { this.currentVerseNumber, taggedWord, finalStrongs });
        }
    }

    private String getProperStrongs(final String strongs) {
        final String[] strong = StringUtils.split(strongs, "\\|");
        final StringBuilder sb = new StringBuilder(strongs.length() + 16);
        for (final String s : strong) {
            // a strong number may have grammar attached
            final int indexOfAt = s.indexOf('@');
            if (indexOfAt != -1) {
                sb.append(getStrongNumber(s.substring(0, indexOfAt)));
                sb.append(s.substring(indexOfAt));
            } else {
                sb.append(getStrongNumber(s));
            }
            sb.append('|');
        }
        if (sb.length() > 0) {
            sb.deleteCharAt(sb.length() - 1);
        }
        return sb.toString();
    }

    private void resetCurrentOT() {
        int start = -1;
        int end = -1;

        for (int ii = 0; ii < this.file.length(); ii++) {
            if (start == -1 && Character.isDigit(this.file.charAt(ii))) {
                start = ii;
            }

            if (start != -1 && end == -1 && !Character.isDigit(this.file.charAt(ii))) {
                end = ii;
            }
        }

        final String digits = this.file.substring(start, end);
        this.currentOT = Integer.parseInt(digits) <= 929;
    }

    private String reduce(final String unmatchedText) {
        return PUNCTUATION.matcher(unmatchedText).replaceAll("").trim();
    }

    private String getStrongNumber(final String trim) {
        return padPrefixedStrongNumber((this.currentOT ? 'H' : 'G') + trim);
    }

    private static String getVerseFromParaLine(final String text) {
        final Matcher matcher = VERSE_LINE.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        } else {
            return null;
        }
    }

    /**
     * @param outputWriter the outputWriter to set
     */
    public void setOutputWriter(final CSVWriter outputWriter) {
        this.outputWriter = outputWriter;
    }

}