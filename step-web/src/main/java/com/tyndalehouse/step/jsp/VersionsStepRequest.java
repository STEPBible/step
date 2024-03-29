package com.tyndalehouse.step.jsp;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.common.util.Language;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.Books;

import java.util.*;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page
 */
// CHECKSTYLE:OFF
public class VersionsStepRequest {
    private final Locale userLocale;
    private final ResourceBundle bundle;
    private final VersionResolver versionResolver;

    /**
     * wraps around the servlet request for easy access
     * 
     * @param request the servlet request
     * @param injector the injector for the application
     */
    public VersionsStepRequest(final Injector injector) {
        this.userLocale = injector.getInstance(ClientSession.class).getLocale();
        this.versionResolver = injector.getInstance(VersionResolver.class);
        this.bundle = ResourceBundle.getBundle("HtmlBundle", this.userLocale);
    }

    /**
     * @return a table representing the book list
     */
    public String getVersionList() {
        final Books installed = Books.installed();
        final List<Book> bookList = installed.getBooks();
        final List<Book> other = new ArrayList<Book>();

        final SortedMap<String, List<Book>> booksByLanguage = new TreeMap<String, List<Book>>();
        for (final Book b : bookList) {
            final Language language = b.getLanguage();
            if (language != null) {
                List<Book> list = booksByLanguage.get(language.getCode());
                if (list == null) {
                    list = new ArrayList<Book>(16);
                    booksByLanguage.put(b.getLanguage().getCode(), list);
                }

                list.add(b);
            } else {
                other.add(b);
            }
        }

        final StringBuilder bookListData = new StringBuilder(1024 * 8);
        for (final Map.Entry<String, List<Book>> entry : booksByLanguage.entrySet()) {
            bookListData.append("<h3>");
            bookListData.append(new Locale(entry.getKey()).getDisplayLanguage(this.userLocale));
            bookListData.append("</h3>");
            outputVersions(bookListData, entry.getValue());
            bookListData.append("<p />");
        }

        bookListData.append("<h3>");
        bookListData.append(this.bundle.getString("uncategorised"));
        bookListData.append("</h3>");
        outputVersions(bookListData, other);
        bookListData.append("<p />");

        return bookListData.toString();
    }

    /**
     * Outputs the list of books
     * 
     * @param bundle
     * 
     * @param value the list of books
     */
    private void outputVersions(final StringBuilder bookList, final List<Book> books) {
        bookList.append("<table id='versionListTable' class='listingTable'>");
        bookList.append("<tr><th class='versionInitialsColumn'>");
        bookList.append(this.bundle.getString("installation_book_initials"));
        bookList.append("</th><th  class='versionNameColumn'>");
        bookList.append(this.bundle.getString("installation_book_name"));
        bookList.append("</th><th class='versionCategoryColumn'>");
        bookList.append(this.bundle.getString("installation_book_category"));
        bookList.append("</th></tr>");

        int ii = 0;
        for (final Book b : books) {
            final String initials = this.versionResolver.getShortName(b.getInitials());

            if (!BookCategory.BIBLE.equals(b.getBookCategory())
                    && !BookCategory.COMMENTARY.equals(b.getBookCategory())) {
                continue;
            }

            bookList.append("<tr class='");
            if (ii % 2 == 0) {
                bookList.append("even");
            }
            bookList.append("'>");

            bookList.append("<td>");

            bookList.append("<a href='/version.jsp?version=");
            bookList.append(initials);
            bookList.append("' class='info' title='");

            final String shortCopyright = (String) b.getBookMetaData().getProperty("ShortCopyright");
            if (StringUtils.isNotBlank(shortCopyright)) {
                bookList.append(shortCopyright);
            }

            bookList.append("'>&#x24d8; ");
            bookList.append(initials);
            bookList.append("</a>");
            bookList.append("</td>");

            bookList.append("<td>");
            bookList.append(b.getName());
            bookList.append("</td>");

            bookList.append("<td>");
            bookList.append(b.getBookCategory().getName());
            bookList.append("</td>");

            bookList.append("</tr>");
            ii++;
        }
        bookList.append("</table>");

    }
}
