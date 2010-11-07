package com.tyndalehouse.step.core.service.impl;

import static java.lang.String.format;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import javax.xml.transform.TransformerException;

import org.apache.commons.lang.StringUtils;
import org.crosswire.common.util.Language;
import org.crosswire.common.xml.Converter;
import org.crosswire.common.xml.SAXEventProvider;
import org.crosswire.common.xml.TransformingSAXEventProvider;
import org.crosswire.common.xml.XMLUtil;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.BookFilter;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.FeatureType;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.versification.BibleInfo;
import org.jdom.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * a service providing a wrapper around JSword
 * 
 * @author CJBurrell
 * 
 */
public class JSwordServiceImpl implements JSwordService {
    /**
     * the pattern with which strong references in OSIS start
     */
    public static final String STRONG_PATTERN_START = "strong:";

    /**
     * a greek marker for strong numbers, e.g. strong:Gxxxx
     */
    public static final char STRONG_GREEK_MARKER = 'G';

    /**
     * Strong hebrew marker, for e.g. strong:Hxxxx
     */
    public static final char STRONG_HEBREW_MARKER = 'H';

    /**
     * Initials of default Hebrew JSword module to use for lookup of dictionary definitions
     */
    public static final String STRONG_HEBREW_DICTIONARY_INITIALS = "StrongsHebrew";

    /**
     * Initials of default Strong JSword greek dictionary module for lookup of dictionary definitions
     */
    public static final String STRONG_GREEK_DICTIONARY_INITIALS = "StrongsGreek";
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    // TODO: autowire, or drive from properties file
    // @Autowired
    private final String xslConversionDefinition = "default.xsl";

    @SuppressWarnings("unchecked")
    public List<Book> getModules(final BookCategory bibleCategory) {
        if (bibleCategory == null) {
            return new ArrayList<Book>();
        }

        // we set up a filter to retrieve just certain types of books
        final BookFilter bf = new BookFilter() {
            public boolean test(final Book b) {
                return bibleCategory.equals(b.getBookCategory());
            }
        };
        return Books.installed().getBooks(bf);
    }

    public String getOsisText(final String version, final String reference, final List<LookupOption> options) {
        this.logger.debug("Retrieving text for ({}, {})", version, reference);

        try {
            final Book currentBook = Books.installed().getBook(version);
            final BookData bookData = new BookData(currentBook, currentBook.getKey(reference));

            final SAXEventProvider osissep = bookData.getSAXEventProvider();
            TransformingSAXEventProvider htmlsep = null;
            htmlsep = (TransformingSAXEventProvider) new Converter() {

                // TODO cache XSL in memory or Transforming SAX Event Provider
                public SAXEventProvider convert(final SAXEventProvider provider) throws TransformerException {
                    try {
                        final TransformingSAXEventProvider tsep = new TransformingSAXEventProvider(getClass()
                                .getResource(JSwordServiceImpl.this.xslConversionDefinition).toURI(), osissep);

                        // set parameters here
                        setOptions(tsep, options);

                        // then return
                        return tsep;
                    } catch (final URISyntaxException e) {
                        throw new StepInternalException("Failed to load resource correctly", e);
                    }
                }
            }.convert(osissep);
            return XMLUtil.writeToString(htmlsep);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("The verse specified was not found: [" + reference + "]", e);
        } catch (final BookException e) {
            throw new StepInternalException("Unable to query the book data to retrieve specified passage [" + version
                    + "] [" + reference + "]", e);
        } catch (final SAXException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final TransformerException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    public List<LookupOption> getFeatures(final String version) {
        final Book book = Books.installed().getBook(version);
        final List<LookupOption> options = new ArrayList<LookupOption>(3);
        for (final LookupOption lo : LookupOption.values()) {
            final FeatureType ft = FeatureType.fromString(lo.getXsltParameterName());
            if (ft != null) {
                if (book.getBookMetaData().hasFeature(ft)) {
                    options.add(lo);
                }
            }
        }
        return options;
    }

    /**
     * This method sets up the options for the XSLT transformation
     * 
     * @param tsep the xslt transformer
     * @param options the options available
     */
    protected void setOptions(final TransformingSAXEventProvider tsep, final List<LookupOption> options) {
        for (final LookupOption lookupOption : options) {
            tsep.setParameter(lookupOption.getXsltParameterName(), true);
        }
    }

    public String getLanguage(final String version) {
        final Book currentBook = Books.installed().getBook(version);
        if (currentBook == null) {
            return null;
        }

        final Language language = currentBook.getLanguage();
        if (language != null) {
            return language.getCode();
        }
        return null;
    }

    /**
     * IMPROVEMENT NOTE that this is not thread safe, since JSword relies on statics in the background
     */
    public String getReadableKey(final String version, final String reference) {
        try {
            BibleInfo.setFullBookName(false);
            return Books.installed().getBook(version).getKey(reference).getName();
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Unable to get readable key from OSIS reference", e);
        }
    }

    public String lookupStrongDefinition(final String reference) {
        if (StringUtils.isEmpty(reference)) {
            throw new StepInternalException("Reference was not provided");
        }
        this.logger.error("definition lookup command");
        final String initials = getInitialsFromReference(reference);
        final String lookupKey = getLookupKeyFromReference(reference);

        try {
            // TODO: ensure a lookup key exists!
            final Book currentBook = Books.installed().getBook(initials);
            final BookData data = new BookData(currentBook, currentBook.getKey(lookupKey));
            return doXslt(data, data.getOsisFragment());
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Unable to find specified reference", e);
        } catch (final BookException e) {
            throw new StepInternalException("An error occurred looking up the passage", e);
        }
    }

    /**
     * does a simple xslt transformation to show the definition on the screen
     * 
     * @param data data to be shown
     * @param osisFragment osisFragment to transform
     * @return the xslted definition ready to be displayed on the user's screen
     */
    private String doXslt(final BookData data, final Element osisFragment) {
        // if (data == null) {
        // return "";
        // }
        //
        // try {
        // final SAXEventProvider osissep = data.getSAXEventProvider();
        // // TODO: do some work on the XSLT definition
        // final TransformingSAXEventProvider htmlsep = (TransformingSAXEventProvider) new ConfigurableHTMLConverter()
        // .convert(osissep);
        // final String text = XMLUtil.writeToString(htmlsep);
        // return text;
        // } catch (final SAXException e) {
        // Reporter.informUser(this, e);
        // } catch (final BookException e) {
        // Reporter.informUser(this, e);
        // } catch (final TransformerException e) {
        // Reporter.informUser(this, e);
        // }
        return "";
    }

    public String getInitialsFromReference(final String reference) {
        if (reference.toLowerCase().startsWith(STRONG_PATTERN_START)) {
            final int charPosition = STRONG_PATTERN_START.length();
            if (reference.charAt(charPosition) == STRONG_HEBREW_MARKER) {
                return STRONG_HEBREW_DICTIONARY_INITIALS;
            } else if (reference.charAt(charPosition) == STRONG_GREEK_MARKER) {
                return STRONG_GREEK_DICTIONARY_INITIALS;
            }
            // continuing will throw exception
        }
        throw new StepInternalException(format("Dictionary reference not recognised: %s", reference));
    }

    public String getLookupKeyFromReference(final String reference) {
        if (reference.toLowerCase().startsWith(STRONG_PATTERN_START)) {
            // remove strong: or strong:
            return reference.substring(STRONG_PATTERN_START.length());
        }
        throw new StepInternalException(format("Lookup key not recognised: %s", reference));
    }
}
