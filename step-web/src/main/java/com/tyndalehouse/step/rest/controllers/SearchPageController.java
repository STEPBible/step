package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Locale;

/**
 * @author chrisburrell
 */
@Singleton
public class SearchPageController extends HttpServlet {
    private static Logger LOGGER = LoggerFactory.getLogger(SearchPageController.class);
    private final SearchController search;
    private final ModuleController modules;
    private final Provider<ObjectMapper> objectMapper;
    private final Provider<ClientSession> clientSessionProvider;

    @Inject
    public SearchPageController(final SearchController search,
                                final ModuleController modules,
                                Provider<ObjectMapper> objectMapper,
                                Provider<ClientSession> clientSessionProvider) {
        this.search = search;
        this.modules = modules;
        this.objectMapper = objectMapper;
        this.clientSessionProvider = clientSessionProvider;
    }

    @Override
    protected void doGet(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {
        Object text;
        try {
            text = doSearch(req);
            setupRequestContext(req, text);
            setupResponseContext(resp);
        } catch (Exception exc) {
            LOGGER.warn(exc.getMessage(), exc);
        } finally {
            req.getRequestDispatcher("/index.jsp").include(req, resp);
        }
    }

    /**
     * Sets up default attributes on response
     *
     * @param resp the response
     */
    private void setupResponseContext(final HttpServletResponse resp) {
        resp.setContentType("text/html");
        resp.setCharacterEncoding("UTF-8");
    }

    /**
     * Sets up the request context for use in the JSTL parsing
     *
     * @param req  the request
     * @param data the osisWrapper
     * @throws IOException
     */
    private void setupRequestContext(final HttpServletRequest req, final Object data) throws IOException {
        //global settings
        //set the language attributes once
        final Locale userLocale = this.clientSessionProvider.get().getLocale();
        req.setAttribute("languageCode", userLocale.getLanguage());
        req.setAttribute("languageName", ContemporaryLanguageUtils.capitaliseFirstLetter(userLocale
                .getDisplayLanguage(userLocale)).replace("\"", ""));
        req.setAttribute("versions", objectMapper.get().writeValueAsString(modules.getAllModules()));

        //specific to passages
        if (data instanceof OsisWrapper) {
            final OsisWrapper osisWrapper = (OsisWrapper) data;
            req.setAttribute("passageText", osisWrapper.getValue());
            req.setAttribute("searchType", osisWrapper.getSearchType().name());
            osisWrapper.setValue(null);
            req.setAttribute("passageModel", objectMapper.get().writeValueAsString(osisWrapper));
        } else if (data instanceof SearchResult) {
            final SearchResult results = (SearchResult) data;
            req.setAttribute("searchResults", results.getResults());
            results.setResults(null);
            req.setAttribute("passageModel", objectMapper.get().writeValueAsString(results));
        }
    }

    private Object doSearch(final HttpServletRequest req) {
        Object text;
        try {
            text = this.search.masterSearch(
                    req.getParameter("q"),
                    req.getParameter("options"),
                    req.getParameter("display"),
                    req.getParameter("page"),
                    req.getParameter("filter"),
                    req.getParameter("context"));
        } catch (Exception ex) {
            LOGGER.warn(ex.getMessage(), ex);
            text = getDefaultPassage();
        }
        return text;
    }

    /**
     * Defaults to Matt.1 if can't do anything else
     *
     * @return Matt 1 or something else
     */
    private Object getDefaultPassage() {
        Object text;
        try {
            text = this.search.masterSearch("reference=Mat.1|version=ESV", "HNV");
        } catch (Exception e) {
            text = new OsisWrapper("", null, new String[]{"en"}, null, "ESV", InterlinearMode.NONE, "");
        }
        return text;
    }
}
