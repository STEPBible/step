package com.tyndalehouse.step.core.service.jsword.impl;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.SERVICE_VALIDATION_ERROR;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;
import static java.lang.String.format;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.crosswire.common.progress.JobManager;
import org.crosswire.common.progress.Progress;
import org.crosswire.common.progress.WorkEvent;
import org.crosswire.common.progress.WorkListener;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.BookFilter;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.index.IndexManagerFactory;
import org.crosswire.jsword.index.IndexStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.utils.ValidateUtils;

/**
 * Service to manipulate modules
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class JSwordModuleServiceImpl implements JSwordModuleService {
    private static final String INSTALLING_BOOK = "Installing book";
    private static final Logger LOGGER = LoggerFactory.getLogger(JSwordModuleServiceImpl.class);
    private static final String ANCIENT_GREEK = "grc";
    private static final String ANCIENT_HEBREW = "hbo";
    private static final String CURRENT_BIBLE_INSTALL_JOB = "Installing book: %s";
    private final List<Installer> bookInstallers;

    /**
     * @param installers a list of installers to use to download books
     */
    @Inject
    public JSwordModuleServiceImpl(final List<Installer> installers) {
        this.bookInstallers = installers;

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

                if (job.isFinished() && job.getJobName().startsWith(INSTALLING_BOOK)) {
                    handleFinshedBookInstall();
                }
            }
        });

    }

    /**
     * When a book finishes installation, we'll index it
     */
    void handleFinshedBookInstall() {
        // usually at most one book needs indexing, so let's kick the process off...
        final List<Book> books = Books.installed().getBooks();
        for (final Book b : books) {
            if (IndexStatus.UNDONE.equals(b.getIndexStatus())) {
                LOGGER.info("Indexing [{}]", b.getInitials());
                IndexManagerFactory.getIndexManager().scheduleIndexCreation(b);
            }
        }
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

}
