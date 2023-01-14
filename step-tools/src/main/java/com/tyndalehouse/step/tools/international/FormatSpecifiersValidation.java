package com.tyndalehouse.step.tools.international;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.*;

/**
 * <p>Prints all mismatches of format specifiers between language files and the master file</p>
 * <p>A mismatch is considered if the number of specifiers are not equal or if the specifier in the language file is incomlete.</p>
 * <p>For example, it is a mismatch if the reference text has "resources: %s. Note: The %s" nad the translation file has only one "%s"</p>
 * <p>or if the translation file has "%" with out s or "% s" i.e with a space between the "%"nd the "s"</p>
 * <p>Each printed line shows the file name containing the mismatch and the marker of the mismatch text</p>
 */
public class FormatSpecifiersValidation {
//    private static final String[] exceptionPrefixes = new String[] {"alternative_", "search_", "context_", "install", "download_"};
 //   private static final String[] exceptionSuffixes = new String[] {"_section", "_personal_notes"};

 //   private static final Logger LOG = LoggerFactory.getLogger(FormatSpecifiersValidation.class);

    public static void main(String[] args) throws IOException {
        //final Set<String> allEntries = new HashSet<String>();
        final LinkedHashMap<String, List<String>> formatSpecifiersHtml = new LinkedHashMap<>();
        final LinkedHashMap<String,  List<String>> formatSpecifiersInteractive = new LinkedHashMap<>();
        final LinkedHashMap<String,  List<String>> formatSpecifiersError = new LinkedHashMap<>();
        final LinkedHashMap<String,  List<String>> formatSpecifiersSetup = new LinkedHashMap<>();

        final LinkedHashMap<String, List<String>> exceptions = new LinkedHashMap<>();


        getSpecifiers(formatSpecifiersHtml, "/HtmlBundle.properties");
        getSpecifiers(formatSpecifiersInteractive, "/InteractiveBundle.properties");
        getSpecifiers(formatSpecifiersError, "/ErrorBundle.properties");
        getSpecifiers(formatSpecifiersSetup, "/SetupBundle.properties");

        // get a list of all files in the resources folder
        final Collection<File> files = FileUtils.listFiles(new File(
                        CheckLanguageFiles.class.getResource("/HtmlBundle.properties").getPath()).getParentFile(),
                new String[]{"properties"}, false
        );

        // now process each file
        for (File f : files) {
            if (f.getName().contains("step.core") || !f.getName().contains("_")) {
                // this is not a translation file
                continue;
            }

            final String name = f.getName();
            if (name.indexOf("HtmlBundle") != -1) {
                validatTranslationFile(f,formatSpecifiersHtml, exceptions);
            }
            if (name.indexOf("InteractiveBundle") != -1) {
                validatTranslationFile(f,formatSpecifiersInteractive, exceptions);
            }
            if (name.indexOf("SetupBundle") != -1) {
                validatTranslationFile(f,formatSpecifiersSetup, exceptions);
            }
            if (name.indexOf("ErrorBundle") != -1) {
                validatTranslationFile(f,formatSpecifiersError, exceptions);
            }
        }

        System.out.println("Format Specifier Exceptions");
        System.out.println("===========================");
        Iterator it = exceptions.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();
            List<String> markers = (List<String>) pair.getValue();
            for(String marker : markers) {
                System.out.println(String.format("File: %s\t marker: %s", pair.getKey(), marker));
            }
        }


        }

    private static void validatTranslationFile (final File file, final LinkedHashMap<String, List<String>> formatSpecifiers,
                                                final LinkedHashMap<String, List<String>> exceptions)  throws IOException {

        FileInputStream resourceStream = new FileInputStream(file);

        Properties p = new Properties();
        p.load(resourceStream);

        List<String> ex = new ArrayList<>();

        for (Map.Entry<Object, Object> e : p.entrySet()) {
            String marker = (String) e.getKey();
            String text = (String) e.getValue();

            Iterator it = formatSpecifiers.entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry pair = (Map.Entry)it.next();
                if(marker.equals(pair.getKey()))
                {
                    List<String> fmts = (List<String>) pair.getValue();
                    int idx = 0;
                    for (int i = 0; i < fmts.size(); i++)
                    {
                        idx = text.indexOf(fmts.get(i));
                        if(idx < 0)
                        {
                            ex.add(marker);
                        }
                        idx++;
                    }
                }
             }

        }

        if(ex.size() > 0)
            exceptions.put(file.getName(), ex);

    }

    /**
     * Reads the default data, extracts the format specifires and puts them in a map
     *
     * @param formatSpecifiers will be populated with markers and associated format specifiers separated by spaces if more than one
     * @param classpath path to the translation file
     * @throws IOException
     */
    private static void getSpecifiers(final LinkedHashMap<String, List<String>> formatSpecifiers, final String classpath) throws IOException {
        final InputStream resourceStream = FormatSpecifiersValidation.class.getResourceAsStream(classpath);

        try {
            Properties p = new Properties();
            p.load(resourceStream);
            for (Map.Entry<Object, Object> e : p.entrySet()) {
                String txt = (String) e.getValue();
                if (!txt.contains("%"))
                    continue;
                String fmt = "";
                List<String> fmts = new ArrayList<>();
                int i = txt.indexOf('%');
                while (i < txt.length()) {
                    if (fmt.isEmpty()) {
                        if (txt.charAt(i) == '%') {
                            fmt = "%";
                        }
                    } else {
                        fmt += txt.charAt(i);
                        if ((txt.charAt(i) == 'd') || (txt.charAt(i) == 's') || (txt.charAt(i) == '%')) {
                            fmts.add(fmt);
                            fmt = "";
                        }
                    }
                    i++;
                }

                formatSpecifiers.put((String) e.getKey(), fmts);
            }
        }catch(Exception e){
            System.out.println(e.getMessage());
        }
    }

}
