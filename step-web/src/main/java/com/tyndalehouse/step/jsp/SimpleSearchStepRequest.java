package com.tyndalehouse.step.jsp;

import java.util.ResourceBundle;

import javax.servlet.http.HttpServletRequest;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.models.ClientSession;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page.
 * 
 */
// CHECKSTYLE:OFF
public class SimpleSearchStepRequest extends AbstractSearchStepRequest {
    final Object[][] firstLine = new Object[][] {
            { "<input type=\"text\" class=\"simpleTextTypePrimary drop _m\" source=\"step.defaults.search.textual.simpleTextTypes\" ro=\"true\" />" },
            { "<input type=\"text\" class=\"simpleTextCriteria _m\" />" },
            { "<input type=\"text\" class=\"simpleTextScope drop _m\" title=\"%1$s\" source=\"step.defaults.search.textual.availableRanges\" ro=\"false\" />",
                    "simple_text_search_scope_of_search_help" } };

    private final Object[][] secondLine = new Object[][] {
            { "<input type=\"text\" class=\"simpleTextInclude drop _m\" size=\"13\" source=\"step.defaults.search.textual.simpleTextIncludes\" ro=\"true\" />" },
            { "<input type=\"text\" class=\"simpleTextTypeSecondary simpleTextSecondaryTypes drop _m\" source=\"step.defaults.search.textual.simpleTextSecondaryTypes\" ro=\"true\" />" },
            { "<input type=\"text\" class=\"simpleTextSecondaryCriteria _m\" />" },
            { "<input type=\"text\" class=\"simpleTextProximity drop _m\" source=\"step.defaults.search.textual.simpleTextProximities\" ro=\"true\" />" } };

    private final Object[][] values = new Object[][] { { "simple_text_search_level_basic", this.firstLine },
            { "simple_text_search_level_intermediate", this.secondLine } };

    /**
     * Allows the generation of the search criteria HTML.
     * 
     * @param injector the injector for the application
     * @param request the servlet request
     */
    public SimpleSearchStepRequest(final Injector injector, final HttpServletRequest request) {
        super(injector, request);

        final ResourceBundle bundle = ResourceBundle.getBundle("HtmlBundle",
                injector.getInstance(ClientSession.class).getLocale());
        localize(bundle, this.firstLine);
        localize(bundle, this.secondLine);

    }

    @Override
    Object[][] getValues() {
        return this.values;
    }
}
