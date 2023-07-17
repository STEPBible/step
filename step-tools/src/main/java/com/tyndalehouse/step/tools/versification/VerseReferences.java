package com.tyndalehouse.step.tools.versification;

import org.crosswire.common.util.NetUtil;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.BookMetaData;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.sword.*;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.versification.BookName;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.custom.CustomVersification;
import org.crosswire.jsword.versification.system.Versifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class VerseReferences {
    public void getVerseReferences() throws NoSuchKeyException, BookException, IOException {
        Map<Integer, String> otRefs = new HashMap<>();
        Map<Integer, String> ntRefs = new HashMap<>();

        BookName.setFullBookName(false);
        final Book bk = Books.installed().getBook("NETSLXX");
        SwordBook sBook = null;
        if(bk instanceof SwordBook){
            sBook = (SwordBook) bk;
        }

        Backend be = sBook.getBackend();

        SwordBookMetaData bmd = be.getBookMetaData();

        String v = (String) bmd.getProperty(BookMetaData.KEY_VERSIFICATION);
        final Versification v11n = Versifications.instance().getVersification(v);

        URI path = SwordUtil.getExpandedDataPath(bmd);

        String otRef = NetUtil.lengthenURI(path, File.separator + SwordConstants.FILE_OT + ".ref").getPath();
        File otRefFile = new File(otRef);

        String ntRef = NetUtil.lengthenURI(path, File.separator + SwordConstants.FILE_NT + ".ref").getPath();
        File ntRefFile = new File(ntRef);

        populateVerseReferences(otRefs, otRefFile, v11n);
        populateVerseReferences(ntRefs, ntRefFile, v11n);

    }

    private void populateVerseReferences(final Map<Integer, String> verseRefs, final  File refFile, final Versification v11n){
        if (refFile.canRead()) {
            try {

                InputStream inputStream = new FileInputStream(refFile.getPath());
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
                    verseRefs.put(index++, String.format("%s.%02d.%02d",bookName, chapter, verse));
                }

            } catch (IOException ex) {
                log.error("Failed to process ot ref file", ex);
            }
        }
    }
    private static final Logger log = LoggerFactory.getLogger(CustomVersification.class);
}
