package com.tyndalehouse.step.tools.osis;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.utils.IOUtils;

public class CreateImageModule {
    private static final Logger LOGGER = LoggerFactory.getLogger(CreateImageModule.class);

    private static final List<Verse> verses = new ArrayList<Verse>();
    private static final List<Chapter> chapters = new ArrayList<Chapter>();
    private static final String START_CHAPTER = "<chapter osisID=\"";
    private static final String START_FIGURE = "<figure src=\"commentary_images/";
    private static final String END_CHAPTER = "</chapter>";
    private static final String END_CHAPTER_DECLARATION = "\">";
    private static final String END_FIGURE_DECLARATION = "\" />";

    // e.g. aWord[400242]= "Mat.24.28"
    private static final Pattern verseMatcher = Pattern
            .compile(".*aWord\\[(\\d+)\\].*=[^\"]\"(\\d*\\w+\\.\\d+\\.\\d+)\".*");
    // e.g. i++; ChapNoBeg[i] = 400010; ChapNoEnd[i] = 400016; BookNo[i]=40; ChapNo[i]="Ch 2"
    private static final Pattern chapterMatcher = Pattern.compile(".*ChapNoBeg[^0-9]*(\\d+).*"
            + "ChapNoEnd[^0-9]*(\\d+).*" + "BookNo[^0-9]*(\\d+).*" + "ChapNo[^0-9]*Ch.*(\\d+).*");
    private String moduleName;
    private String folderName;

    public CreateImageModule() {

    }

    public void parse() {
        final String name = "/AlfordGT_40_Mat.doc";
        this.moduleName = name.substring(1, name.indexOf('_') - 2);
        this.folderName = name.substring(1, name.lastIndexOf('.'));

        final InputStream resourceAsStream = getClass().getResourceAsStream(name);
        BufferedReader bis = null;
        try {
            bis = new BufferedReader(new InputStreamReader(resourceAsStream));

            String line = null;
            while ((line = bis.readLine()) != null) {
                final Matcher matcher = verseMatcher.matcher(line);
                if (matcher.matches()) {
                    processVerse(matcher);
                    continue;
                }

                final Matcher chap = chapterMatcher.matcher(line);
                if (chap.matches()) {
                    processChapter(chap);
                    continue;
                }

                LOGGER.warn("Ignoring line: {}", line);
            }
            output();
        } catch (final IOException ex) {
            ex.printStackTrace();
        } catch (final URISyntaxException e) {
            e.printStackTrace();
        } finally {
            IOUtils.closeQuietly(bis);
            IOUtils.closeQuietly(resourceAsStream);
        }
    }

    private void output() throws IOException, URISyntaxException {
        // read the template

        int currentVerse = 0;
        final int oldCurrentVerse = 0;
        final StringBuilder xml = new StringBuilder(256);
        for (int ii = 0; ii < chapters.size() && currentVerse >= 0;) {

            final Chapter currentChapter = chapters.get(ii);
            // start of new chapter
            xml.append(START_CHAPTER);
            xml.append(END_CHAPTER_DECLARATION);

            currentVerse = ouputVerses(xml, currentChapter, currentVerse);

            if (currentVerse == oldCurrentVerse) {
                // do not incremement chapter
                continue;
            } else {
                // end of chapter
                xml.append(END_CHAPTER);
                ii++;

            }
        }

        System.out.println(xml.toString());
    }

    private int ouputVerses(final StringBuilder xml, final Chapter currentChapter, final int currentVerse) {
        Verse verse;
        int nextVerseStart = -1;
        int examinedVerse = currentVerse;

        if (examinedVerse >= verses.size()) {
            return -1;
        }
        verse = verses.get(examinedVerse);
        // if (verse.getStarts() <= currentChapter.getStart()) {
        // // verse doesn't belong here, so passing on this and will attempt the next verse
        // return currentVerse + 1;
        // }
        boolean stop = false;
        while (verse.getStarts() <= currentChapter.getStop()) {

            final int bookNo = verse.getStarts() / 10000;
            final int pageStartNo = verse.getStarts() - (bookNo * 10000);

            if (examinedVerse + 1 >= verses.size()) {
                nextVerseStart = currentChapter.getStop();
                stop = true;
            } else {
                nextVerseStart = verses.get(examinedVerse + 1).getStarts() - (bookNo * 10000);
            }

            for (int pp = pageStartNo; pp < nextVerseStart; pp++) {
                // output each page as a picture
                xml.append(START_FIGURE);

                // append path to image
                xml.append(this.moduleName);
                xml.append('/');
                xml.append(this.folderName);
                xml.append('/');
                xml.append(this.folderName);
                xml.append('-');
                xml.append(bookNo * 10000 + pp);
                xml.append(".jpg");

                xml.append(END_FIGURE_DECLARATION);
            }
            examinedVerse++;
            if (stop) {
                break;
            }
        }
        return examinedVerse;
    }

    private void processChapter(final Matcher matcher) {
        this.chapters.add(new Chapter(Integer.parseInt(matcher.group(4)), Integer.parseInt(matcher.group(1)),
                Integer.parseInt(matcher.group(2)), Integer.parseInt(matcher.group(3))));

        // System.out.println("Chapter " + matcher.group(4) + " of book " + matcher.group(3) + " starts "
        // + matcher.group(1) + " and ends " + matcher.group(2));
    }

    private void processVerse(final Matcher matcher) {
        final Verse v = new Verse(matcher.group(2), Integer.parseInt(matcher.group(1)));
        this.verses.add(v);
        // System.out.println(matcher.group(1) + " " + matcher.group(2));
    }

    public static void main(final String[] args) {
        new CreateImageModule().parse();
    }
}
