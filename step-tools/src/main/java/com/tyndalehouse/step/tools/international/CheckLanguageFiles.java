package com.tyndalehouse.step.tools.international;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Checks language files all contain the right number of markers
 */
public class CheckLanguageFiles {
    public static final Map<String, Set<String>> MARKERS = new LinkedHashMap<String, Set<String>>();
    private static final Logger LOGGER = LoggerFactory.getLogger(CheckLanguageFiles.class);
    private static final Map<String, Integer> ENTRIES = new LinkedHashMap<String, Integer>(1024);
    private static final Pattern VALID = Pattern.compile("%[sd]|%%|%\\d+\\$[sd]");

    // an invalid marker is a % sign which is not followed by a digit, another % sign, or a d or an i
    private static final Pattern INVALID = Pattern.compile("(?<!%)%(?![%sd0-9])");

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
                new String[]{"properties"}, false
        );
        for (File f : files) {
            if (f.getName().contains("step.core") || !f.getName().contains("_")) {
                continue;
            }

            Map<String, Integer> languageEntries = new LinkedHashMap<String, Integer>(1024);
            FileInputStream resourceStream = null;
            resourceStream = new FileInputStream(f);
            final String name = f.getName();
            final String prefix = getPrefix(name);
            if ("/na/".equals(prefix)) {
                //skip
                continue;
            }
            final int beginIndex = name.indexOf('_');
            String language = null;
            if (beginIndex != -1) {
                language = name.substring(beginIndex + 1, name.indexOf('.'));
            }
            final LinkedHashMap<String, Set<String>> markers = new LinkedHashMap<String, Set<String>>();
            Properties p = getEntriesFromInputStream(markers, language, languageEntries, prefix, resourceStream);
            IOUtils.closeQuietly(resourceStream);
            check(name, languageEntries);
            validate(p, f, markers);

        }

        LOGGER.error("Remember to 'MAKE' the module again before running, or Intellij will appear not to have done anything.");
    }

    private static void validate(final Properties p, File file, final Map<String, Set<String>> markers) {
        boolean changed = false;
        List<String> extras = new ArrayList<String>(4);
        List<String> missing = new ArrayList<String>(4);
        for (Map.Entry<String, Set<String>> marker : markers.entrySet()) {
            final String propertyKey = marker.getKey().substring(2);
            final Set<String> englishPropertyMarkers = MARKERS.get(marker.getKey());
            final Set<String> nonEnglishMarkers = marker.getValue();
            //list of markers in non-english that shouldn't be there
            for (String nonEnglishMarker : nonEnglishMarkers) {
                if (!englishPropertyMarkers.contains(nonEnglishMarker)) {
                    LOGGER.error("{}:{}:{} should not be present", file.getName(), marker.getKey(), nonEnglishMarker);
                    extras.add(nonEnglishMarker);
                }
            }

            //list of markers in non-english that are missing
            for (String englishMarker : englishPropertyMarkers) {
                if (!nonEnglishMarkers.contains(englishMarker)) {
                    LOGGER.error("{}:{} is missing.", marker.getKey(), englishMarker);
                    missing.add(englishMarker);
                }
            }

            while (extras.size() > 0 && missing.size() > 0) {
                String extraMarker = extras.get(0);
                String missingMarker = missing.get(0);
                String property = p.getProperty(propertyKey);
                String newPropertyValue = property.replace(extraMarker, missingMarker);
                p.put(propertyKey, newPropertyValue);
                changed = true;

                extras.remove(0);
                missing.remove(0);
            }

            if (extras.size() > 0) {
                for (int ii = 0; ii < extras.size(); ii++) {
                    String property = p.getProperty(propertyKey);
                    String newPropertyValue = property.replace(extras.get(ii), "");
                    p.put(propertyKey, newPropertyValue);
                    changed = true;
                }
            }

            if (missing.size() > 0) {
                for (int ii = 0; ii < missing.size(); ii++) {
                    String property = p.getProperty(propertyKey);
                    String newPropertyValue = property + " " + missing.get(ii);
                    p.put(propertyKey, newPropertyValue);
                    changed = true;
                }
            }

            //finally clean up any non-matching percent sign - we've done our best, now is the time to move on!
            final String property = p.getProperty(propertyKey);
            final Matcher invalidMatches = INVALID.matcher(property);
            if (invalidMatches.find()) {
                LOGGER.error("Was [{}]", property);
                final String cleansed = invalidMatches.replaceAll("");
                p.setProperty(propertyKey, cleansed);
                LOGGER.error("Was [{}]", cleansed);
                changed = true;
            }

            extras = new ArrayList<String>(4);
            missing = new ArrayList<String>(4);
        }

        if (changed) {
            FileOutputStream fileOutputStream = null;
            try {
                fileOutputStream = new FileOutputStream("C:\\dev\\projects\\step\\step-core\\src\\main\\resources\\" + file.getName());
                p.store(fileOutputStream, "Amended by STEP Language checker");
            } catch (IOException e) {
                LOGGER.error(e.getMessage(), e);
            } finally {
                IOUtils.closeQuietly(fileOutputStream);
            }
        }
    }

    private static void check(final String fileName, final Map<String, Integer> languageEntries) {
        for (Map.Entry<String, Integer> entry : languageEntries.entrySet()) {
            final String key = entry.getKey();
            Integer value = entry.getValue();

            final Integer numOccurrences = ENTRIES.get(key);
            if (numOccurrences == null) {
                LOGGER.warn("{}:{} Extra key in file.", fileName, key.substring(2));
                continue;
//                return;
            }

            if (value == null) {
                throw new RuntimeException("Value should never be null");
            }

            if (!value.equals(numOccurrences)) {
                LOGGER.error("{}:{} original: {}, targetLang: {} ", fileName, key.substring(2), numOccurrences, value);
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
        getEntriesFromInputStream(MARKERS, "en", entries, getPrefix(classpath), resourceStream);
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

    private static Properties getEntriesFromInputStream(Map<String, Set<String>> markers, final String language,
                                                        final Map<String, Integer> entries, final String prefix, final InputStream resourceStream) throws IOException {

        Properties p = new Properties();
        p.load(resourceStream);

        for (Map.Entry<Object, Object> e : p.entrySet()) {
            entries.put(prefix + e.getKey(), count(markers, prefix + e.getKey(), language, (String) e.getValue()));
        }
        return p;
    }


    /**
     * Counts the number of percentage signs
     *
     * @param value the value we are trying to count
     * @return the number of percentage signs
     */
    private static Integer count(final Map<String, Set<String>> markers,
                                 final String key,
                                 final String language, final String value) {
        int count = 0;
        for (int i = 0; i < value.length(); i++) {
            if (value.charAt(i) == '%') {
                count++;
            }
        }

        if (count > 0) {
            int remaining = count;
            Matcher matcher = VALID.matcher(value);
            final Set<String> markerSet = new LinkedHashSet<String>();
            markers.put(key, markerSet);
            while (remaining > 0 && matcher.find()) {
                markerSet.add(matcher.group());
                remaining--;
            }

            if (value.indexOf("%%") > 0) {
                remaining--;
            }

            if (remaining != 0) {
                LOGGER.error("{}: Found invalid marker in {}", language, value);
            }
        }

        return count;
    }
}
