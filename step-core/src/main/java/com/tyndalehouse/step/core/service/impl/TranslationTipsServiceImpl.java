package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.create.ModuleLoader;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.TranslationTipsService;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;

/**
 * Strong augmentation service to provide better context/definitions to the end user.
 */
public class TranslationTipsServiceImpl implements TranslationTipsService {

    private static final Logger LOGGER = LoggerFactory.getLogger(StrongAugmentationServiceImpl.class);

    public void loadVersesToBitwise(String translationTipsPath) {
        Reader fileReader = null;
        BufferedInputStream bufferedStream = null;
        InputStream stream = null;
        final Versification NRSVVersication = Versifications.instance().getVersification("NRSV");
        try {
            stream = ModuleLoader.class.getResourceAsStream(translationTipsPath);
            if (stream == null)
                throw new StepInternalException("Unable to read resource: " + translationTipsPath);
            bufferedStream = new BufferedInputStream(stream);
            fileReader = new InputStreamReader(bufferedStream, StandardCharsets.UTF_8);
            final BufferedReader bufferedReader = new BufferedReader(fileReader);
            String data;
            try {
                while ((data = bufferedReader.readLine()) != null) {
                    if (data.startsWith("Wis ") || data.startsWith("Sir ") || data.startsWith("Bar ") ||
                            data.startsWith("2Esd ") || data.startsWith("1Esd ") || data.startsWith("3Macc ") ||
                            data.startsWith("1Macc ") || data.startsWith("2Macc ") || data.startsWith("PrMan ") ||
                            data.startsWith("Azar ") || data.startsWith("Sus ") || data.startsWith("LJE ") ||
                            data.startsWith("Judith ") || data.startsWith("AddEsth ") || data.startsWith("EpJer ") ||
                            data.startsWith("Wis ") || data.startsWith("Tob ") || data.startsWith("Bel "))
                        continue;
                    if (data.substring(0,2).equals("Pp"))
                        data = "Phil" + data.substring(2);
                    String[] parts = data.split(",");
                    if (parts[0].contains("introduction")) continue;
                    if (parts.length != 2) {
                        System.out.println("Expected a comma between two fields.  Line: " + data);
                        continue;
                    }
                    parts[0] = parts[0].split("-")[0].split(";")[0].trim();
                    parts[1] = parts[1].trim();
                    String[] partsOfRef = parts[0].split(" ");
                    if (partsOfRef.length > 2) { // If there are more than one space, only use the part
                        parts[0] = partsOfRef[0] + " " + partsOfRef[1];
                    }
                    if ((partsOfRef.length > 1) && (!Character.isDigit(parts[0].charAt(parts[0].length() - 1))))
                        parts[0] = parts[0].substring(0, parts[0].length() - 1);
                    PassageKeyFactory keyf = PassageKeyFactory.instance();
                    try {
                        Verse key = VerseFactory.fromString(NRSVVersication, parts[0]);
                        if (key == null) {
                            System.out.println("no key: " + data);
                            continue;
                        }
                        String bookName = key.getBook().toString().toLowerCase();
                        String chapter = String.valueOf(key.getChapter());
                        String verse = String.valueOf(key.getVerse());
                        int urlLength = parts[1].length();
                        if (parts[1].substring(urlLength - 1).equals("/")) {
                            urlLength--;
                        }
                        int lastSlash = parts[1].lastIndexOf("/", urlLength - 1);
                        if (lastSlash == -1) {
                            System.out.println("Translation tips, does not seem to contain a valid path: " + data);
                            continue;
                        }
                        String fileNameFromURL = parts[1].substring(lastSlash + 1, urlLength);
                        if (fileNameFromURL.length() < 1) continue;
                        int ordinal = key.getOrdinal();
                        if (fileNameFromURL.equals(bookName + "-" + chapter + verse)) {
                            if (regularFormatedFN.store.get(ordinal)) {
                                System.out.println("Duplicate definition regular: " + data + ", " + ordinal);
                                continue;
                            }
                            regularFormatedFN.addAll(keyf.getKey(Versifications.instance().getVersification("NRSV"), parts[0]));
                        }
                        else if (fileNameFromURL.equals(bookName + "-" + chapter + "-" + verse)) {
                            if (regularFormatedFN.store.get(ordinal)) {
                                System.out.println("Duplicate definition alternate: " + data + ", " + ordinal);
                                continue;
                            }
                            alternativeFormatedFN.addAll(keyf.getKey(Versifications.instance().getVersification("NRSV"), parts[0]));
                        }
                        else {
                            customFN.put(ordinal, fileNameFromURL);
                        }
                    }
                    catch (Exception e) {
                        if ((e.toString().indexOf("Verse should be between") == -1) &&
                                (e.toString().indexOf("Chapter should be between") == -1))
                            System.out.println(data + " " + e);
                    }
                }
            } catch (final IOException e) {
                LOGGER.error("Unable to read a line from the translation tip file");
                throw new StepInternalException("Unable to read a line from the translation tip file ", e);
            }
        } finally {
            closeQuietly(fileReader);
            closeQuietly(bufferedStream);
            closeQuietly(stream);
        }
    }
    public void readAndLoad(final String translationTipsPath) {
        loadVersesToBitwise(translationTipsPath);
    }
}
