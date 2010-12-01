package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.xsl.XslConversionType.DEFAULT;
import static org.apache.commons.lang.StringUtils.isNotBlank;
import static org.apache.commons.lang.StringUtils.isNotEmpty;
import static org.crosswire.jsword.book.BookCategory.BIBLE;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.xml.transform.TransformerException;

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.xsl.XslConversionType;

/**
 * a service providing a wrapper around JSword
 * 
 * @author CJBurrell
 * 
 */
public class JSwordServiceImpl implements JSwordService {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

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

    public String getOsisText(final String version, final String reference) {
        final List<LookupOption> options = new ArrayList<LookupOption>();
        return getOsisText(version, reference, options, null);
    }

    public String getOsisText(final String version, final String reference, final List<LookupOption> options,
            final String interlinearVersion) {
        this.logger.debug("Retrieving text for ({}, {})", version, reference);

        try {
            final Book currentBook = Books.installed().getBook(version);
            final BookData bookData = new BookData(currentBook, currentBook.getKey(reference));
            final Set<XslConversionType> requiredTransformation = identifyStyleSheet(options);

            final SAXEventProvider osissep = bookData.getSAXEventProvider();
            TransformingSAXEventProvider htmlsep = null;
            htmlsep = (TransformingSAXEventProvider) new Converter() {

                public SAXEventProvider convert(final SAXEventProvider provider) throws TransformerException {
                    try {
                        // for now, we just assume that we'll only have one option, but this may change later
                        // TODO, we can probably cache the resource
                        final TransformingSAXEventProvider tsep = new TransformingSAXEventProvider(getClass()
                                .getResource(requiredTransformation.iterator().next().getFile()).toURI(), osissep);

                        // set parameters here
                        setOptions(tsep, options, version, reference);
                        setupInterlinearOptions(tsep, interlinearVersion, reference);

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

    /**
     * returns the stylesheet that should be used to generate the text
     * 
     * @param options the list of options that are currently applied to the passage
     * @return the stylesheet (of stylesheets)
     */
    private Set<XslConversionType> identifyStyleSheet(final List<LookupOption> options) {
        final Set<XslConversionType> chosenOptions = new HashSet<XslConversionType>();

        for (final LookupOption lo : options) {
            chosenOptions.add(lo.getStylesheet());
        }

        // remove from the list any default:
        if (chosenOptions.contains(DEFAULT) && chosenOptions.size() > 1) {
            chosenOptions.remove(DEFAULT);
        } else if (chosenOptions.isEmpty()) {
            chosenOptions.add(DEFAULT);
        }

        return chosenOptions;
    }

    public List<LookupOption> getFeatures(final String version) {
        // obtain the book
        final Book book = Books.installed().getBook(version);
        final List<LookupOption> options = new ArrayList<LookupOption>(LookupOption.values().length + 1);

        // some options are always there for Bibles:
        if (BIBLE.equals(book.getBookCategory())) {
            options.add(LookupOption.VERSE_NUMBERS);
        }

        // cycle through each option
        for (final LookupOption lo : LookupOption.values()) {
            final FeatureType ft = FeatureType.fromString(lo.getXsltParameterName());
            if (ft != null && isNotEmpty(lo.getDisplayName())) {
                if (book.getBookMetaData().hasFeature(ft)) {
                    options.add(lo);
                }
            }
        }
        return options;
    }

    private void setupInterlinearOptions(final TransformingSAXEventProvider tsep, final String interlinearVersion,
            final String reference) {
        if (tsep.getParameter(LookupOption.INTERLINEAR.getXsltParameterName()) != null) {
            tsep.setParameter("interlinearReference", reference);

            if (isNotBlank(interlinearVersion)) {
                tsep.setParameter("interlinearVersion", interlinearVersion);
            } else {
                // depending on OT or NT, we select a default interlinear version

            }
        }
    }

    /**
     * This method sets up the options for the XSLT transformation
     * 
     * @param tsep the xslt transformer
     * @param options the options available
     * @param version the version to initialise a potential interlinear with
     * @param textScope the scope of the text to lookup
     * @return the XSLT that will give me the correct transformation
     */
    protected void setOptions(final TransformingSAXEventProvider tsep, final List<LookupOption> options,
            final String version, final String textScope) {
        for (final LookupOption lookupOption : options) {
            tsep.setParameter(lookupOption.getXsltParameterName(), true);

            if (LookupOption.VERSE_NUMBERS.equals(lookupOption)) {
                tsep.setParameter(LookupOption.TINY_VERSE_NUMBERS.getXsltParameterName(), true);
            }
        }
    }

}
