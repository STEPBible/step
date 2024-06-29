package com.tyndalehouse.step.tools.osis;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;

public class KjvStrongNumbers {
    public static void main(final String[] args) throws BookException, NoSuchKeyException {
        final Book nt = Books.installed().getBook("WHNU");
        final Book ot = Books.installed().getBook("OSHB");

        final Key ok = ot.getGlobalKeyList();
        final Key nk = nt.getGlobalKeyList();

        Iterator<Key> iterator = ok.iterator();
        while (iterator.hasNext()) {
            final BookData bd = new BookData(ot, iterator.next());
            System.out.println("===========================");
            System.out.println("@Reference=\t" + bd.getKey().getOsisID());
            System.out.println("@Strongs=\t" + OSISUtil.getStrongsNumbers(bd.getOsis()));
            break;
        }

        iterator = nk.iterator();
        while (iterator.hasNext()) {
            final BookData bd = new BookData(nt, iterator.next());
            System.out.println("===========================");
            System.out.println("@Reference=\t" + bd.getKey().getOsisID());
            System.out.println("@Strongs=\t" + OSISUtil.getStrongsNumbers(bd.getOsis()));
            break;
        }

        final long l = System.nanoTime();
        final String[] a = new String[] { "Gen.12.1", "Gen.12.2", "Gen.12.3", "Gen.12.4", "Gen.12.5",
                "Gen.12.6", "Gen.12.7", "Gen.12.8", "Gen.12.9", "Gen.12.10", "Gen.12.11", "Gen.12.12",
                "Gen.12.13", "Gen.12.14", "Gen.12.15", "Gen.12.16", "Gen.12.17", "Gen.12.18", "Gen.12.19",
                "Gen.12.20" };

        final Map<String, String> values = new HashMap<String, String>(64);
        for (int i = 0; i < a.length; i++) {
            final BookData bd = new BookData(ot, ot.getKey(a[i]));
            values.put(a[i], OSISUtil.getStrongsNumbers(bd.getOsis()));
        }
        System.out.println(System.nanoTime() - l);
    }
}
