package com.tyndalehouse.step.jsp;

import java.util.ResourceBundle;

import javax.servlet.http.HttpServletRequest;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.models.ClientSession;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page.
 * 
 * @author chrisburrell
 */
// CHECKSTYLE:OFF
public class WordSearchStepRequest extends AbstractSearchStepRequest {
    private final Object[][] firstLine = new Object[][] {
            { "<input type='text' class='originalType drop _m' source=\"step.defaults.search.original.originalTypes\" ro=\"true\" size=\"20\" readonly=\"true\" />" },
            { "<input type='text' class='originalWord _m' title=\"%1$s\" />",
                    "word_search_original_word_warning" },
            { "<input type='text' class='originalForms drop originalAncient _m' source=\"step.defaults.search.original.originalForms\" ro=\"true\" size=\"20\" readonly=\"true\" />" } };

    private final Object[][] secondLine = new Object[][] {
            {
                    "<input type=\"text\" class=\"originalScope drop _m\" source=\"step.defaults.search.textual.availableRanges\" ro=\"false\" size=\"20\" readonly=\"true\" title=\"%1$s\" />",
                    "word_search_original_constrain_results" },
            { "<input type=\"text\" class=\"originalSorting drop _m\" source=\"step.defaults.search.original.originalSorting\" ro=\"true\" size=\"15\" readonly=\"true\" />" } };

    private final Object[][] values = new Object[][] { { "word_search_level_basic", this.firstLine },
            { "word_search_level_intermediate", this.secondLine } };

    /**
     * Allows the generation of the search criteria HTML.
     * 
     * @param injector the injector for the application
     * @param request the servlet request
     */
    public WordSearchStepRequest(final Injector injector, final HttpServletRequest request) {
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
