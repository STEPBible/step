package com.tyndalehouse.step.core.service.jsword.helpers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.search.BookAndBibleCount;
import com.tyndalehouse.step.core.models.search.StrongCountsAndSubjects;
import com.tyndalehouse.step.core.models.stats.PassageStat;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.JSwordUtils;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.Term;
import org.apache.lucene.index.TermDocs;
import org.apache.lucene.search.IndexSearcher;
import org.crosswire.jsword.book.*;
import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.DivisionName;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.VersificationsMapper;
import org.jdom2.Element;
import org.slf4j.Logger;

import java.io.IOException;
import java.util.*;
import java.util.Map.Entry;

import static com.tyndalehouse.step.core.service.TranslationTipsService.regularFormatedFN;
import static com.tyndalehouse.step.core.service.TranslationTipsService.alternativeFormatedFN;
import static com.tyndalehouse.step.core.service.TranslationTipsService.customFN;
/**
 * Provides each strong number given a verse.
 * <p/>
 * <p/>
 * <p/>
 * Note, this object is not thread-safe. The intention is for it to be a use-once, throw-away type of object.
 */
public class JSwordStrongNumberHelper {
    private static final Logger LOG = org.slf4j.LoggerFactory.getLogger(JSwordStrongNumberHelper.class);
    private static final Book STRONG_NT_VERSION_BOOK = Books.installed().getBook(JSwordPassageService.REFERENCE_BOOK);
    private static final Book STRONG_OT_VERSION_BOOK = Books.installed().getBook(JSwordPassageService.OT_BOOK);
    private static volatile Versification ntV11n;
    private static volatile Versification otV11n;
    private final JSwordVersificationService versification;
    private final JSwordSearchService jSwordSearchService;
    private final EntityIndexReader definitions;
    private final Verse reference;
    private Map<String, List<LexiconSuggestion>> verseStrongs;
    private Map<String, BookAndBibleCount> allStrongs;
    private boolean isOT;
    private String allMorph;
    private String translationTipsFN;

    /**
     * Instantiates a new strong number provider impl.
     * @param manager                   the manager that helps look up references
     * @param reference                 the reference in the KJV versification equivalent
     * @param versification             the versification service to lookup the versification of the reference book
     * @param jSwordSearchService       the jSword Search service
     */
    public JSwordStrongNumberHelper(final EntityManager manager, final Verse reference,
                                    final JSwordVersificationService versification,
                                    final JSwordSearchService jSwordSearchService) {
        this.versification = versification;
        this.jSwordSearchService = jSwordSearchService;
        this.definitions = manager.getReader("definition");
        this.reference = reference;
        initReferenceVersification();
    }

    /**
     * @param isOT true to indicate OT
     * @return the book that shoudd be read for obtaining strong number counts
     */
    public static Book getPreferredCountBook(boolean isOT) {
        return isOT ? STRONG_OT_VERSION_BOOK : STRONG_NT_VERSION_BOOK;
    }

    /**
     * Inits the reference versification system so that we don't ever need to do this again
     */
    private void initReferenceVersification() {
        if (ntV11n == null) {
            synchronized (JSwordStrongNumberHelper.class) {
                if (ntV11n == null) {
                    ntV11n = this.versification.getVersificationForVersion(STRONG_NT_VERSION_BOOK);
                    otV11n = this.versification.getVersificationForVersion(STRONG_OT_VERSION_BOOK);
                }
            }
        }
    }

    /**
     * Calculate counts for a particular key.
     */
    private void calculateCounts(String userLanguage) {
        try {
            Verse curReference = this.reference;
            Verse verseInNRSV = curReference;
            final BibleBook book = curReference.getBook();
            this.isOT = DivisionName.OLD_TESTAMENT.contains(book);
			final Versification targetVersification;
			if (isOT) { //is key OT or NT
				targetVersification = otV11n;
                if (!curReference.getVersification().getName().equals("NRSV")) {
                    verseInNRSV = new Verse(ntV11n, book, curReference.getChapter(), curReference.getVerse());
                    if (curReference.getVersification().getName().equals("MT")) // OHB and MT have the same chapters and numbers.  Converting has inconsistency in Neh.7.68, Ps.13.5, Isa 63.19
                        curReference = new Verse(targetVersification, book, curReference.getChapter(), curReference.getVerse());
                }
            }
			else targetVersification = ntV11n;
            int curOrdinal = verseInNRSV.getOrdinal();
            if (regularFormatedFN.store.get(curOrdinal))
                this.translationTipsFN = verseInNRSV.getBook().toString().toLowerCase() + "-" + verseInNRSV.getChapter() + verseInNRSV.getVerse();
            else if (alternativeFormatedFN.store.get(curOrdinal))
                this.translationTipsFN = verseInNRSV.getBook().toString().toLowerCase() + "-" + verseInNRSV.getChapter() + "-" + verseInNRSV.getVerse();
            else if (customFN.containsKey(curOrdinal))
                this.translationTipsFN = customFN.get(curOrdinal);
            else
                this.translationTipsFN = ""; // If there are no tips, it will be an empty string
            final Key key = VersificationsMapper.instance().mapVerse(curReference, targetVersification);
            this.verseStrongs = new TreeMap<>();
            this.allStrongs = new HashMap<>(256);

            final Book preferredCountBook = getPreferredCountBook(this.isOT);
            final List<Element> elements = JSwordUtils.getOsisElements(new BookData(preferredCountBook, key));
            Set<String> strongAlreadyIncluded = new HashSet<String>();
            for (final Element e : elements) {
                if (elements.size() == 1) // If it is from verseVocabuary, it will only has one morphology
                    allMorph = OSISUtil.getMorphologiesWithStrong(e);
                final String verseRef = e.getAttributeValue(OSISUtil.OSIS_ATTR_OSISID);
                final String strongsNumbers = OSISUtil.getStrongsNumbers(e);
                if (StringUtils.isBlank(strongsNumbers)) {
                    LOG.warn("Attempting to search for 'no strongs' in verse [{}]", verseRef);
                    return;
                }
                ArrayList<String> uniqueStrong = new ArrayList<String>();
                StringTokenizer st = new StringTokenizer(StringConversionUtils.getStrongPaddedKey(strongsNumbers));
                while (st.hasMoreTokens()) { // This loop removes duplicate Strong numbers
                    String currentStrong = st.nextToken();
                    if (!strongAlreadyIncluded.contains(currentStrong)) {
                        strongAlreadyIncluded.add(currentStrong);
                        uniqueStrong.add(currentStrong);
                    }
                }
                readDataFromLexicon(this.definitions, verseRef, String.join(" ", uniqueStrong), userLanguage);
            }
            // now get counts in the relevant portion of text
            applySearchCounts(getBookFromKey(key));
        } catch (final NoSuchKeyException ex) {
            LOG.warn("Unable to enhance verse numbers.", ex);
        } catch (final BookException ex) {
            LOG.warn("Unable to enhance verse number", ex);
        }
    }

    /**
     * Calculate counts for an array of Strong number.
     */
    public PassageStat calculateStrongArrayCounts(final String version, PassageStat stat, final String userLanguage) {
        Map<String, Integer[]> result = new HashMap<>(128);
		Verse curReference = this.reference;
		final BibleBook book = curReference.getBook();
		this.isOT = DivisionName.OLD_TESTAMENT.contains(book);
        final Versification targetVersification;
		if (isOT) { //is key OT or NT
			targetVersification = otV11n;
			if (curReference.getVersification().getName().equals("MT")) // OHB and MT have the same chapters and numbers.  Converting has inconsistency in Neh.7.68, Ps.13.5, Isa 63.19
				curReference = new Verse(targetVersification, book, curReference.getChapter(), curReference.getVerse());
		}
		else targetVersification = ntV11n;
        final Key key = VersificationsMapper.instance().mapVerse(curReference, targetVersification);
        this.allStrongs = new HashMap<>(256);
        Map<String, Integer[]> temp = stat.getStats();
        temp.forEach((strongNum, feq) -> this.allStrongs.put(strongNum, new BookAndBibleCount()));
        // now get counts in the relevant portion of text
        applySearchCounts(getBookFromKey(key));
        temp.forEach((strongNum, freq) -> {
            BookAndBibleCount bBCount = this.allStrongs.get(strongNum);
            result.put(strongNum, new Integer[]{freq[0], bBCount.getBook(), bBCount.getBible()});
        });
        stat.setStats(result);
        return stat;
    }

    /**
     * The book of the OSIS ID reference, or the passed in parameter in every other case where the OSIS ID does not
     * contain multiple part.
     *
     * @param key the key, used to lookup the OSIS ID
     * @return the book from osis
     */
    private String getBookFromKey(final Key key) {
        final String osisID = key.getOsisID();
        final int firstPartStart = osisID.indexOf('.');
        if (firstPartStart == -1) {
            // then looking at a whole book, so just return
            return osisID;
        }
        return osisID.substring(0, firstPartStart);
    }

    public static class detailLexClass { // used by ObjectMapper to convert JSON in string to object
        public String[][] detailLexs;
    }
    /**
     * Applies the search counts for every strong number.
     *
     * @param bookName the book name
     */
    private void applySearchCounts(final String bookName) {

        try {
            ObjectMapper mapper = new ObjectMapper();
            final IndexSearcher is = jSwordSearchService.getIndexSearcher(
                    this.isOT ? STRONG_OT_VERSION_BOOK.getInitials() : STRONG_NT_VERSION_BOOK.getInitials());
            final TermDocs termDocs = is.getIndexReader().termDocs();
            ArrayList lexiconSuggestions = null;
            if (this.verseStrongs != null)
                lexiconSuggestions = (ArrayList) this.verseStrongs.get(this.reference.getOsisID());
            final int sizeOfLexiconSuggestion = (lexiconSuggestions == null) ? 0 : lexiconSuggestions.size();
            for (final Entry<String, BookAndBibleCount> strong : this.allStrongs.entrySet()) {
                final String strongKey = strong.getKey();
                int[] result = getCountsForStrong(termDocs, strongKey, bookName, is);
                int book = result[0];
                int bible = result[1];
                String otherStrong = "";
                for (int i = 0; i < sizeOfLexiconSuggestion; i++) {
                    LexiconSuggestion curSuggestion = (LexiconSuggestion) lexiconSuggestions.get(i);
                    if (strongKey.equals(curSuggestion.getStrongNumber())) {
                        String curDetailLexiconTag = curSuggestion.get_detailLexicalTag();
                        if ((curDetailLexiconTag != null) && (!curDetailLexiconTag.equals("")))  {
                            detailLexClass detailLexicalTag = mapper.readValue("{\"detailLexs\":" + curDetailLexiconTag + "}", detailLexClass.class);
                            for (int j = 0; j < detailLexicalTag.detailLexs.length; j++) {
                                if (strongKey.equals(detailLexicalTag.detailLexs[j][1])) // already process about 11 lines above
                                    continue;
                                int[] result2 = getCountsForStrong(termDocs, detailLexicalTag.detailLexs[j][1], bookName, is);
                                book += result2[0]; // Add to count in book
                                bible += result2[1]; // Add to count in entire Bible
                                if (!otherStrong.equals("")) otherStrong += " ";
                                otherStrong += detailLexicalTag.detailLexs[j][1]; // append another Strong
                            }
                            curSuggestion.setDetailLexicalTag(otherStrong);
                        }
                        else
                            curSuggestion.setDetailLexicalTag("");
                    }
                }
                final BookAndBibleCount value = strong.getValue();
                value.setBible(bible);
                value.setBook(book);
            }
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    private int[] getCountsForStrong(TermDocs termDocs, final String strongKey, final String bookName, final IndexSearcher is) {
        int[] result = {0, 0}; // count in book and Bible
        try {
            termDocs.seek(new Term(LuceneIndex.FIELD_STRONG, strongKey));
            // we'll never need more than 200 documents as this is the cut off point
            while (termDocs.next()) {
                int freq = termDocs.freq();
                final Document doc = is.doc(termDocs.doc());
                final String docRef = doc.get(LuceneIndex.FIELD_KEY);
                if (freq % 2 == 0) {
                    char lastChar = strongKey.charAt(strongKey.length() - 1);
                    if (lastChar >= 'A')
                        freq = freq / 2;
                } else {
                    char lastChar = strongKey.charAt(strongKey.length() - 1);
                    if (lastChar >= 'A')
                        System.out.println("Odd number of occurrences for " + strongKey + " in: " + docRef);
                }
                if (docRef != null && docRef.startsWith(bookName))
                    result[0] += freq;
                result[1] += freq;
            }
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
        return result;
    }

    /**
     * Read data from lexicon.
     *
     * @param reader        the reader
     * @param verseRef      the verse ref
     * @param augmentedStrongNumbers the strong numbers
     */
    private void readDataFromLexicon(final EntityIndexReader reader,
                                     final String verseRef,
                                     final String augmentedStrongNumbers,
                                     final String userLanguage) {

        final EntityDoc[] docs = reader.search("strongNumber", augmentedStrongNumbers);
        final List<LexiconSuggestion> verseSuggestions = new ArrayList<>();

        Map<String, LexiconSuggestion> suggestionsFromSearch = new HashMap<>(docs.length * 2);
        for (final EntityDoc d : docs) {
            final LexiconSuggestion ls = new LexiconSuggestion();
            ls.setStrongNumber(d.get("strongNumber"));
            ls.setGloss(d.get("stepGloss"));
            if (userLanguage.equalsIgnoreCase("es")) {
                ls.set_es_Gloss(d.get("es_Gloss"));
            }
            else if (userLanguage.equalsIgnoreCase("zh")) {
                ls.set_zh_Gloss(d.get("zh_Gloss"));
            }
            else if (userLanguage.equalsIgnoreCase("zh_tw")) {
                ls.set_zh_tw_Gloss(d.get("zh_tw_Gloss"));
            }
			else if (userLanguage.equalsIgnoreCase("km")) {
                ls.set_es_Gloss(d.get("km_Gloss"));
            }
            ls.setDetailLexicalTag(d.get("STEP_DetailLexicalTag"));
            ls.setMatchingForm(d.get("accentedUnicode"));
            ls.setStepTransliteration(d.get("stepTransliteration"));
            suggestionsFromSearch.put(ls.getStrongNumber(), ls);

            this.allStrongs.put(ls.getStrongNumber(), new BookAndBibleCount());
        }

        String[] strongs = StringUtils.split(augmentedStrongNumbers);
        for (String s : strongs) {
            verseSuggestions.add(suggestionsFromSearch.get(s));
        }
        this.verseStrongs.put(verseRef, verseSuggestions);
    }

    /**
     * @return the verseStrongs
     */
    public StrongCountsAndSubjects getVerseStrongs(String userLanguage) {
        calculateCounts(userLanguage);
        final StrongCountsAndSubjects sac = new StrongCountsAndSubjects();
        sac.setCounts(this.allStrongs);
        sac.setStrongData(this.verseStrongs);
        sac.setOT(this.isOT);
        sac.setAllMorphsInVerse(this.allMorph);
        sac.setTranslationTipsFN(this.translationTipsFN);
        return sac;
    }
}
