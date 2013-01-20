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

import java.util.Locale;
import java.util.ResourceBundle;

import javax.servlet.http.HttpServletRequest;

import com.google.inject.Injector;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page.
 * 
 * @author chrisburrell
 */
// CHECKSTYLE:OFF
public class AdvancedSearchStepRequest extends WebStepRequest {
    private static final Object[] PRIMARY_INCLUDE_WITHIN = new Object[] {
            "<input type=\"text\" class=\"textPrimaryIncludeRangedWords\" size=\"15\" />",
            "<input type=\"text\" class=\"textPrimaryWithinXWords\" size=\"2\" />" };

    private static final Object[] CLOSE_BY_INCLUDE_WITHIN = new Object[] {
            "<input type=\"text\" class=\"textCloseByIncludeRangedWords\" size=\"15\" />",
            "<input type=\"text\" class=\"textCloseByWithinXWords\" size=\"2\" />" };

    private static final Object[] RESTRICT = new Object[] {
            "<input type=\"text\" class=\"textRestriction showRanges\" size=\"15\" />",
            "<input type=\"text\" class=\"textRestrictionExclude showRanges\" size=\"15\" />" };

    private static final String QUERY_PROXIMITY = "<input type=\"text\" class=\"textVerseProximity\" size=\"2\" />";

    private final ResourceBundle bundle;

    /**
     * Allows the generation of the search criteria HTML.
     * 
     * @param injector the injector for the application
     * @param request the servlet request
     * @param userLocale the user locale
     */
    public AdvancedSearchStepRequest(final Injector injector, final HttpServletRequest request,
            final Locale userLocale) {
        super(injector, request);
        this.bundle = ResourceBundle.getBundle("HtmlBundle", userLocale);
    }

    /**
     * Gets the proximity between queries.
     * 
     * @return the proximity between queries
     */
    public String getProximityBetweenQueries() {
        return String.format(this.bundle.getString("advanced_search_first_and_second_proximity"),
                QUERY_PROXIMITY);
    }

    /**
     * Gets the primary include these words.
     * 
     * @return the primary include these words
     */
    public String getPrimaryIncludeTheseWords() {
        final String format = String.format(
                this.bundle.getString("advanced_search_include_words_within_range_of_each_other"),
                PRIMARY_INCLUDE_WITHIN);
        return getIncludeWithinRow(format, true);
    }

    /**
     * Gets the close by include these words.
     * 
     * @return the close by include these words
     */
    public String getCloseByIncludeTheseWords() {
        final String format = String.format(
                this.bundle.getString("advanced_search_include_words_within_range_of_each_other"),
                CLOSE_BY_INCLUDE_WITHIN);
        return getIncludeWithinRow(format, true);
    }

    /**
     * Gets the restrict search.
     * 
     * @return the restrict search
     */
    public String getRestrictSearch() {
        final String format = String.format(this.bundle.getString("advanced_search_restrict_search"),
                RESTRICT);
        return getIncludeWithinRow(format, false);
    }

    /**
     * Gets the include within row.
     * 
     * @param format the format
     * @param doubleSpanLast TODO
     * @return the include within row
     */
    private String getIncludeWithinRow(final String format, final boolean doubleSpanLast) {
        final String[] split = format.split("\\|");

        // build the row
        final StringBuilder row = new StringBuilder(1024);
        for (int ii = 0; ii < split.length; ii++) {
            if (!doubleSpanLast || ii < split.length - 1) {
                row.append("<td>");
            } else {
                row.append("<td colspan=2>");
            }
            row.append(split[ii]);
            row.append("</td>");
        }

        return row.toString();
    }
}
