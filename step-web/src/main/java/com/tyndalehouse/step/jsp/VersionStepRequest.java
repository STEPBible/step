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

import java.util.Iterator;
import java.util.ResourceBundle;

import javax.servlet.http.HttpServletRequest;

import com.tyndalehouse.step.core.models.SearchToken;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.Versification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.entities.impl.EntityManagerImpl;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.IOUtils;
import com.tyndalehouse.step.core.utils.JSwordUtils;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page
 * 
 * @author chrisburrell
 * 
 */
// CHECKSTYLE:OFF
public class VersionStepRequest {
    private final Injector injector;
    private Book book;
    private boolean success;
    private static final Logger LOG = LoggerFactory.getLogger(VersionStepRequest.class);
    private Versification versificationForVersion;
    private JSwordVersificationService versification;
    private Key globalKeyList;
    private EntityDoc[] results;
    private String miniPreface;
    private ResourceBundle bundle;

    /**
     * wraps around the servlet request for easy access
     * 
     * @param request the servlet request
     * @param injector the injector for the application
     */
    public VersionStepRequest(final Injector injector, final HttpServletRequest request) {
        this.injector = injector;

        try {
            final String version = request.getParameter("version");
            if (version != null) {
                this.versification = this.injector.getInstance(JSwordVersificationService.class);
                this.book = this.versification.getBookFromVersion(version);
                this.globalKeyList = this.book.getGlobalKeyList();
                this.versificationForVersion = this.versification.getVersificationForVersion(this.book);
                this.bundle = ResourceBundle.getBundle("HtmlBundle", injector
                        .getInstance(ClientSession.class).getLocale());
                this.success = true;

            }
        } catch (final Exception e) {
            // failed to retrieve information
            LOG.error("Failed to look up information on this version", e);
            this.success = false;
        }
    }

    /**
     * @return a table representing the book list
     */
    public String getBookList() {
        final StringBuilder bookList = new StringBuilder(1024 * 8);
        bookList.append("<table id='bookListTable' class='listingTable'>");
        bookList.append("<tr><th>");
        bookList.append(this.bundle.getString("bible_book_name"));
        bookList.append("</th><th>");
        bookList.append(this.bundle.getString("chapters_in_book"));
        bookList.append("</th></tr>");

        // output the preface
        int ii;
        if (this.getMiniPreface().length() != 0) {
            bookList.append("<tr class=\"even\"><td class=\"bookName\">");
            final String copyrightHolderIntro = this.bundle.getString("intro_from_copyright_holder");
            bookList.append(copyrightHolderIntro);
            bookList.append("</td><td><a href=\"/preface.jsp?version=");
            bookList.append(this.book.getInitials());
            bookList.append("\">");
            bookList.append(copyrightHolderIntro);
            bookList.append("</a></td></tr>");
            ii = 1;
        } else {
            ii = 0;
        }

        final Iterator<BibleBook> books = this.versificationForVersion.getBookIterator();

        while (books.hasNext()) {
            outputBook(bookList, this.versificationForVersion, books.next(), ii);
            ii++;
        }
        bookList.append("</table>");
        return bookList.toString();
    }

    public String getShortPromo() {
        return extractMetadata("ShortPromo");
    }

    public String getTyndaleInfo() {
        final EntityDoc[] results = getVersionInfo();

        if (results.length == 0) {
            return null;
        } else {
            return results[0].get("info");
        }
    }

    private EntityDoc[] getVersionInfo() {
        if (this.results == null) {

            final EntityManager manager = this.injector.getInstance(EntityManagerImpl.class);
            this.results = manager.getReader("versionInfo").searchExactTermBySingleField("version", 1,
                    this.book.getInitials());
        }
        return this.results;
    }

    /**
     * @return a text that the author would like us to include on our information page
     */
    public String getMiniPreface() {
        if (this.miniPreface == null) {
            this.miniPreface = readMiniPreface();
        }
        return this.miniPreface;
    }

    private String readMiniPreface() {
        final String fileName = "/com/tyndalehouse/step/core/data/create/versions/" + this.book.getInitials()
                + "_mini.txt";

        return IOUtils.readEntireClasspathResource(fileName);
    }

    /**
     * @param key key
     * @return the value of the metadata
     */
    private String extractMetadata(final String key) {
        final String property = (String) getBook().getBookMetaData().getProperty(key);
        if (property != null) {
            return property.replace("\\par", "<p />");
        }
        return "";
    }

    public String getAbout() {
        return extractMetadata("About");
    }

    public String getShortCopyright() {
        return extractMetadata("ShortCopyright") + " " + extractMetadata("Copyright");
    }

    public String getDistributionLicense() {
        return extractMetadata("DistributionLicense");
    }

    /**
     * @param bookList a list of books
     * @param v11n
     * @param bb bible book
     */
    private void outputBook(final StringBuilder bookList, final Versification v11n, final BibleBook bb,
            final int rowNum) {

        if (JSwordUtils.isIntro(bb)) {
            return;
        }

        final Key keyToBook = this.book.getValidKey(v11n.getShortName(bb));
        keyToBook.retainAll(this.globalKeyList);
        if (keyToBook.getCardinality() == 0) {
            return;
        }

        // append a new row
        bookList.append("<tr class='");
        if (rowNum % 2 == 0) {
            bookList.append("even");
        } else {
            bookList.append("odd");
        }
        bookList.append("'>");
        bookList.append("<td class='bookName'>");
        bookList.append(v11n.getLongName(bb));
        bookList.append("</td>");
        bookList.append("<td>");
        final int lastChapter = this.versificationForVersion.getLastChapter(bb);

        for (int ii = 1; ii <= lastChapter; ii++) {
            bookList.append("<a href='/?q=");
            bookList.append(SearchToken.VERSION);
            bookList.append('=');
            bookList.append(this.book.getInitials());
            bookList.append("|");
            bookList.append(SearchToken.REFERENCE);
            bookList.append('=');
            bookList.append(v11n.getShortName(bb));
            bookList.append(".");
            bookList.append(ii);
            bookList.append("'>");
            bookList.append(ii);
            bookList.append("</a> ");
        }

        bookList.append("</td>");
        bookList.append("</tr>");
    }

    /**
     * @return the book
     */
    public Book getBook() {
        return this.book;
    }

    /**
     * @return the success
     */
    public boolean isSuccess() {
        return this.success;
    }

}
