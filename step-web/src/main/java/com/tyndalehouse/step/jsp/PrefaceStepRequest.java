package com.tyndalehouse.step.jsp;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.IOUtils;
import org.crosswire.jsword.book.Book;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page
 */
// CHECKSTYLE:OFF
public class PrefaceStepRequest {
    private Book book;
    private static final Logger LOG = LoggerFactory.getLogger(PrefaceStepRequest.class);
    private JSwordVersificationService versification;
    private boolean success;

    /**
     * wraps around the servlet request for easy access
     * 
     * @param request the servlet request
     * @param injector the injector for the application
     */
    public PrefaceStepRequest(final Injector injector, final HttpServletRequest request) {

        try {
            final String version = request.getParameter("version");
            if (version != null) {
                this.versification = injector.getInstance(JSwordVersificationService.class);
                this.book = this.versification.getBookFromVersion(version);
                this.success = true;
            } else {
                this.success = false;
            }
        } catch (final Exception e) {
            // failed to retrieve information
            LOG.error("Failed to look up information on this version", e);
        }
    }

    /**
     * @return a text that the author would like us to include on our information page
     */
    public String getPreface() {
        final String fileName = "/com/tyndalehouse/step/core/data/create/versions/" + this.book.getInitials()
                + ".txt";
        return IOUtils.readEntireClasspathResource(fileName);
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
