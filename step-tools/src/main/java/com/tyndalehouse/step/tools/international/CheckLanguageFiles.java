package com.tyndalehouse.step.tools.international;

import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Checks language files all contain the right number of markers
 * @author chrisburrell
 */
public class CheckLanguageFiles {
    private static final Map<String, Integer> ENTRIES = new HashMap<String, Integer>(1024);

    /**
     * Checks the language files are complete
     * @param args
     */
    public static void main(String[] args) throws IOException {

        readInput(ENTRIES, "/HtmlBundle.properties", "h_");
        readInput(ENTRIES, "/InteractiveBundle.properties", "i_");
        readInput(ENTRIES, "/ErrorBundle.properties", "e_");
        readInput(ENTRIES, "/SetupBundle.properties", "s_");


        final Collection<File> files = FileUtils.listFiles(new File(args[0]), new String[] { "properties" }, false);
        for(File f : files) {
            Map<String, Integer> languageEntries = new HashMap<String, Integer>(1024);
//            readInput();
        }
    }

    /**
     * Reads the default data and puts it into the map
     * @param classpath
     */
    private static void readInput(Map<String, Integer> entries, final String classpath, String prefix) throws IOException {
        Properties p = new Properties();
        p.load(CheckLanguageFiles.class.getResourceAsStream(classpath));
        for(Map.Entry<Object, Object> e : p.entrySet()) {
            entries.put(prefix + e.getKey(), count((String)e.getValue()));
        }
    }

    /**
     * Counts the number of percentage signs
     * @param value the value we are trying to count
     * @return the number of percentage signs
     */
    private static Integer count(final String value) {
        int count = 0;
        for(int i = 0; i < value.length(); i++) {
            if(value.charAt(i) == '%') {
                count++;
            }
         }

        return count;
    }
}
