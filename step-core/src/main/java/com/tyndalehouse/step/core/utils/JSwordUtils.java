package com.tyndalehouse.step.core.utils;

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import org.crosswire.common.util.Language;
import org.crosswire.common.util.Languages;
import org.crosswire.jsword.book.*;
import org.crosswire.jsword.book.basic.AbstractPassageBook;
import org.crosswire.jsword.book.sword.SwordBook;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.BibleNames;
import org.crosswire.jsword.versification.Versification;
import org.jdom2.Element;
import org.jdom2.filter.ElementFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

import static java.util.Collections.sort;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ELEMENT_VERSE;

/**
 * a set of utility methods to manipulate the JSword objects coming out
 */
public final class JSwordUtils {
    private static final String BOOK_CHAPTER_OSIS_FORMAT = "%s.%d";
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordUtils.class);
    private static final String ANCIENT_GREEK = "grc";
    private static final String ANCIENT_HEBREW = "he";
    private static final String ANCIENT_HEBREW_HBO = "hbo";
    private static final HashSet<String> allNT = new HashSet<String>(Arrays.asList(
            "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal",
            "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm",
            "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"));
    private static final HashSet<String> allOT = new HashSet<String>(Arrays.asList(
            "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam",
            "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job",
            "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan",
            "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph",
            "Hag", "Zech", "Mal"));
    private static final HashSet<String> allOTNT = new HashSet<String>(Arrays.asList(
            "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam",
            "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job",
            "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan",
            "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph",
            "Hag", "Zech", "Mal",
            "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal",
            "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm",
            "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"));
    public static HashMap<String, String> typeOfCommonBooks = new HashMap<String, String>();

    /**
     * hiding implementaiton
     */
    private JSwordUtils() {
        // no implementation
    }

    public static String getDefaultBibleForLanguage(String lang) {
        String userLanguage = lang.toLowerCase();
        if ((userLanguage.equals("zh_tw")) || (userLanguage.equals("zh_hk"))) return "CUn";
        if (userLanguage.startsWith("zh")) return "CUns";
        if (userLanguage.startsWith("es")) return "SpaRV1909";
        if (userLanguage.startsWith("bg")) return "BulProtRev";
        if (userLanguage.startsWith("hi")) return "HinULB";
        if (userLanguage.startsWith("ar")) return "AraSVD";
        if (userLanguage.startsWith("cs")) return "CzeCSP";
        if (userLanguage.startsWith("cy")) return "CYM";
        if (userLanguage.startsWith("da")) return "DanBPH";
        if (userLanguage.startsWith("de")) return "GerTafel";
        if (userLanguage.startsWith("el")) return "UMGreek";
        if (userLanguage.startsWith("et")) return "Est";
        if (userLanguage.startsWith("fa")) return "FCB";
        if (userLanguage.startsWith("fil")) return "TglASD";
        if (userLanguage.startsWith("fi")) return "FinPR";
        if (userLanguage.startsWith("fr")) return "FreLSG";
        if (userLanguage.startsWith("ga")) return "IriODomhnuill";
        if (userLanguage.startsWith("hr")) return "HrvKOK";
        if (userLanguage.startsWith("hu")) return "HunKAR";
        if (userLanguage.startsWith("id")) return "IndFAYH";
        if (userLanguage.startsWith("is")) return "Icelandic";
        if (userLanguage.startsWith("it")) return "ItaRive";
        if (userLanguage.startsWith("ja")) return "JpnJCB";
        if (userLanguage.startsWith("ko")) return "KorKLB";
        if (userLanguage.startsWith("lv")) return "Latvian";
        if (userLanguage.startsWith("ml")) return "MalMCV";
        if (userLanguage.startsWith("nl")) return "NldHTB";
        if (userLanguage.startsWith("pl")) return "PolPSZ";
        if (userLanguage.startsWith("pt")) return "PorNVI";
        if (userLanguage.startsWith("ro")) return "RonNTR";
        if (userLanguage.startsWith("ru")) return "RusCARSA";
        if (userLanguage.startsWith("sl")) return "SlvZNZ";
        if (userLanguage.startsWith("sq")) return "Alb";
        if (userLanguage.startsWith("sv")) return "SweKarlXII1873";
        if (userLanguage.startsWith("sw")) return "Neno";
        if (userLanguage.startsWith("th")) return "ThaTNCV";
        if (userLanguage.startsWith("uk")) return "Ukrainian";
        if (userLanguage.startsWith("ur")) return "UrdULB";
        if (userLanguage.startsWith("vi")) return "VieKTHD";
        return "";
    }

    /**
     * returns a sorted list from another list, with only the required information
     * 
     * @param bibles a list of jsword bibles
     * @param userLocale the local for the user
     * @param resolver resolves the version to the longer name known by JSword
     * @return the list of bibles
     */
    public static List<BibleVersion> getSortedSerialisableList(final Collection<Book> bibles,
            final Locale userLocale, final VersionResolver resolver, final JSwordVersificationService versificationService) {
//        final List<BibleVersion> versions = new ArrayList<BibleVersion>();
        final Map<String, BibleVersion> versions = new HashMap<>();

        // we only send back what we need
        for (final Book b : bibles) {
            final BibleVersion v = new BibleVersion();
            final String shortName = (String) b.getProperty("shortName");
            // SM Add versification =======>>>
            final String v11n = (String) b.getBookMetaData().getProperty(BookMetaData.KEY_VERSIFICATION);
            v.setVersification(v11n);
            // SM <<<======
            v.setName(shortName != null ? shortName : b.getName());
            v.setInitials(b.getInitials());
            v.setShortInitials(resolver.getShortName(b.getInitials()));
            v.setQuestionable(b.isQuestionable());
            v.setCategory(b.getBookCategory().name());
            final Language language = b.getLanguage();
            if (language != null) {
                v.setLanguageCode(language.getCode());

                final Locale versionLanguage = new Locale(language.getCode());

                if (versionLanguage != null) {
                    final String displayLanguage = versionLanguage.getDisplayLanguage(userLocale);
                    if(language.getCode() != null && language.getCode().equals(displayLanguage)) {
                        v.setLanguageName(Languages.AllLanguages.getName(displayLanguage));   
                    } else {
                        v.setLanguageName(displayLanguage);
                    }
                }
                //also get the original language name
                v.setOriginalLanguage(versionLanguage.getDisplayLanguage(versionLanguage));
            }


            if (v.getLanguageCode() == null || v.getLanguageName() == null) {
                v.setLanguageCode(userLocale.getLanguage());
                v.setLanguageName(userLocale.getDisplayLanguage(userLocale));
            }

            v.setHasStrongs(b.hasFeature(FeatureType.STRONGS_NUMBERS));
            v.setHasMorphology(b.hasFeature(FeatureType.MORPHOLOGY));
            v.setHasRedLetter(b.hasFeature(FeatureType.WORDS_OF_CHRIST));
            v.setHasHeadings(b.hasFeature(FeatureType.HEADINGS));
            v.setHasNotes(b.hasFeature(FeatureType.FOOTNOTES) || b.hasFeature(FeatureType.SCRIPTURE_REFERENCES));
            v.setHasSeptuagintTagging(resolver.isSeptuagintTagging(b));
            v.setHasCommonBooks(hasCommonBibleBooks(b, versificationService));
            //now only put the version in if
            // a- it is not in the map already
            // b- it is in the map, but the initials of the one being put in are different, meaning STEP
            // has a better version that is overwriting the existing version
            if(!versions.containsKey(v.getShortInitials()) || !v.getShortInitials().equalsIgnoreCase(v.getInitials())) {
                versions.put(v.getShortInitials(), v);
            }
        }

        // finally sort by initials
        final List<BibleVersion> values = new ArrayList<>(versions.values());
        sort(values, new Comparator<BibleVersion>() {
            @Override
            public int compare(final BibleVersion o1, final BibleVersion o2) {
                String lang1 = org.apache.commons.lang3.StringUtils.stripAccents(o1.getLanguageName().toLowerCase());
                String lang2 = org.apache.commons.lang3.StringUtils.stripAccents(o2.getLanguageName().toLowerCase());
                if (lang1.startsWith("'")) lang1 = lang1.substring(1);
                if (lang2.startsWith("'")) lang2 = lang2.substring(1);
                int result = lang1.compareTo(lang2);
                if (result == 0) return o1.getShortInitials().compareTo(o2.getShortInitials());
                else if (lang1.equals("english")) return -1; // This will put English at the beginning of the list.
                else if (lang2.equals("english")) return 1; // This will put English at the beginning of the list.
                return result;
            }
        });

        return values;
    }

    private static char verifyRegularBooksAreInBible(final Set bibleBooksInThisVersion, final HashSet allBooksInBible,
                                                     final String currentBibleName, final char returnValue) {
        boolean allCommonBooksInBible = true;
        Iterator<BibleBook> itr = ((Set) bibleBooksInThisVersion).iterator();
        while (itr.hasNext()) {
            String name = itr.next().getOSIS();
            if (!allBooksInBible.contains(name))) {
                allCommonBooksInBible = false;
                break;
            }
        }
        if (allCommonBooksInBible) {
            typeOfCommonBooks.put(currentBibleName, String.valueOf(returnValue));
            return returnValue;
        }
        typeOfCommonBooks.put(currentBibleName, " ");
        return ' ';
    }

    private static char hasCommonBibleBooks (final Book b, final JSwordVersificationService versificationService) {
        String currentBibleName = b.getInitials();
        String bibleType = typeOfCommonBooks.get(currentBibleName);
        if ((bibleType != null) && (bibleType.equals("B") || bibleType.equals("N") || bibleType.equals("O") || bibleType.equals(" ")))
            return bibleType.charAt(0);
        int numOfBooksInThisBible = 0;
        Set<BibleBook> bibleBooksInThisVersion = null;
        try {
            bibleBooksInThisVersion = ((SwordBook) b).getBibleBooks();
            numOfBooksInThisBible = ((LinkedHashSet<BibleBook>) bibleBooksInThisVersion).size();
            if ((numOfBooksInThisBible != 27) && (numOfBooksInThisBible != 39) && (numOfBooksInThisBible != 66)) {
                final Versification masterV11n = versificationService.getVersificationForVersion(currentBibleName);
                final Iterator<BibleBook> bookIterator = masterV11n.getBookIterator();
                final Book bookForThisVersion = versificationService.getBookFromVersion(currentBibleName);
                final Key keysOfThisVersion = bookForThisVersion.getGlobalKeyList();
                bibleBooksInThisVersion = new LinkedHashSet<BibleBook>();
                while (bookIterator.hasNext()) {
                    final BibleBook book = bookIterator.next();
                    final Key keyToBook = bookForThisVersion.getValidKey(book.getOSIS());
                    keyToBook.retainAll(keysOfThisVersion);
                    if (keyToBook.getCardinality() != 0) {
                        if (!book.getOSIS().startsWith("Intro"))
                            bibleBooksInThisVersion.add(book);
                    }
                }
                numOfBooksInThisBible = ((LinkedHashSet<BibleBook>) bibleBooksInThisVersion).size();
            }
        }
        catch (Exception ex) {
            LOGGER.error(ex.getMessage(), ex);
            System.out.println("Bible: " + currentBibleName + "has an exception: ");
            typeOfCommonBooks.put(currentBibleName, " ");
            return ' ';
        }
        if (numOfBooksInThisBible == 66)
            return verifyRegularBooksAreInBible(bibleBooksInThisVersion, allOTNT, currentBibleName, 'B');
        else if (numOfBooksInThisBible == 27)
            return verifyRegularBooksAreInBible(bibleBooksInThisVersion, allNT, currentBibleName, 'N');
        else if (numOfBooksInThisBible == 39)
            return verifyRegularBooksAreInBible(bibleBooksInThisVersion, allOT, currentBibleName, 'O');
        typeOfCommonBooks.put(currentBibleName, " ");
        return ' ';
    }

    /**
     * Returns true if the bible book is the Introduction to the Bible, to the New Testament or to the Old
     * Testament
     * 
     * @param bb the bb
     * @return true, if is intro
     */
    public static boolean isIntro(final BibleBook bb) {
        return BibleBook.INTRO_BIBLE.equals(bb) || BibleBook.INTRO_NT.equals(bb)
                || BibleBook.INTRO_OT.equals(bb);
    }

    /**
     * Ascertains if it is an ancient book, i.e. Greek or Hebrew
     * @param book the book we are considering
     * @return true to indicate Greek or Hebrew
     */
    public static boolean isAncientBook(Book book) {
        return isAncientHebrewBook(book) || isAncientGreekBook(book);
    }
    
    /**
      * Ascertains whether the book(s) is Hebrew. If several books, then returns true if any book matches
     * @param books the book we are considering
     * @return true if Hebrew book
     */
    public static boolean isAncientHebrewBook(Book... books) {
        boolean ancientHebrew = false;
        for(Book b : books) {
            //hard coding in the exception
            boolean isHebrew = ( ANCIENT_HEBREW.equals(b.getLanguage().getCode()) || ANCIENT_HEBREW_HBO.equals(b.getLanguage().getCode()) ) && !"HebModern".equals(b.getInitials());
            if(isHebrew) {
                return true;
            }
        }
        return ancientHebrew;
    }

    /**
     * Ascertains whether the book is Greek, returning true if any books match the said criteria
     * @param books the book we are considering
     * @return true if Hebrew book
     */
    public static  boolean isAncientGreekBook(Book... books) {
        boolean ancientGreek = false;
        for(Book b : books) {
            boolean isGreek = ANCIENT_GREEK.equals(b.getLanguage().getCode());
            if(isGreek) {
                return true;
            }
        }
        return ancientGreek;
    }

    /**
     * Gets the osis elements.
     *
     * @return the osis elements
     * @throws org.crosswire.jsword.passage.NoSuchKeyException the no such key exception
     * @throws org.crosswire.jsword.book.BookException      the book exception
     */
    @SuppressWarnings({"unchecked", "serial"})
    public static List<Element> getOsisElements(BookData data) throws NoSuchKeyException, BookException {
        return data.getOsisFragment().getContent(
                new ElementFilter(OSIS_ELEMENT_VERSE));
    }

    /**
     * Helper method that wraps around getValidKey which catches all exceptions
     * @param v11n the versification
     * @param reference the reference
     * @return the key, or an empty key
     */
    public static Key getSafeKey(final Versification v11n, final String reference) {
        final PassageKeyFactory factory = PassageKeyFactory.instance();
        try {
            return factory.getValidKey(v11n, reference);
        } catch(Exception ex) {
            //catching and logging exception here as intended to be called from XSLT
            LOGGER.error(ex.getMessage(), ex);
            return factory.createEmptyKeyList(v11n);
        }
    }

    public static String getBookNameForLang(String bk, String lang1, String lang2){
        //if(lang.equals("ar")) {

        String bookName = bk;
        String lang = lang1;
        if(lang.isEmpty())
            lang = lang2;
        if(!lang.isEmpty())
            bookName = BibleNames.instance().getShortBibleNameForLocale(new Locale(lang), bk);

        return bookName;
        //}
        //else
        //    return bk;
    }

    /**
     * Checks for the presence of the book first. If the book is present, then continues to check that at least 1 verse
     * in the scope is present. If it is, then returns true immediately.
     * <p/>
     * If it isn't, the continues through all the keys in the key( this could be a lot, but the assumption is that if the book
     * exists, then it's unlikely to have just the last chapter?
     *
     * @param master the master book
     * @param k      the key to be tested
     * @return true if the key is present in the master book
     */
    public static boolean containsAny(Book master, Key k) {
        if(k.isEmpty()) {
            return false;
        }

        if(!(master instanceof AbstractPassageBook)) {
            return master.contains(k);
        }

        final Set<BibleBook> books = ((AbstractPassageBook) master).getBibleBooks();
        try {
            final Verse firstVerse = KeyUtil.getVerse(k);
            if (!books.contains(firstVerse.getBook())) {
                //the books of the module do not contain the book referred to by the verse
                return false;
            }

            //we're still here, so the books do exist
            //so let's now examine the keys one by one
            Iterator<Key> keys = k.iterator();
            while (keys.hasNext()) {
                if (master.contains(keys.next())) {
                    return true;
                }
            }
        } catch(ArrayIndexOutOfBoundsException a) {
            return false;
        }
        return false;
    }

    /**
     * Gets the chapter OSIS in the form of Gen.1, except for short books, where it is the single chapter
     * @param bibleBook
     * @param chapterNumber
     * @return
     */
    public static String getChapterOsis(final BibleBook bibleBook, final int chapterNumber) {
        return bibleBook.isShortBook() ? bibleBook.getOSIS() : String.format(BOOK_CHAPTER_OSIS_FORMAT, bibleBook.getOSIS(), chapterNumber);
    }
}
