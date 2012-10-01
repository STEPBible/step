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
package com.tyndalehouse.step.jsp;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;

import org.crosswire.common.util.Language;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.book.Books;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page
 * 
 * @author chrisburrell
 * 
 */
// CHECKSTYLE:OFF
public class VersionsStepRequest {
    private final HttpServletRequest request;

    /**
     * wraps around the servlet request for easy access
     * 
     * @param request the servlet request
     * @param injector the injector for the application
     */
    public VersionsStepRequest(final Injector injector, final HttpServletRequest request) {
        this.request = request;
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

        final Locale userLocale = this.request.getLocale();
        final StringBuilder bookListData = new StringBuilder(1024 * 8);
        for (final Map.Entry<String, List<Book>> entry : booksByLanguage.entrySet()) {
            bookListData.append("<h3>");
            bookListData.append(new Locale(entry.getKey()).getDisplayLanguage(userLocale));
            bookListData.append("</h3>");
            outputVersions(bookListData, entry.getValue());
            bookListData.append("<p />");
        }

        bookListData.append("<h3>");
        bookListData.append("Uncategorized");
        bookListData.append("</h3>");
        outputVersions(bookListData, other);
        bookListData.append("<p />");

        return bookListData.toString();
    }

    /**
     * Outputs the list of books
     * 
     * @param value the list of books
     */
    private void outputVersions(final StringBuilder bookList, final List<Book> books) {
        bookList.append("<table id='versionListTable' class='listingTable'>");
        bookList.append("<tr><th class='versionInitialsColumn'>Initials</th><th  class='versionNameColumn'>Name</th><th class='versionCategoryColumn'>Category</th></tr>");
        int ii = 0;
        for (final Book b : books) {
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

            bookList.append("<a href='version.jsp?version=");
            bookList.append(b.getInitials());
            bookList.append("' class='info' title='");

            final String shortCopyright = (String) b.getBookMetaData().getProperty("ShortCopyright");
            if (StringUtils.isNotBlank(shortCopyright)) {
                bookList.append(shortCopyright);
            }

            bookList.append("'>&#x24d8;</a> ");
            bookList.append(b.getInitials());

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
