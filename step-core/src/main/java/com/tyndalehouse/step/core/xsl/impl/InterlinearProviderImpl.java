package com.tyndalehouse.step.core.xsl.impl;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.getAnyKey;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.getStrongKey;
import static java.lang.String.format;
import static org.apache.commons.collections.CollectionUtils.isNotEmpty;
import static org.apache.commons.lang.StringUtils.isBlank;
import static org.apache.commons.lang.StringUtils.isNotBlank;
import static org.apache.commons.lang.StringUtils.split;
import static org.crosswire.jsword.book.OSISUtil.ATTRIBUTE_W_LEMMA;
import static org.crosswire.jsword.book.OSISUtil.ATTRIBUTE_W_MORPH;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ATTR_OSISID;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ELEMENT_VERSE;
import static org.crosswire.jsword.book.OSISUtil.OSIS_ELEMENT_W;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.jdom.Content;
import org.jdom.Element;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.xsl.InterlinearProvider;

/**
 * This object is not purposed to be used as a singleton. It builds up textual information on initialisation,
 * and is specific to requests. On initialisation, the OSIS XML is retrieved and iterated through to find all
 * strong/morph candidates
 * 
 * @author Chris
 * 
 */
public class InterlinearProviderImpl implements InterlinearProvider {

    /**
     * bestAccuracy gives a word by its dual key (strong,morph)
     */
    private final Map<DualKey<String, String>, String> bestAccuracy = new HashMap<DualKey<String, String>, String>();

    /**
     * limited accuracy tries to do a location look up by using the verse number as part of the key
     */
    private final Map<DualKey<String, String>, List<String>> limitedAccuracy = new HashMap<DualKey<String, String>, List<String>>();

    /**
     * finally, this is just a list of all the strongs and their mappings. Still would be fairly good as long
     * as the same word isn't used multiple times.
     */
    private final Map<String, String> worstAccuracy = new HashMap<String, String>();

    /**
     * sets up the interlinear provider with the correct version and text scope.
     * 
     * @param version the version to use to set up the interlinear
     * @param textScope the text scope reference, defining the bounds of the lookup
     */
    public InterlinearProviderImpl(final String version, final String textScope) {
        // first check whether the values passed in are correct
        if (isBlank(version) || isBlank(textScope)) {
            return;
        }

        final Book currentBook = Books.installed().getBook(version);
        if (currentBook == null) {
            throw new StepInternalException(format("Couldn't look up book: [%s]", version));
        }

        BookData bookData;

        try {
            bookData = new BookData(currentBook, currentBook.getKey(textScope));
            scanForTextualInformation(bookData.getOsisFragment());
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final BookException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * package private version for testing purposes
     */
    InterlinearProviderImpl() {
        // exposing package private constructor
    }

    @Override
    public String getWord(final String verseNumber, final String strong, final String morph) {
        // we use a linked hashset, because we want the behaviour of a set while we add to it,
        // but at the end, we will want to return the elements in order
        final Set<String> results = new LinkedHashSet<String>();
        if (isBlank(strong)) {
            // we might as well return, as we have no information to go on
            return "";
        }

        // the keys passed in may have multiple references and morphologies, therefore, we need to lookup
        // multiple items.
        final String[] strongs = split(strong);
        final String[] morphs = morph == null ? new String[0] : split(morph);

        // There are at most strongs.length words, and we might have morphological data to help
        for (final String s : strongs) {
            boolean foundMatchForStrong = false;
            final String strongKey = getAnyKey(s);

            // each could be using the morphs we have, so try them all - this gets skipped if we have no
            // morphs
            for (final String m : morphs) {
                // lookup (strong,morph) -> word first
                final DualKey<String, String> key = new DualKey<String, String>(getStrongKey(strongKey), m);
                final String word = this.bestAccuracy.get(key);

                if (word != null) {
                    results.add(word);
                    foundMatchForStrong = true;
                }
            }

            // have we found a match? if not, we better try and find one using the verse
            if (!foundMatchForStrong) {
                results.add(getWord(verseNumber, strongKey));
            }
        }

        return convertToString(results);
    }

    /**
     * Takes a set, and outputs the strings concatenated together (and separated by a space.
     * 
     * @param results the results that should be converted to a string
     * @return a String containing results to be displayed
     */
    private String convertToString(final Set<String> results) {
        final Iterator<String> iterator = results.iterator();
        final StringBuffer sb = new StringBuffer(results.size() * 14);

        // add the first word without a space
        if (iterator.hasNext()) {
            sb.append(iterator.next());
        }

        // add spaces between each element now
        while (iterator.hasNext()) {
            sb.append(' ');
            sb.append(iterator.next());
        }
        return sb.toString();
    }

    /**
     * returns words based on strong and verse number only
     * 
     * @param verseNumber the verse number
     * @param strong the strong reference
     * @return a word that matches or the empty string
     */
    String getWord(final String verseNumber, final String strong) {
        if (strong != null && verseNumber != null) {
            final DualKey<String, String> key = new DualKey<String, String>(strong, verseNumber);

            final List<String> list = this.limitedAccuracy.get(key);
            if (isNotEmpty(list)) {
                return list.get(0);
            }
        }
        // so we didn't find anything even with the verse number, now we need to look for a strong
        // on its own
        final String lastChance = this.worstAccuracy.get(strong);
        if (lastChance == null) {
            return "";
        }

        // it is important to return an empty string here
        return lastChance;
    }

    /**
     * retrieves context textual information from a passage
     * 
     * @param osisFragment the fragment of XML that should be examined
     */
    private void scanForTextualInformation(final Element osisFragment) {
        // redirect with null verse
        scanForTextualInformation(osisFragment, null);
    }

    /**
     * setups all the initial textual information for fast retrieval during XSL transformation.
     * 
     * @param element element to start with.
     * @param currentVerse the current verse to use as part of the key
     */
    @SuppressWarnings("unchecked")
    private void scanForTextualInformation(final Element element, final String currentVerse) {
        // check to see if we've hit a new verse, if so, we update the verse
        final String verseToBeUsed = element.getName().equals(OSIS_ELEMENT_VERSE) ? element
                .getAttributeValue(OSIS_ATTR_OSISID) : currentVerse;

        // check to see if we've hit a node of interest
        if (element.getName().equals(OSIS_ELEMENT_W)) {
            extractTextualInfoFromNode(element, verseToBeUsed);
            return;
        }

        // iterate through all children and call recursively
        Object data = null;
        Element ele = null;
        final Iterator<Content> contentIter = element.getContent().iterator();
        while (contentIter.hasNext()) {
            data = contentIter.next();
            if (data instanceof Element) {
                ele = (Element) data;
                scanForTextualInformation(ele, verseToBeUsed);
            }
        }
    }

    /**
     * retrieves textual information and adds it to the provider
     * 
     * @param element the element to extract information from
     * @param verseReference verse reference to use for locality of keying
     */
    private void extractTextualInfoFromNode(final Element element, final String verseReference) {
        final String strong = element.getAttributeValue(ATTRIBUTE_W_LEMMA);
        final String morph = element.getAttributeValue(ATTRIBUTE_W_MORPH);
        final String word = element.getText();

        // do we need to do any manipulation? probably not because we are going to be
        // comparing against other OSIS XML texts which should be formatted in the same way!
        // however, some attributes may contain multiple strongs and morphs tagged to one word.
        // therefore we do need to split the text.
        final String[] strongs = split(strong);
        final String[] morphs = split(morph);

        if (strongs == null) {
            return;
        }

        // there is no way of know which strong goes with which morph, and we only
        // have one phrase anyway
        for (int ii = 0; ii < strongs.length; ii++) {
            if (morphs != null && morphs.length != 0) {
                for (int jj = 0; jj < morphs.length; jj++) {
                    addTextualInfo(verseReference, strongs[ii], morphs[jj], word);
                }
            } else {
                addTextualInfo(verseReference, strongs[ii], null, word);
            }
        }
    }

    /**
     * Finally, we have some information to add to this provider. We try and add it in an efficient fashion.
     * 
     * So, how do we store this? The most meaningful piece of data is a STRONG number, since it identifies the
     * word that we want to retrieve. Without the strong number, we don't have any information at all.
     * Therefore, the first level of lookup should be by Strong number.
     * 
     * Morphology-wise, each word might have a small number of options, so a linked list will do for this
     * 
     * One would think that strong -> morph -> word will be unique. In the case of having just strong, we
     * should use verse locality to maximise our chance of getting the right word (strong -> verse -> word)
     * 
     * So in summary, we use: strong -> morph -> word strong -> verse -> list(word) (not unique)
     * 
     * @param verseReference the verse reference that specifies locality (least important factor)
     * @param strong the strong number (identifies the root/meaning of the word)
     * @param morph the morphology (identifies how the used is word in the sentence - i.e. grammar)
     * @param word the word to be stored
     */
    private void addTextualInfo(final String verseReference, final String strong, final String morph,
            final String word) {
        final String strongKey = getAnyKey(strong);

        if (isNotBlank(strongKey) && isNotBlank(morph)) {
            final DualKey<String, String> strongMorphKey = new DualKey<String, String>(strongKey, morph);
            this.bestAccuracy.put(strongMorphKey, word);
        }

        final DualKey<String, String> strongVerseKey = new DualKey<String, String>(strongKey, verseReference);

        List<String> verseKeyedStrongs = this.limitedAccuracy.get(strongVerseKey);
        if (verseKeyedStrongs == null) {
            verseKeyedStrongs = new ArrayList<String>();
            this.limitedAccuracy.put(strongVerseKey, verseKeyedStrongs);
        }
        verseKeyedStrongs.add(word);

        // finally add it to the worst accuracy - i.e. just based on strongs (could probably refactor)
        this.worstAccuracy.put(strongKey, word);
    }
}
