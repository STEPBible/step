package com.tyndalehouse.step.tools.versification;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.BookMetaData;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.sword.ConfigEntry;
import org.crosswire.jsword.book.sword.ConfigValueInterceptor;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;

import com.google.inject.*;
import com.google.inject.Module;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class CustomVersification {

    public void loadFromJSON(final File jsonFile) throws NoSuchKeyException, BookException, IOException {

        //read json file data to String
        File f;

        byte[] jsonData = Files.readAllBytes(Paths.get(jsonFile.getPath()));

        //create ObjectMapper instance and allow comments
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(JsonParser.Feature.ALLOW_COMMENTS, true);

        //convert json string to V11nTmp object
        V11nTmp v11n = objectMapper.readValue(jsonData, V11nTmp.class);

        SystemCustomVersification.V11N_NAME = v11n.v11nName;

        int vmIndex = 0;
        SystemCustomVersification.BOOKS_OT = new BibleBook[v11n.otbooks.length - 1];
        SystemCustomVersification.LAST_VERSE_OT = new int[v11n.otbooks.length - 1][];
        for(int i = 0; i < v11n.otbooks.length - 1; i++){
            SystemCustomVersification.BOOKS_OT[i] = BibleBook.fromOSIS(v11n.otbooks[i].osis);
            SystemCustomVersification.LAST_VERSE_OT[i] = new int[v11n.otbooks[i].chapmax];
            System.arraycopy( v11n.vm, vmIndex, SystemCustomVersification.LAST_VERSE_OT[i], 0, v11n.otbooks[i].chapmax);
            vmIndex += v11n.otbooks[i].chapmax;
        }

        SystemCustomVersification.BOOKS_NT = new BibleBook[v11n.ntbooks.length - 1];
        SystemCustomVersification.LAST_VERSE_NT = new int[v11n.ntbooks.length - 1][];
        for(int i = 0; i < v11n.ntbooks.length - 1; i++){
            SystemCustomVersification.BOOKS_NT[i] = BibleBook.fromOSIS(v11n.ntbooks[i].osis);
            SystemCustomVersification.LAST_VERSE_NT[i] = new int[v11n.ntbooks[i].chapmax];
            System.arraycopy( v11n.vm, vmIndex, SystemCustomVersification.LAST_VERSE_NT[i], 0, v11n.ntbooks[i].chapmax);
            vmIndex += v11n.ntbooks[i].chapmax;
        }

        Versifications.instance().register(new SystemCustomVersification());

        final Books books = Books.installed();
        final Book svd = books.getBook("arasvd2");
        BookMetaData bmd = svd.getBookMetaData();
        String v = (String) bmd.getProperty(BookMetaData.KEY_VERSIFICATION);
        final Versification v11nTest = Versifications.instance().getVersification("NRSV2" );

        final Key key = svd.getKey("Gen.1-Mal.4");


        //System.arraycopy(v11n.ntbooks, 0, SystemCustomVersification.BOOKS_NT, 0, v11n.ntbooks.length - 1);
    }

}
