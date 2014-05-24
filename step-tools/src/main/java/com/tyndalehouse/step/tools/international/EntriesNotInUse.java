package com.tyndalehouse.step.tools.international;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

/**
 * Created by Chris on 24/05/2014.
 */
public class EntriesNotInUse {
    private static final String[] exceptionPrefixes = new String[] {"alternative_", "search_", "context_", "install", "download_"};
    private static final String[] exceptionSuffixes = new String[] {"_section", "_personal_notes"};

    private static final Logger LOG = LoggerFactory.getLogger(EntriesNotInUse.class);

    public static void main(String[] args) throws IOException {
        final Set<String> allEntries = new HashSet<String>();

        readInput(allEntries, "/HtmlBundle.properties");
        readInput(allEntries, "/InteractiveBundle.properties");
        readInput(allEntries, "/ErrorBundle.properties");
        readInput(allEntries, "/SetupBundle.properties");

        String stepSource = readSourceFiles();


        for (Iterator<String> iterator = allEntries.iterator(); iterator.hasNext(); ) {
            String s = iterator.next();
            removeFromList(stepSource, iterator, s);
        }


        List<String> finalList = new ArrayList<String>(allEntries);
        Collections.sort(finalList);


        for(String s : finalList) {
            LOG.error(s);
        }
        LOG.error("{}", finalList.size());
    }

    private static void removeFromList(final String stepSource, final Iterator<String> iterator, final String s) {
        for(String t : exceptionPrefixes) {
            if(s.startsWith(t)) {
                iterator.remove();
                return;
            }
        }

        for(String t : exceptionSuffixes) {
            if(s.endsWith(t)) {
                iterator.remove();
                return;
            }
        }

        if (stepSource.contains(s)) {
            iterator.remove();
            return;
        }
    }

    private static String readSourceFiles() throws IOException {
        File f = new File("c:\\dev\\projects\\step");
        final Collection<File> files = FileUtils.listFiles(f, new String[]{
                "java",
                "js",
                "xslt",
                "xsl",
                "xml",
                "jsp",
                "tag",
                "html"

        }, true);

        StringBuilder stepSourceCode = new StringBuilder();
        for (File s : files) {
            stepSourceCode.append(FileUtils.readFileToString(s));
            stepSourceCode.append('\n');
        }
        return stepSourceCode.toString();
    }

    /**
     * Reads the default data and puts it into the map
     *
     * @param classpath
     */
    private static void readInput(Set<String> entries, final String classpath) throws IOException {
        final InputStream resourceStream = CheckLanguageFiles.class.getResourceAsStream(classpath);
        getEntriesFromInputStream(entries, resourceStream);
    }

    private static void getEntriesFromInputStream(final Set<String> entries, final InputStream resourceStream) throws IOException {
        Properties p = new Properties();
        p.load(resourceStream);
        for (Map.Entry<Object, Object> e : p.entrySet()) {
            entries.add((String) e.getKey());
        }
    }

}
