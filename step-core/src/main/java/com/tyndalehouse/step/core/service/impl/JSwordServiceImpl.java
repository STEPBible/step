/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.SERVICE_VALIDATION_ERROR;
import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;
import static java.lang.Integer.parseInt;
import static java.lang.Integer.valueOf;
import static java.lang.String.format;
import static org.crosswire.common.xml.XMLUtil.writeToString;
import static org.crosswire.jsword.book.BookCategory.BIBLE;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import javax.xml.transform.TransformerException;

import org.crosswire.common.progress.JobManager;
import org.crosswire.common.progress.Progress;
import org.crosswire.common.xml.Converter;
import org.crosswire.common.xml.SAXEventProvider;
import org.crosswire.common.xml.TransformingSAXEventProvider;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.BookFilter;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.FeatureType;
import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.NoSuchVerseException;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.passage.RestrictionType;
import org.crosswire.jsword.passage.RocketPassage;
import org.crosswire.jsword.passage.Verse;
import org.crosswire.jsword.passage.VerseRange;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.BibleBookList;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.reference.TargetType;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.utils.ValidateUtils;
import com.tyndalehouse.step.core.xsl.XslConversionType;

/**
 * a service providing a wrapper around JSword
 * 
 * @author CJBurrell
 * 
 */
@Singleton
public class JSwordServiceImpl implements JSwordService {
    private static final String CURRENT_BIBLE_INSTALL_JOB = "Installing book: %s";
    private static final String OSIS_CHAPTER_FORMAT = "%s.%d";
    private static final String OSIS_CHAPTER_VERSE_FORMAT = "%s.%s.%d";
    private static final String ANCIENT_GREEK = "grc";
    private static final String ANCIENT_HEBREW = "hbo";
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordServiceImpl.class);

    private final List<Installer> bookInstallers;
    private final MorphologyServiceImpl morphologyProvider;

    /**
     * constructs the jsword service.
     * 
     * @param installers the installers are the objects that query the crosswire servers
     * @param morphologyProvider TODO
     */
    @Inject
    public JSwordServiceImpl(final List<Installer> installers, final MorphologyServiceImpl morphologyProvider) {
        this.bookInstallers = installers;
        this.morphologyProvider = morphologyProvider;
    }

    @Override
    public void reloadInstallers() {
        boolean errors = false;
        LOGGER.trace("About to reload installers");
        for (final Installer i : this.bookInstallers) {
            try {
                LOGGER.trace("Reloading installer [{}]", i.getInstallerDefinition());
                i.reloadBookList();
            } catch (final InstallException e) {
                errors = true;
                LOGGER.error(e.getMessage(), e);
            }
        }

        if (errors) {
            throw new StepInternalException(
                    "Errors occurred while trying to retrieve the latest installer information");
        }
    }

    @Override
    public List<Book> getInstalledModules(final boolean allVersions, final String language,
            final BookCategory... bibleCategory) {

        if (!allVersions) {
            ValidateUtils.notNull(language, "Locale was not passed by requester", SERVICE_VALIDATION_ERROR);
        }

        // TODO : TOTOTOTOTOTOTOTO
        final String tempLang;
        if ("eng".equals(language)) {
            tempLang = "en";
        } else {
            tempLang = language;
        }

        if (bibleCategory == null || bibleCategory.length == 0) {
            return new ArrayList<Book>();
        }

        // quickly transform the categories to a set for fast comparison
        final Set<BookCategory> categories = new HashSet<BookCategory>();
        for (int ii = 0; ii < bibleCategory.length; ii++) {
            categories.add(bibleCategory[ii]);
        }

        // we set up a filter to retrieve just certain types of books
        final BookFilter bf = new BookFilter() {
            @Override
            @SuppressWarnings("PMD.JUnit4TestShouldUseTestAnnotation")
            public boolean test(final Book b) {
                return categories.contains(b.getBookCategory())
                        && (allVersions || isAcceptableVersions(b, tempLang));
            }

        };
        return Books.installed().getBooks(bf);
    }

    /**
     * @param locale the language we are interested in
     * @param book the book we are testing
     * @return true if we are to accept the book
     */
    private boolean isAcceptableVersions(final Book book, final String locale) {
        return ANCIENT_GREEK.equals(book.getLanguage().getCode())
                || ANCIENT_HEBREW.equals(book.getLanguage().getCode())
                || locale.equals(book.getLanguage().getCode());
    }

    /**
     * @param bibleCategory the categories of books that should be considered
     * @return returns a list of installed modules
     */
    @Override
    public List<Book> getInstalledModules(final BookCategory... bibleCategory) {
        return getInstalledModules(true, null, bibleCategory);
    }

    /**
     * @param bibleCategory the list of books that should be considered
     * @return a list of all modules
     */
    @Override
    public List<Book> getAllModules(final BookCategory... bibleCategory) {
        final List<Book> books = new ArrayList<Book>();
        for (final Installer installer : this.bookInstallers) {
            try {
                installer.reloadBookList();
                books.addAll(installer.getBooks());
            } catch (final InstallException e) {
                // log an error
                LOGGER.error("Unable to update installer", e);
            }
        }
        return books;
    }

    @Override
    public String getSiblingChapter(final String reference, final String version,
            final boolean previousChapter) {
        // getting the next chapter
        final Book currentBook = Books.installed().getBook(version);

        try {
            final Key key = currentBook.getKey(reference);
            final String osisID = key.getOsisID();
            LOGGER.debug(osisID);

            // split down according to different references
            final String[] refs = split(osisID, "[,; \\-]+");
            final String interestedRef = previousChapter ? refs[0] : refs[refs.length - 1];
            final String[] refParts = split(interestedRef, "\\.");
            final Key newKey = previousChapter ? getPreviousRef(refParts, key, currentBook) : getNextRef(
                    refParts, key, currentBook);
            return newKey.getName();

        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Cannot find next chapter", e);
        }
    }

    /**
     * Roudns up the reference to the next chapter + 1 (1 if it is the last verse)
     * 
     * @param ref the current reference, split into up-to three parts (book/chapter/verse)
     * @param currentKey the current key
     * @param currentBook the book containing all valid keys
     * @return the next key in the list
     */
    Key getNextRef(final String[] ref, final Key currentKey, final Book currentBook) {
        switch (ref.length) {
            case 3:
                return expandToFullChapter(ref[0], ref[1], ref[2], currentBook, currentKey, 1);
            case 2:
                // if we only have 2 parts, then we take the chapter number +1 and see if that makes sense
                return getAdjacentChapter(ref[0], ref[1], currentBook, currentKey, 1);
            default:
                break;
        }

        return currentKey;
    }

    /**
     * attempts to resolve to the next previous chapter
     * 
     * @param ref the refParts, each element representing a portion of the OSIS ID
     * @param currentKey the key that is currently being examined
     * @param currentBook the book that is currently being referenced
     * @return the new OSIS ID, whether it exists or not.
     */
    Key getPreviousRef(final String[] ref, final Key currentKey, final Book currentBook) {

        // are we dealing with something like Book.chapter.verse?
        switch (ref.length) {
            case 3:
                return expandToFullChapter(ref[0], ref[1], ref[2], currentBook, currentKey, -1);
            case 2:
                return getAdjacentChapter(ref[0], ref[1], currentBook, currentKey, -1);
            default:
                // we are dealing with a book or something else.
                break;
        }

        return currentKey;
    }

    /**
     * attemps to expand to the next chapter if exists, other returns the same key as currently if no new
     * chapter is found
     * 
     * @param bookName the name of book, e.g. Gen
     * @param chapterNumber the chapter number
     * @param currentBook the book to look for valid keys
     * @param currentKey the current position in the book
     * @param gap -1 for a previous chapter, +1 for a next chapter
     * @return the new key, referring to the next chapter of previous as requested
     */
    Key getAdjacentChapter(final String bookName, final String chapterNumber, final Book currentBook,
            final Key currentKey, final int gap) {
        final int newChapter = parseInt(chapterNumber) + gap;

        return getValidOrSameKey(currentBook, currentKey, format(OSIS_CHAPTER_FORMAT, bookName, newChapter));
    }

    /**
     * Expands the key to full chapter, or if it is the last verse in the chapter, then it expands to the next
     * chapter
     * 
     * @param bookName the name of book, e.g. Gen
     * @param chapterNumber the chapter number
     * @param verseNumber the verse number
     * @param currentBook the book to look for valid keys
     * @param currentKey the current position in the book
     * @param gap the increment to expand to, e.g. 1 to the next chapter, -1 to the previous chapter (value in
     *            approximate verse numbers)
     * @return the new key, whether it refers to this current chapter or the next
     */
    Key expandToFullChapter(final String bookName, final String chapterNumber, final String verseNumber,
            final Book currentBook, final Key currentKey, final int gap) {
        final int nextVerse = parseInt(verseNumber) + gap;

        final Key newKey = getValidOrSameKey(currentBook, currentKey,
                format(OSIS_CHAPTER_VERSE_FORMAT, bookName, chapterNumber, nextVerse));

        // if we're on a beginning of a chapter
        if (newKey.getOsisID().endsWith(".0") || newKey.equals(currentKey)) {
            return getAdjacentChapter(bookName, chapterNumber, currentBook, currentKey, gap);
        }

        return currentBook.getValidKey(format("%s.%s", bookName, chapterNumber));
    }

    /**
     * returns a valid key to the book, either the one specified in the newKeyName or the currentKey
     * 
     * @param currentBook the book to look for valid keys
     * @param currentKey the current key
     * @param newKeyName the new potential key name
     * @return the newKey if newKeyName was a good guess, or currentKey if not
     */
    private Key getValidOrSameKey(final Book currentBook, final Key currentKey, final String newKeyName) {
        final Key validKey = currentBook.getValidKey(newKeyName);
        if (validKey.isEmpty()) {
            return currentKey;
        }
        return validKey;
    }

    @Override
    public OsisWrapper getOsisText(final String version, final String reference) {
        final List<LookupOption> options = new ArrayList<LookupOption>();
        return getOsisText(version, reference, options, null);
    }

    // TODO: can we make this more performant by not re-compiling stylesheet - or is already cached
    // FIXME TODO: JS-109, email from CJB on 27/02/2011 remove synchronisation once book is fixed
    @Override
    public synchronized OsisWrapper getOsisText(final String version, final String reference,
            final List<LookupOption> options, final String interlinearVersion) {
        LOGGER.debug("Retrieving text for ({}, {})", version, reference);

        try {
            final Book currentBook = Books.installed().getBook(version);

            if (currentBook == null) {
                throw new StepInternalException("The specified initials " + version
                        + " did not reference a valid module");
            }

            final BookData bookData = new BookData(currentBook, currentBook.getKey(reference));
            final XslConversionType requiredTransformation = identifyStyleSheet(options);

            final SAXEventProvider osissep = bookData.getSAXEventProvider();
            TransformingSAXEventProvider htmlsep = null;
            htmlsep = (TransformingSAXEventProvider) new Converter() {
                @Override
                public SAXEventProvider convert(final SAXEventProvider provider) throws TransformerException {
                    try {
                        final String file = requiredTransformation.getFile();
                        final URI resourceURI = getClass().getResource(file).toURI();

                        final TransformingSAXEventProvider tsep = new TransformingSAXEventProvider(
                                resourceURI, osissep);

                        // set parameters here
                        setOptions(tsep, options, version, reference);
                        setInterlinearOptions(tsep, interlinearVersion, reference);
                        return tsep;
                    } catch (final URISyntaxException e) {
                        throw new StepInternalException("Failed to load resource correctly", e);
                    }
                }
            }.convert(osissep);
            return new OsisWrapper(writeToString(htmlsep), bookData.getKey().getName());
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("The verse specified was not found: " + reference, e);
        } catch (final BookException e) {
            throw new StepInternalException("Unable to query the book data to retrieve specified passage: "
                    + version + ", " + reference, e);
        } catch (final SAXException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final TransformerException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * At the moment, we only support one stylesheet at the moment, so we only need to return one This may
     * change, but at that point we'll have a cleared view on requirements. For now, if one of the options
     * triggers anything but the default, then we return that. returns the stylesheet that should be used to
     * generate the text
     * 
     * @param options the list of options that are currently applied to the passage
     * @return the stylesheet (of stylesheets)
     */
    private XslConversionType identifyStyleSheet(final List<LookupOption> options) {
        for (final LookupOption lo : options) {
            if (!XslConversionType.DEFAULT.equals(lo.getStylesheet())) {
                if (XslConversionType.INTERLINEAR.equals(lo.getStylesheet())) {
                    options.add(LookupOption.CHAPTER_VERSE);

                    // FIXME: also remove headers, as not yet supported
                    options.remove(LookupOption.HEADINGS);
                }

                return lo.getStylesheet();
            }
        }

        return XslConversionType.DEFAULT;
    }

    @Override
    public List<LookupOption> getFeatures(final String version) {
        // obtain the book
        final Book book = Books.installed().getBook(version);
        final List<LookupOption> options = new ArrayList<LookupOption>(LookupOption.values().length + 1);

        if (book == null) {
            return options;
        }

        // some options are always there for Bibles:
        if (BIBLE.equals(book.getBookCategory())) {
            options.add(LookupOption.VERSE_NUMBERS);
            options.add(LookupOption.VERSE_NEW_LINE);

            // TODO FIXME bug in modules? in jsword?
            options.add(LookupOption.RED_LETTER);
        }

        if (book.getBookMetaData().hasFeature(FeatureType.FOOTNOTES)
                || book.getBookMetaData().hasFeature(FeatureType.SCRIPTURE_REFERENCES)) {
            options.add(LookupOption.NOTES);
        }

        // cycle through each option
        for (final LookupOption lo : LookupOption.values()) {
            final FeatureType ft = FeatureType.fromString(lo.getXsltParameterName());
            if (ft != null && isNotEmpty(lo.name()) && book.getBookMetaData().hasFeature(ft)) {
                options.add(lo);
            }
        }

        return options;
    }

    /**
     * sets up the default interlinear options
     * 
     * @param tsep the transformer that we want to set up
     * @param interlinearVersion the interlinear version(s) that the users have requested
     * @param reference the reference the user is interested in
     */
    private void setInterlinearOptions(final TransformingSAXEventProvider tsep,
            final String interlinearVersion, final String reference) {
        if (tsep.getParameter(LookupOption.INTERLINEAR.getXsltParameterName()) != null) {
            tsep.setParameter("interlinearReference", reference);
            tsep.setParameter("VLine", false);

            if (isNotBlank(interlinearVersion)) {
                tsep.setParameter("interlinearVersion", interlinearVersion);
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
     */
    protected void setOptions(final TransformingSAXEventProvider tsep, final List<LookupOption> options,
            final String version, final String textScope) {
        for (final LookupOption lookupOption : options) {
            if (lookupOption.getXsltParameterName() != null) {
                tsep.setParameter(lookupOption.getXsltParameterName(), true);

                if (LookupOption.VERSE_NUMBERS.equals(lookupOption)) {
                    tsep.setParameter(LookupOption.TINY_VERSE_NUMBERS.getXsltParameterName(), true);
                }

                if (LookupOption.MORPHOLOGY.equals(lookupOption)) {
                    // tsep.setDevelopmentMode(true);
                    tsep.setParameter("morphologyProvider", this.morphologyProvider);
                }
            }
        }

        tsep.setParameter("baseVersion", version);
    }

    @Override
    public boolean isInstalled(final String moduleInitials) {
        return Books.installed().getBook(moduleInitials) != null;
    }

    @Override
    public void installBook(final String initials) {
        LOGGER.debug("Installing module [{}]", initials);
        notBlank(initials, "No version was found", SERVICE_VALIDATION_ERROR);

        // check if already installed?
        if (!isInstalled(initials)) {
            LOGGER.debug("Book was not already installed, so kicking off installation process for [{}]",
                    initials);
            for (final Installer i : this.bookInstallers) {
                final Book bookToBeInstalled = i.getBook(initials);

                // TODO TODO TODO FIME
                if (bookToBeInstalled != null) {
                    // then we can kick off installation and return
                    try {
                        i.install(bookToBeInstalled);
                        return;
                    } catch (final InstallException e) {
                        // we log error here,
                        LOGGER.error(
                                "An error occurred error, and we unable to use this installer for module"
                                        + initials, e);

                        // but go round the loop to see if more options are available
                        continue;
                    }
                }
            }
            // if we get here, then we were unable to install the book
            // since we couldn't find it.
            throw new StepInternalException("Unable to find book with initials " + initials);
        }

        // if we get here then we had already installed the book - how come we're asking for this again?
        LOGGER.warn("A request to install an already installed book was made for initials " + initials);
    }

    @Override
    public double getProgressOnInstallation(final String bookName) {
        notBlank(bookName, "The book name provided was blank", SERVICE_VALIDATION_ERROR);

        if (isInstalled(bookName)) {
            return 1;
        }

        final Set<Progress> jswordJobs = JobManager.getJobs();
        // not yet installed (or at least wasn't on the lines above, so check job list
        for (final Progress p : jswordJobs) {
            final String expectedJobName = format(CURRENT_BIBLE_INSTALL_JOB, bookName);
            if (expectedJobName.equals(p.getJobName())) {
                if (p.isFinished()) {
                    return 1;
                }

                return (double) p.getWork() / p.getTotalWork();
            }
        }

        // the job may have completed by now, while we did the search, so do a final check
        if (isInstalled(bookName)) {
            return 1;
        }

        throw new StepInternalException(
                "An unknown error has occurred: the job has disappeared of the job list, "
                        + "but the module is not installed");
    }

    @Override
    public List<ScriptureReference> getPassageReferences(final String references,
            final TargetType targetType, final String version) {
        final List<ScriptureReference> refs = new ArrayList<ScriptureReference>();

        if (isNotBlank(references)) {
            LOGGER.trace("Resolving references for [{}]", references);
            try {
                final PassageKeyFactory keyFactory = PassageKeyFactory.instance();

                // TODO FIXME this should be uncommented - but currently need it out to make loading process
                // work
                // final String versification = (String) Books.installed().getBook(version).getBookMetaData()
                // .getProperty(BookMetaData.KEY_VERSIFICATION);
                // final Versification v11n = Versifications.instance().getVersification(versification);
                final Versification v11n = Versifications.instance().getDefaultVersification();

                final RocketPassage rp = (RocketPassage) keyFactory.getKey(v11n, references);
                for (int ii = 0; ii < rp.countRanges(RestrictionType.NONE); ii++) {
                    final VerseRange vr = rp.getRangeAt(ii, RestrictionType.NONE);
                    final Verse start = vr.getStart();
                    final Verse end = vr.getEnd();

                    final int startVerseId = start.getOrdinal();
                    final int endVerseId = end.getOrdinal();

                    LOGGER.trace("Found reference [{}] to [{}]", valueOf(startVerseId), valueOf(endVerseId));
                    final ScriptureReference sr = new ScriptureReference();

                    sr.setStartVerseId(startVerseId);
                    sr.setEndVerseId(endVerseId);
                    sr.setTargetType(targetType);
                    refs.add(sr);
                }
            } catch (final NoSuchVerseException nsve) {
                throw new StepInternalException("Verse " + references + " does not exist", nsve);
            } catch (final NoSuchKeyException e) {
                throw new StepInternalException(e.getMessage(), e);
            }
        }
        return refs;
    }

    /**
     * Looks through a versification for a particular type of book
     * 
     * @param bookStart the string to match
     * @param versification the versification we are interested in
     * @return the list of matching names
     */
    private List<String> getBooksFromVersification(final String bookStart, final Versification versification) {
        final String searchPattern = bookStart.toLowerCase(Locale.getDefault());

        final List<String> matchingNames = new ArrayList<String>();
        final BibleBookList books = versification.getBooks();
        for (final BibleBook book : books) {
            if (book.getLongName().toLowerCase().startsWith(searchPattern)
                    || book.getPreferredName().toLowerCase().startsWith(searchPattern)
                    || book.getShortName().toLowerCase().startsWith(searchPattern)) {
                matchingNames.add(book.getShortName());
            }
        }
        return matchingNames;
    }

    @Override
    public List<String> getBibleBookNames(final String bookStart, final String version) {
        final String lookup = isBlank(bookStart) ? "" : bookStart;

        Versification versification = Versifications.instance().getVersification(version);
        if (versification == null) {
            versification = Versifications.instance().getDefaultVersification();
        }

        final List<String> books = getBooksFromVersification(lookup, versification);

        if (books.isEmpty()) {
            return getBooksFromVersification(lookup, Versifications.instance().getDefaultVersification());
        }

        return books;
    }

}
