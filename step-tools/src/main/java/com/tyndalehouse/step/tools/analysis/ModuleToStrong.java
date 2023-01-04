package com.tyndalehouse.step.tools.analysis;

import org.apache.commons.io.FileUtils;
import org.crosswire.jsword.book.*;
import org.crosswire.jsword.passage.Key;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.regex.Pattern;

public class ModuleToStrong {
    private static final Pattern PUNCTUATION = Pattern.compile("[—,.;*:'\\[\\]!\"`?’‘()-]+");

    public static void main(String[] args) throws BookException, IOException {
        Book kjv = Books.installed().getBook("ESV_th");
        Book other = Books.installed().getBook("Swahili");

        Key k = kjv.getGlobalKeyList();
        Iterator<Key> keys = k.iterator();

        StringBuilder strongs = new StringBuilder();
        StringBuilder others = new StringBuilder();
        StringBuilder keyList = new StringBuilder();
        while(keys.hasNext()) {
            Key subKey = keys.next();
            BookData bd = new BookData(kjv, subKey);
            final String strongsNumbers = OSISUtil.getStrongsNumbers(bd.getOsisFragment());

            strongs.append(strongsNumbers);
            others.append(clean(new BookData(other, subKey)));
            keyList.append(subKey.getOsisID());
            strongs.append('\n');
            others.append('\n');
            keyList.append('\n');
        }

        FileUtils.writeStringToFile(new File("c:\\temp\\bible.s"), strongs.toString());
        FileUtils.writeStringToFile(new File("c:\\temp\\bible.o"), others.toString());
        FileUtils.writeStringToFile(new File("c:\\temp\\keyList.txt"), keyList.toString());


    }

    private static Object clean(final BookData bookData) throws BookException {
        String s = OSISUtil.getCanonicalText(bookData.getOsisFragment()).toLowerCase();
        s = PUNCTUATION.matcher(s).replaceAll(" ");
        s = s.replaceAll("&quot", " ").replaceAll("  ", " ").replaceAll("  ", " ").replaceAll("  ", " ").replaceAll("  ", " ");
        return s;
    }
}
