package com.tyndalehouse.step.tools.esv;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;

import com.tyndalehouse.step.core.service.jsword.impl.StepConfigValueInterceptor;
import org.apache.commons.io.FileUtils;
import org.crosswire.common.util.CWProject;
import org.crosswire.jsword.book.*;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.versification.BookName;
import org.jdom2.Element;
import org.jdom2.output.XMLOutputter;
import org.crosswire.jsword.book.sword.ConfigEntry;

/**
 * Extract and build an OSIS xml file out of a module
 * Program arguments:
 * -v version name e.g. "kjv" - required
 * -f path of the output file e.g. C:/temp/kjv/kjv.xml  - required
 * -r reference - optional defaults to "Gen.1-Rev.22"
 * -k key encryption key (KEK) if the book module is encrypted - optional
 * -t no value required. if specified, removes extra verse titles. Optional
 * -n no value required. this is a special flag to fix NIV errors. Optional
 * examples of arguments
 * -v "niv" -f "c:\temp\niv\test1.xml" -k "some key data" -t -n
 * -v "ESV_th" -f "c:\temp\esv\test1.xml" -r "Gen.1-Mal.4"
 */
public class ModToOSIS {

    public static void main(final String[] args)  throws NoSuchKeyException, BookException, IOException {
        String version = "";
        String ref = "Gen.1-Rev.22";
        String kek = "";
        boolean fixVerseTitleErrors = false;
        boolean fixNivErrors = false;
        String outPath = "";

        for (int i = 0; i < args.length; i++) {
            String arg = args[i];
            if (arg.equals("-v")) {
                version = args[++i];
            } else if (arg.equals("-f")) {
                outPath = args[++i];
            } else if (arg.equals("-r")) {
                ref = args[++i];
            } else if (arg.equals("-k")) {
                kek = args[++i];
            } else if (arg.equals("-t")) {
                fixVerseTitleErrors = true;
            } else if (arg.equals("-n")) {
                fixNivErrors = true;
            }
        }
        if (version == "" || outPath == "")
        {
            System.out.println("-v and -f are required");
            return;
        }
        generateOSIS(version, ref, kek, fixVerseTitleErrors, fixNivErrors, outPath);
    }

    private static void generateOSIS(   final String version ,
                                        final String ref,
                                        final String kek,
                                        final boolean fixVerseTitleErrors,
                                        final boolean fixNivErrors,
                                        final String outPath) throws NoSuchKeyException, BookException, IOException {
        int nivError1 = 0;
        int nivError2 = 0;


        final StringBuilder osis = new StringBuilder(128000);
        AddHeader(osis);

        if (kek != "") {
            // let the book driver find the jsword-mods.d dir to get the module key
            CWProject.instance().setFrontendName("step");

            // create the interceptor in order to decrypt the key
            ConfigEntry.setConfigValueInterceptor(new StepConfigValueInterceptor(kek));
        }

        BookName.setFullBookName(false);
        final Book book = Books.installed().getBook(version);
        final Key key = book.getKey(ref);

        final Iterator<Key> iterator = key.iterator();
        int count = 0;
        int ngCount = 0;
        int tCount = 0;
        while (iterator.hasNext()) {
            final Key next = iterator.next();
            count++;
            boolean isVerse = false;
            if (next instanceof Verse) {
                final Verse verse = (Verse) next;
                isVerse = true;
            }

            final BookData bd = new BookData(book, next);
            Element e = bd.getOsisFragment();
            XMLOutputter outp = new XMLOutputter();
            String s = outp.outputString(e);
            int index;
            if (isVerse && fixVerseTitleErrors) {
                int i1 = s.indexOf("<title ");
                int i2 = s.indexOf("</title>");
                if (i1 > 0 && i2 > 0) {
                    String r = s.substring(i1, i2 + ("</title>").length());
                    s = s.replace(r, "");
                }
            }
            if (fixNivErrors) {
                if (s.contains("the</title>")) {
                    s = s.replace("the</title>", "the <divineName>Lord</divineName></title>");
                    nivError1++;
                }
                if (s.contains("the<divineName>")) {
                    s = s.replace("the</title>", "the <divineName>");
                    nivError2++;
                }
                if (s.contains("The<divineName>")) {
                    s = s.replace("the</title>", "The <divineName>");
                    nivError2++;
                }
                if (s.contains("Sovereign<divineName>")) {
                    s = s.replace("the</title>", "Sovereign <divineName>");
                    nivError2++;
                }
                if (s.contains("one<divineName>")) {
                    s = s.replace("the</title>", "one <divineName>");
                    nivError2++;
                }
            }
            osis.append(s);
            osis.append('\n');
        }

        AddTrailer(osis);
        System.out.println(count);
        System.out.println(nivError1);
        System.out.println(nivError2);

        FileUtils.writeStringToFile(new File(outPath), osis.toString());
    }

    private static void AddHeader(final StringBuilder sb)
    {
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<osis xmlns=\"http://www.bibletechnologies.net/2003/OSIS/namespace\"\n");
        sb.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n");
        sb.append("xmlns:osis=\"http://www.bibletechnologies.net/2003/OSIS/namespace\"\n");
        sb.append("schemaLocation=\n");
        sb.append("\"http://www.bibletechnologies.net/2003/OSIS/namespace http://www.bibletechnologies.net/osisCore.2.1.1.xsd\"\n");
        sb.append(">\n");
        sb.append("<osisText osisIDWork=\"NIV_SB\" osisRefWork=\"bible\" xml:lang=\"en\" canonical=\"true\">\n");
        sb.append("<header>\n");
        sb.append("<work osisWork=\"NIV_SB\">\n");
        sb.append("<rights type=\"copyright\">Copyright © 2011</rights>\n");
        sb.append("<title>NIV - New International Version, 2011 </title>\n");
        sb.append("<publisher>Biblica</publisher>\n");
        sb.append("<type type=\"OSIS\">Bible</type>\n");
        sb.append("<identifier type=\"OSIS\">Bible.en.NIV_SB.2011</identifier>\n");
        sb.append("<source>Biblica</source>\n");
        sb.append("<language type=\"IETF\">en</language>\n");
        sb.append("<refSystem>Bible.KJV</refSystem>\n");
        sb.append("</work>\n");
        sb.append("</header>\n");
    }

    private static void AddTrailer(final StringBuilder sb)
    {
        sb.append("</osisText>\n");
        sb.append("</osis>\n");
    }

}
