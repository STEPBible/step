package com.tyndalehouse.step.tools.international;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Checks language files all contain the right number of markers
 *
 * @author chrisburrell
 */
public class CheckLanguageFiles {
    private static final Logger LOGGER = LoggerFactory.getLogger(CheckLanguageFiles.class);
    private static final Map<String, Integer> ENTRIES = new HashMap<String, Integer>(1024);

    /**
     * Checks the language files are complete
     *
     * @param args
     */
    public static void main(String[] args) throws IOException {
        readInput(ENTRIES, "/HtmlBundle.properties");
        readInput(ENTRIES, "/InteractiveBundle.properties");
        readInput(ENTRIES, "/ErrorBundle.properties");
        readInput(ENTRIES, "/SetupBundle.properties");

        final Collection<File> files = FileUtils.listFiles(new File(
                CheckLanguageFiles.class.getResource("/HtmlBundle.properties").getPath()).getParentFile(),
                new String[]{"properties"}, false);
        for (File f : files) {
            Map<String, Integer> languageEntries = new HashMap<String, Integer>(1024);
            FileInputStream resourceStream = null;
            try {
                resourceStream = new FileInputStream(f);
                final String prefix = getPrefix(f.getName());
                if("/na/".equals(prefix)) {
                    //skip
                    continue;
                }
                getEntriesFromInputStream(languageEntries, prefix, resourceStream);

                check(f.getName(), languageEntries);
            } finally {
                IOUtils.closeQuietly(resourceStream);
            }
        }
    }

    private static void check(final String fileName, final Map<String, Integer> languageEntries) {
        for(Map.Entry<String, Integer> entry : languageEntries.entrySet()) {
            final String key = entry.getKey();
            Integer value = entry.getValue();

            final Integer numOccurrences = ENTRIES.get(key);
            if(numOccurrences == null) {
                LOGGER.warn("{}:{} Extra key in file.", fileName, key);
                return;
            }

            if(value == null) {
                throw new RuntimeException("Value should never be null");
            }

            if(!value.equals(numOccurrences)) {
                LOGGER.error("{}:{} original: {}, targetLang: {} ", fileName, key, numOccurrences, value);
            }
        }
    }

    /**
     * Reads the default data and puts it into the map
     *
     * @param classpath
     */
    private static void readInput(Map<String, Integer> entries, final String classpath) throws IOException {
        final InputStream resourceStream = CheckLanguageFiles.class.getResourceAsStream(classpath);
        getEntriesFromInputStream(entries, getPrefix(classpath), resourceStream);
    }

    private static String getPrefix(final String filename) {
        if (filename.indexOf("HtmlBundle") != -1) {
            return "h_";
        }
        if (filename.indexOf("InteractiveBundle") != -1) {
            return "i_";
        }
        if (filename.indexOf("SetupBundle") != -1) {
            return "s_";
        }
        if (filename.indexOf("ErrorBundle") != -1) {
            return "e_";
        }
        return "/na/";
    }

    private static void getEntriesFromInputStream(final Map<String, Integer> entries, final String prefix, final InputStream resourceStream) throws IOException {
        Properties p = new Properties();
        p.load(resourceStream);
        for (Map.Entry<Object, Object> e : p.entrySet()) {
            entries.put(prefix + e.getKey(), count((String) e.getValue()));
        }
    }

    /**
     * Counts the number of percentage signs
     *
     * @param value the value we are trying to count
     * @return the number of percentage signs
     */
    private static Integer count(final String value) {
        int count = 0;
        for (int i = 0; i < value.length(); i++) {
            if (value.charAt(i) == '%') {
                count++;
            }
        }

        return count;
    }
}
