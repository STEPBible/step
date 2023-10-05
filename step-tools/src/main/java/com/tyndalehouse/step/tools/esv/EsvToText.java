package com.tyndalehouse.step.tools.esv;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.versification.BookName;

public class EsvToText {
    static Pattern punc = Pattern.compile("[.,<>/?;:'@#~][{}=\\'_+\\-\\]\"`*()!]*");

    public static void main(final String[] args) throws NoSuchKeyException, BookException, IOException {
        BookName.setFullBookName(false);
        final Book esv = Books.installed().getBook("ESV_th");
        final Key key = esv.getKey("Gen.1-Mal.4");

        final StringBuilder txt = new StringBuilder(128000);
        final Iterator<Key> iterator = key.iterator();
        int count = 0;
        while (iterator.hasNext()) {
            final Key next = iterator.next();
            count++;
            if (next instanceof Verse) {
                final Verse verse = (Verse) next;
                if (verse.getVerse() == 0) {
                    continue;
                }
            }

            txt.append(next.getName());
            txt.append(' ');
            final BookData bd = new BookData(esv, next);
            final String text = OSISUtil.getCanonicalText(bd.getOsisFragment());
            final String newText = punc.matcher(text).replaceAll(" ").replace(' ', ' ').replace('\n', ' ')
                    .replace("  ", " ");
            txt.append(newText);
            txt.append('\n');
        }
        System.out.println(count);

        FileUtils.writeStringToFile(new File("d:\\temp\\esv_text.txt"), txt.toString());
    }
}
