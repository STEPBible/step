package com.tyndalehouse.step.tools.versification;

import org.crosswire.common.util.CWProject;
import org.crosswire.jsword.book.*;
import org.crosswire.jsword.book.sword.SwordBook;
import org.crosswire.jsword.book.sword.SwordUtil;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.KeyUtil;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.versification.BookName;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class ExamineVerseOrdinal {
    public static void main(final String[] args) throws NoSuchKeyException, BookException, IOException {

        VerseReferences vRef = new VerseReferences();
        vRef.getVerseReferences();

        URI stepHome = CWProject.instance().getWriteableProjectSubdir("step/", false);
        URI swordHome = CWProject.instance().getReadableFrontendProjectDir();

        URI stepFolder = CWProject.instance().getWriteableFrontendProjectDir();
        Runtime rt = Runtime.getRuntime();
        rt.gc();
        long heap1 = rt.totalMemory()-rt.freeMemory();

        String inputFile = "C:\\tmp\\osis2mod_work\\en_NETSLXX\\Sword\\modules\\texts\\ztext\\NETSLXX\\ot.ref";

        Map<Integer, String> ntRes = new HashMap<>();

        BookName.setFullBookName(false);
        final Book esv = Books.installed().getBook("ESV_th");
        final Key key = esv.getKey("Matt.1.1");

        //=================================
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

            String name = next.getName();

            final BookData bd = new BookData(esv, next);
            final String text = OSISUtil.getCanonicalText(bd.getOsisFragment());
         }


        //==================================

        SwordBook b = null;
        if(esv instanceof SwordBook){
            b = (SwordBook) esv;
        }


        String ossisID = "";
        int ordinal = 0;
        if(b != null){
            BookMetaData bmd = b.getBookMetaData();
            String v = (String) b.getProperty(BookMetaData.KEY_VERSIFICATION);
            final Versification v11n = Versifications.instance().getVersification(v);

            rt.gc();
            heap1 = rt.totalMemory()-rt.freeMemory();
            Map<Integer, String> otRefs = new HashMap<>();
            rt.gc();
            long mapSize = rt.totalMemory()-rt.freeMemory() - heap1;

            try {
                InputStream inputStream = new FileInputStream(inputFile);
                byte[] refBytes = new byte[5];
                int bytesRead = 0;
                int index = 0;


                while ((bytesRead = inputStream.read(refBytes) ) != -1) {
                    byte book = refBytes[0];
                    short chapter = (short)(refBytes[2] << 8 );
                    chapter += refBytes[1];
                    short verse = (short)(refBytes[4] << 8);
                    verse += refBytes[3];

                    String bookName = v11n.getBook(book + 1).getOSIS();
                    otRefs.put(index++, String.format("%s.%02d.%02d",bookName, chapter, verse));
                }

            } catch (IOException ex) {
                ex.printStackTrace();
            }
            rt.gc();
            long heap2 = rt.totalMemory()-rt.freeMemory();
            long used = heap2 - heap1;

            Verse verse = KeyUtil.getVerse(key);



            ordinal = v11n.getOrdinal(verse);
            int maximumOTOrdinal = v11n.maximumOTOrdinal();
            if(ordinal > maximumOTOrdinal)
                ordinal =   ordinal - maximumOTOrdinal;

            String correctRef = otRefs.get(ordinal);

            ossisID = b.getOsisID();

        }


        final Versification v11n = null;

    }
}
