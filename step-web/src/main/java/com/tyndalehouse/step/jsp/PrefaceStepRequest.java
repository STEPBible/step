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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.servlet.http.HttpServletRequest;

import org.crosswire.jsword.book.Book;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.IOUtils;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page
 * 
 * @author chrisburrell
 * 
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
        InputStream s = null;
        InputStreamReader in = null;
        BufferedReader reader = null;

        try {
            s = getClass().getResourceAsStream(
                    "/com/tyndalehouse/step/core/data/create/versions/" + this.book.getInitials() + ".txt");
            if (s == null) {
                return "";
            }

            in = new InputStreamReader(s, "UTF-8");
            reader = new BufferedReader(in);
            final StringBuilder sb = new StringBuilder(64000);

            final char[] chars = new char[8192];
            int l = -1;
            while ((l = reader.read(chars)) != -1) {
                sb.append(chars, 0, l);
            }

            return sb.toString();
        } catch (final IOException e) {
            LOG.warn("Unable to read file for resource: " + this.book.getInitials());
            return "";
        } finally {
            IOUtils.closeQuietly(in);
            IOUtils.closeQuietly(reader);
            IOUtils.closeQuietly(s);
        }
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
