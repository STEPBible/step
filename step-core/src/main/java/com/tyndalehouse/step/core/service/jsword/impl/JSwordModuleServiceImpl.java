package com.tyndalehouse.step.core.service.jsword.impl;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.SERVICE_VALIDATION_ERROR;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;
import static java.lang.String.format;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.crosswire.common.progress.JobManager;
import org.crosswire.common.progress.Progress;
import org.crosswire.common.progress.WorkEvent;
import org.crosswire.common.progress.WorkListener;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.BookFilter;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.index.IndexManager;
import org.crosswire.jsword.index.IndexManagerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.ValidateUtils;

/**
 * Service to manipulate modules
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class JSwordModuleServiceImpl implements JSwordModuleService {
    private static final int INDEX_WAITING = 1000;
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordModuleServiceImpl.class);
    private static final String ANCIENT_GREEK = "grc";
    private static final String ANCIENT_HEBREW = "hbo";
    private static final String CURRENT_BIBLE_INSTALL_JOB = "Installing book: %s";
    private static final String CURRENT_BIBLE_INDEX_JOB = "Creating index. Processing %s";

    // BE CAREFUL about using these installers.
    private final List<Installer> bookInstallers;
    private final List<Installer> offlineInstallers;
    private boolean offline = false;
    private final JSwordVersificationService versificationService;

    /**
     * This method is deliberately placed at the top of the file to raise awareness that sensitive countries
     * may not wish to access the internet.
     * <p />
     * If the installation is set to "offline", then only return the offline installers.
     * 
     * @return a set of installers
     */
    private List<Installer> getInstallers() {
        return this.offline ? this.offlineInstallers : this.bookInstallers;
    }

    // CHECKSTYLE:OFF
    /**
     * @param installers a list of installers to use to download books
     * @param offlineInstallers the set of installers to use offline, rather than online
     */
    @Inject
    public JSwordModuleServiceImpl(@Named("onlineInstallers") final List<Installer> installers,
            @Named("offlineInstallers") final List<Installer> offlineInstallers,
            final JSwordVersificationService versificationService) {
        this.bookInstallers = installers;
        this.offlineInstallers = offlineInstallers;
        this.versificationService = versificationService;

        // add a handler to be notified of all job progresses
        JobManager.addWorkListener(new WorkListener() {

            @Override
            public void workStateChanged(final WorkEvent ev) {
                // Never fired - mailed jsword-devel list. so unfortunately need to use below
            }

            @Override
            public void workProgressed(final WorkEvent ev) {
                // ignore for now...
                final Progress job = ev.getJob();
                LOGGER.trace("Work [{}] at [{}] / [{}]", new Object[] { job.getJobName(), job.getTotalWork(),
                        job.getTotalWork() });
            }
        });
    }

    // CHECKSTYLE:ON

    @Override
    public void setOffline(final boolean offline) {
        this.offline = offline;
    }

    @Override
    public boolean isInstalled(final String... modules) {
        for (final String moduleInitials : modules) {
            if (this.versificationService.getBookSilently(moduleInitials) == null) {
                return false;
            }
        }
        return true;
    }

    @Override
    public boolean isIndexed(final String version) {
        final IndexManager indexManager = IndexManagerFactory.getIndexManager();
        return indexManager.isIndexed(this.versificationService.getBookFromVersion(version));
    }

    @Override
    public void index(final String initials) {
        final IndexManager indexManager = IndexManagerFactory.getIndexManager();
        final Book book = this.versificationService.getBookFromVersion(initials);
        if (!indexManager.isIndexed(book)) {
            indexManager.scheduleIndexCreation(book);
        }
    }

    @Override
    public void reIndex(final String initials) {
        final Book book = this.versificationService.getBookFromVersion(initials);
        try {
            IndexManagerFactory.getIndexManager().deleteIndex(book);
        } catch (final BookException e) {
            LOGGER.warn("Error deleting index. Attempting to rebuild index all the same", e);
        }
        IndexManagerFactory.getIndexManager().scheduleIndexCreation(book);
    }

    @Override
    public void installBook(final String initials) {
        LOGGER.debug("Installing module [{}]", initials);
        notBlank(initials, "No version was found", SERVICE_VALIDATION_ERROR);

        // check if already installed?
        if (!isInstalled(initials)) {
            LOGGER.debug("Book was not already installed, so kicking off installation process for [{}]",
                    initials);
            final List<Installer> installers = getInstallers();
            for (final Installer i : installers) {
                final Book bookToBeInstalled = i.getBook(initials);

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
            throw new TranslatedException("book_not_found", initials);
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

        // not yet installed (or at least wasn't on the lines above, so check job list
        final Iterator<Progress> iterator = JobManager.iterator();
        while (iterator.hasNext()) {
            final Progress p = iterator.next();
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
    public double getProgressOnIndexing(final String bookName) {
        notBlank(bookName, "The book name to be indexed was blank", SERVICE_VALIDATION_ERROR);

        if (isIndexed(bookName)) {
            return 1;
        }

        // not yet installed (or at least wasn't on the lines above, so check job list
        final Iterator<Progress> iterator = JobManager.iterator();
        while (iterator.hasNext()) {
            final Progress p = iterator.next();
            final String expectedJobName = format(CURRENT_BIBLE_INDEX_JOB, bookName);
            if (expectedJobName.equals(p.getJobName())) {
                if (p.isFinished()) {
                    return 1;
                }

                return (double) p.getWork() / p.getTotalWork();
            }
        }

        // the job may have completed by now, while we did the search, so do a final check
        if (isIndexed(bookName)) {
            return 1;
        }

        throw new StepInternalException(
                "An unknown error has occurred: the job has disappeared of the job list, "
                        + "but the module is not installed");
    }

    @Override
    public void reloadInstallers() {
        boolean errors = false;
        LOGGER.trace("About to reload installers");
        final List<Installer> installers = getInstallers();

        for (final Installer i : installers) {
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

    @Override
    public List<Book> getInstalledModules(final BookCategory... bibleCategory) {
        return getInstalledModules(true, null, bibleCategory);
    }

    @Override
    public List<Book> getAllModules(final BookCategory... bibleCategory) {
        final List<Book> books = new ArrayList<Book>();
        final List<Installer> installers = getInstallers();
        for (final Installer installer : installers) {
            try {
                installer.reloadBookList();

                final List<Book> installerBooks = installer.getBooks();

                // iterate through books, doing a linear search for each category, because the list is only 1
                // - 4 items bigs, likely 2
                for (final Book b : installerBooks) {
                    for (final BookCategory cat : bibleCategory) {
                        if (cat.equals(b.getBookCategory())) {
                            books.add(b);
                            break;
                        }
                    }
                }
            } catch (final InstallException e) {
                // log an error
                LOGGER.error("Unable to update installer", e);
            }
        }
        return books;
    }

    @Override
    public void removeModule(final String initials) {
        final Book book = this.versificationService.getBookFromVersion(initials);

        if (book != null) {
            try {
                Books.installed().removeBook(book);
            } catch (final BookException e) {
                // book wasn't found probably
                LOGGER.warn("Deleting book failed: " + initials, e);
            }
        }
    }

    @Override
    public void waitForIndexes(final String... versions) {
        for (final String s : versions) {
            while (!this.isIndexed(s)) {
                try {
                    Thread.sleep(INDEX_WAITING);
                } catch (final InterruptedException e) {
                    LOGGER.warn("Interrupted exception", e);
                }
            }
        }
    }
}
