package com.tyndalehouse.step.tools.conversion;

import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Passage;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.system.Versifications;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.util.Queue;
import java.util.concurrent.LinkedBlockingQueue;

public class OsisConversionUtils {
    private static final String ERROR = "<!-- ERROR -->";
    private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(OsisConversionUtils.class);
    private static Queue<Object> title = new LinkedBlockingQueue<>();
    private static boolean inChapter = false;
    private static boolean inVerse = false;
    private static int currentPsalm = -1;
    private static int currentChapter;
    private static String acrosticTitle;
    private static String acrosticLetter;
    private static boolean inRealChapter = false;
    private static String currentBook;
    private static String currentChapterId;
    private static String currentVerseId;

    private OsisConversionUtils() {
        //no implementation
    }

    public static String toTitleCase(String title) {
        return StringUtils.toTitleCase(title, true);
    }

    public static String convertBookToOsis(final String bookAbbreviation) {
        switch (bookAbbreviation) {
            case "GEN":
                return BibleBook.GEN.getOSIS();
            case "EXO":
                return BibleBook.EXOD.getOSIS();
            case "LEV":
                return BibleBook.LEV.getOSIS();
            case "NUM":
                return BibleBook.NUM.getOSIS();
            case "DEU":
                return BibleBook.DEUT.getOSIS();
            case "JOS":
                return BibleBook.JOSH.getOSIS();
            case "JDG":
                return BibleBook.JUDG.getOSIS();
            case "RUT":
                return BibleBook.RUTH.getOSIS();
            case "1SA":
                return BibleBook.SAM1.getOSIS();
            case "2SA":
                return BibleBook.SAM2.getOSIS();
            case "1KI":
                return BibleBook.KGS1.getOSIS();
            case "2KI":
                return BibleBook.KGS2.getOSIS();
            case "1CH":
                return BibleBook.CHR1.getOSIS();
            case "2CH":
                return BibleBook.CHR2.getOSIS();
            case "EZR":
                return BibleBook.EZRA.getOSIS();
            case "NEH":
                return BibleBook.NEH.getOSIS();
            case "EST":
                return BibleBook.ESTH.getOSIS();
            case "JOB":
                return BibleBook.JOB.getOSIS();
            case "PSA":
                return BibleBook.PS.getOSIS();
            case "PRO":
                return BibleBook.PROV.getOSIS();
            case "ECC":
                return BibleBook.ECCL.getOSIS();
            case "SNG":
                return BibleBook.SONG.getOSIS();
            case "ISA":
                return BibleBook.ISA.getOSIS();
            case "JER":
                return BibleBook.JER.getOSIS();
            case "LAM":
                return BibleBook.LAM.getOSIS();
            case "EZK":
                return BibleBook.EZEK.getOSIS();
            case "DAN":
                return BibleBook.DAN.getOSIS();
            case "HOS":
                return BibleBook.HOS.getOSIS();
            case "JOL":
                return BibleBook.JOEL.getOSIS();
            case "AMO":
                return BibleBook.AMOS.getOSIS();
            case "OBA":
                return BibleBook.OBAD.getOSIS();
            case "JON":
                return BibleBook.JONAH.getOSIS();
            case "MIC":
                return BibleBook.MIC.getOSIS();
            case "NAM":
                return BibleBook.NAH.getOSIS();
            case "HAB":
                return BibleBook.HAB.getOSIS();
            case "ZEP":
                return BibleBook.ZEPH.getOSIS();
            case "HAG":
                return BibleBook.HAG.getOSIS();
            case "ZEC":
                return BibleBook.ZECH.getOSIS();
            case "MAL":
                return BibleBook.MAL.getOSIS();
            case "MAT":
                return BibleBook.MATT.getOSIS();
            case "MRK":
                return BibleBook.MARK.getOSIS();
            case "LUK":
                return BibleBook.LUKE.getOSIS();
            case "JHN":
                return BibleBook.JOHN.getOSIS();
            case "ACT":
                return BibleBook.ACTS.getOSIS();
            case "ROM":
                return BibleBook.ROM.getOSIS();
            case "1CO":
                return BibleBook.COR1.getOSIS();
            case "2CO":
                return BibleBook.COR2.getOSIS();
            case "GAL":
                return BibleBook.GAL.getOSIS();
            case "EPH":
                return BibleBook.EPH.getOSIS();
            case "PHP":
                return BibleBook.PHIL.getOSIS();
            case "COL":
                return BibleBook.COL.getOSIS();
            case "1TH":
                return BibleBook.THESS1.getOSIS();
            case "2TH":
                return BibleBook.THESS2.getOSIS();
            case "1TI":
                return BibleBook.TIM1.getOSIS();
            case "2TI":
                return BibleBook.TIM2.getOSIS();
            case "TIT":
                return BibleBook.TITUS.getOSIS();
            case "PHM":
                return BibleBook.PHLM.getOSIS();
            case "HEB":
                return BibleBook.HEB.getOSIS();
            case "JAS":
                return BibleBook.JAS.getOSIS();
            case "1PE":
                return BibleBook.PET1.getOSIS();
            case "2PE":
                return BibleBook.PET2.getOSIS();
            case "1JN":
                return BibleBook.JOHN1.getOSIS();
            case "2JN":
                return BibleBook.JOHN2.getOSIS();
            case "3JN":
                return BibleBook.JOHN3.getOSIS();
            case "JUD":
                return BibleBook.JUDE.getOSIS();
            case "REV":
                return BibleBook.REV.getOSIS();
        }

        throw new ConversionException("Unable to convert book: " + bookAbbreviation);
    }

    public static String openUSXChapter(final String chapterID) {
        markChapterStart(Integer.parseInt(chapterID));
        //USX chapters only contain numbers, so append book name and return
        currentChapterId = convertBookToOsis(currentBook) + "." + chapterID;
        return currentChapterId;
    }

    public static String closeUSXChapter() {
        markChapterEnd();
        return currentChapterId;
    }


    public static String convertChapterToOsis(final String chapterID) {
        //assuming all chapters are roughly the same, remove the first part
        return stripIdAndConvertBook(chapterID);
    }

    public static String openUSXVerse(final String verseNumber) {
        if(verseNumber.indexOf('-') != -1) {
            //we have a range
            final String[] split = StringUtils.split(verseNumber, "-");
            if(split.length != 2) {
                throw new RuntimeException("Unable to parse range of verses");
            }
            int start = Integer.parseInt(split[0]);
            int end = Integer.parseInt(split[1]);
            StringBuilder ref = new StringBuilder();
            for(int ii = start; ii <= end; ii++) {
                ref.append(currentBook);
                ref.append('.');
                ref.append(currentChapter);
                ref.append('.');
                ref.append(ii);
                if(ii != end) {
                    ref.append('_');
                }
            }
            currentVerseId = ref.toString();
        } else {
            currentVerseId = String.format("%s.%d.%s", currentBook, currentChapter, verseNumber);
        }
        inVerse = true;
        return currentVerseId;
    }

    public static String closeUSXVerse() {
        inVerse = false;
        return currentVerseId;
    }

    public static boolean isInVerse() {
        return inVerse;
    }

    public static String convertVerseToOsis(final String s) {
        return stripIdAndConvertBook(s);
    }

    public static String convertNoteScopeToOsis(final String s) {
        if (s == null || s.length() == 0) {
            return s;
        }

        int hasRef = s.indexOf("-");
        if (hasRef != -1) {
            //convert each part and form a ref
            String left = s.substring(0, hasRef);
            String right = s.substring(hasRef + 1);
            return getOsisFromBiblicaSingleRef(left) + '-' + getOsisFromBiblicaSingleRef(right);
        } else {
            return getOsisFromBiblicaSingleRef(s);
        }
    }

    public static String convertNoteType(final String noteType) {
        switch (noteType) {
            case "allusion":
                return "allusion";
            case "alternative":
                return "alternative";
            case "background":
                return "background";
            case "citation":
                return "citation";
            case "crossReference":
                return "crossReference";
            case "exegesis":
                return "exegesis";
            case "explanation":
                return "explanation";
            case "study":
                return "study";
            case "translation":
                return "translation";
            case "variant":
                return "variant";
            case "literal":
                return "background";
            case "general":
                return "background";
            case "versification":
                return "background";
            case "typeversification":
                return "background";
        }
        throw new ConversionException("Unable to convert note type" + noteType);
    }

    private static String stripIdAndConvertBook(final String chapterID) {
        //strip the ID from the front
        final String biblicaChapter = chapterID.substring(chapterID.indexOf('.') + 1);
        return getOsisFromBiblicaSingleRef(biblicaChapter);
    }

    private static String getOsisFromBiblicaSingleRef(final String biblicaChapter) {
        final int startOfChapterProper = biblicaChapter.indexOf('.');
        final String bookName = biblicaChapter.substring(0, startOfChapterProper);
        final String leftOver = biblicaChapter.substring(biblicaChapter.indexOf('.'));
        return convertBookToOsis(bookName) + leftOver;
    }

    public static void markBookStart(final String code) {
        currentBook = code;
    }

    public static void markChapterStart(int chapterNumber) {
        inChapter = true;
        currentChapter = chapterNumber;
        inRealChapter = true;
    }

    public static void markPsalmStart(int psalmNumber) {
        inChapter = true;
        currentPsalm = psalmNumber;
    }

    public static boolean isCurrentChapterAlignedToPsalm() {
        return currentChapter == currentPsalm;
    }

    public static void markChapterEnd() {
        inChapter = false;
        inRealChapter = false;
        currentChapter = -1;
    }

    public static boolean isInChapter() {
        return inChapter;
    }

    public static boolean isInRealChapter() {
        return inRealChapter;
    }

    public static void pushAcrosticTitle(final String title, final String letter) {
        acrosticTitle = title;
        acrosticLetter = letter;
    }

    public static String pullAcrosticTitle() {
        try {
            if (acrosticTitle != null) {
                return acrosticTitle;
            }
        } finally {
            acrosticTitle = null;
        }
        return "";
    }

    public static String pullAcrosticTitleLetter() {
        try {
            if (acrosticLetter != null) {
                return acrosticLetter;
            }
        } finally {
            acrosticLetter = null;
        }
        return null;
    }

    public static String langRefToRef(String v11n, String langRef) {
        try {
            final Passage key = PassageKeyFactory.instance().getKey(Versifications.instance().getVersification(v11n), langRef);
            return key.getOsisRef();
        } catch (NoSuchKeyException e) {
//            e.printStackTrace(); silently ignore, because there can be all sorts of things in there...
            return "##error##";
        }
    }

    public static void pushTitle(Object o) throws ParserConfigurationException, TransformerException {
        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
        Document doc = docBuilder.newDocument();
        doc.appendChild(((Node) o).cloneNode(true));

        StringWriter sw = new StringWriter();
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.transform(new DOMSource(doc), new StreamResult(sw));
        title.add(sw.toString());
    }

    public static String pullTitle() throws ParserConfigurationException {
        if (title.size() == 0) {
            return "";
        }

        return (String) title.poll();
    }

}
