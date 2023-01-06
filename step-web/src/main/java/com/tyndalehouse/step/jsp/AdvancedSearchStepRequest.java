package com.tyndalehouse.step.jsp;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.models.ClientSession;

import javax.servlet.http.HttpServletRequest;
import java.util.ResourceBundle;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page.
 * 
 */
// CHECKSTYLE:OFF
public class AdvancedSearchStepRequest extends WebStepRequest {
    private static final Object[] PRIMARY_INCLUDE_WITHIN = new Object[] {
            "<input type=\"text\" class=\"textPrimaryIncludeRangedWords _m\" size=\"15\" />",
            "<input type=\"text\" class=\"textPrimaryWithinXWords _m\" size=\"2\" />" };

    private static final Object[] CLOSE_BY_INCLUDE_WITHIN = new Object[] {
            "<input type=\"text\" class=\"textCloseByIncludeRangedWords _m\" size=\"15\" />",
            "<input type=\"text\" class=\"textCloseByWithinXWords _m\" size=\"2\" />" };

    private static final Object[] RESTRICT = new Object[] {
            "<input type=\"text\" class=\"textRestriction showRanges drop _m\" size=\"15\" source=\"step.defaults.search.textual.availableRanges\" ro=\"false\"  />",
            "<input type=\"text\" class=\"textRestrictionExclude showRanges drop _m\" size=\"15\" source=\"step.defaults.search.textual.availableRanges\" ro=\"false\" default=\"\" />" };

    private static final String QUERY_PROXIMITY = "<input type=\"text\" class=\"textVerseProximity _m\" size=\"2\" />";

    private final ResourceBundle bundle;

    /**
     * Allows the generation of the search criteria HTML.
     * 
     * @param injector the injector for the application
     * @param request the servlet request
     */
    public AdvancedSearchStepRequest(final Injector injector, final HttpServletRequest request) {
        super(injector, request);
        this.bundle = ResourceBundle.getBundle("HtmlBundle", injector.getInstance(ClientSession.class)
                .getLocale());
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
