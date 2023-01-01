package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.InternationalRangeService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.regex.Pattern;

/**
 * Looks up the app.bibleRanges property, and returns internationalised versions of the range name and range key, in the
 * form of a BookName
 *
 * @author CJBurrell
 */
@Singleton
public class InternationalRangeServiceImpl implements InternationalRangeService {
    private static final String RANGE_SUFFIX = "_range";
    private static final Logger LOGGER = LoggerFactory.getLogger(InternationalRangeServiceImpl.class);
    //stores the lang key for every list of book names
    private static final Map<Locale, List<BookName>> BOOK_NAMES = new HashMap<Locale, List<BookName>>(32);
    private final String[] ranges;
    private final Provider<ClientSession> clientSessionProvider;

    /**
     * The bible information service, retrieving content and meta data.
     */
    @Inject
    public InternationalRangeServiceImpl(@Named("app.bibleRanges") String rangeLanguages,
                                         Provider<ClientSession> clientSessionProvider) {
        this.clientSessionProvider = clientSessionProvider;
        this.ranges = StringUtils.split(rangeLanguages, ",");
    }

    @Override
    public List<BookName> getRanges(String filter, boolean exact) {
        final List<BookName> filteredBooks = new ArrayList<BookName>(1);
        try {
            if (StringUtils.isBlank(filter)) {
                return new ArrayList<BookName>(0);
            }

            final List<BookName> books = getBooks();
            if (exact) {
                for (BookName bookName : books) {
                    if (filter.equalsIgnoreCase(bookName.getFullName()))
                        filteredBooks.add(bookName);
                }
            } else {
                Pattern p = Pattern.compile("\\b" + filter, Pattern.CASE_INSENSITIVE);
                for (BookName bookName : books) {
                    if (p.matcher(bookName.getFullName()).find()) {
                        filteredBooks.add(addRangeAsBookName(bookName.getFullName()));
                    }
                }
            }
        } catch (Exception ex) {
            LOGGER.error("Ranges unavailable in locale: {}", this.clientSessionProvider.get().getLocale());
        }
        return filteredBooks;
    }

    private BookName addRangeAsBookName(final String s) {
        return new BookName(s, s, BookName.Section.BIBLE_SECTION, false, null, true, s);
    }

    public List<BookName> getBooks() {
        final Locale userLocale = clientSessionProvider.get().getLocale();
        List<BookName> bookNames = BOOK_NAMES.get(userLocale);
        if (bookNames == null) {
            bookNames = new ArrayList<BookName>();
            synchronized (BOOK_NAMES) {
                ResourceBundle bundle = ResourceBundle.getBundle("InteractiveBundle", userLocale);
                for (final String s : this.ranges) {
                    bookNames.add(new BookName(bundle.getString(s + RANGE_SUFFIX), bundle.getString(s), BookName.Section.BIBLE_SECTION, false, s));
                }
            }

            BOOK_NAMES.put(userLocale, bookNames);
        }

        return bookNames;
    }
}
