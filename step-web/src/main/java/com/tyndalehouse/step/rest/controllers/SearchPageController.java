package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils;
import com.tyndalehouse.step.models.ModulesForLanguageUser;
import org.codehaus.jackson.map.ObjectMapper;

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
    private final SearchController search;
    private final Provider<ObjectMapper> objectMapper;
    private final Provider<ClientSession> clientSessionProvider;

    @Inject
    public SearchPageController(final SearchController search, 
                                Provider<ObjectMapper> objectMapper,
                                Provider<ClientSession> clientSessionProvider) {
        this.search = search;
        this.objectMapper = objectMapper;
        this.clientSessionProvider = clientSessionProvider;
    }

    @Override
    protected void doGet(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {
        final Object text = this.search.masterSearch(
                req.getParameter("q"),
                req.getParameter("options"),
                req.getParameter("display"),
                req.getParameter("page"),
                req.getParameter("filter"),
                req.getParameter("context"));

        if (text instanceof OsisWrapper) {
            final OsisWrapper osisWrapper = (OsisWrapper) text;
            req.setAttribute("passageText", osisWrapper.getValue());
            req.setAttribute("searchType", osisWrapper.getSearchType().name());
            osisWrapper.setValue(null);
            req.setAttribute("passageModel", objectMapper.get().writeValueAsString(text));
        }

        //set the language attributes once
        final Locale userLocale = this.clientSessionProvider.get().getLocale();
        req.setAttribute("languageCode", userLocale.getLanguage());
        req.setAttribute("languageName", ContemporaryLanguageUtils.capitaliseFirstLetter(userLocale
                .getDisplayLanguage(userLocale)).replace("\"", ""));
        
        
        resp.setContentType("text/html");
        resp.setCharacterEncoding("UTF-8");
//        if (!req.getRequestURI().endsWith("index.jsp") && !"/".equals(req.getRequestURI())) {
            req.getRequestDispatcher("/index.jsp").include(req, resp);
//        }
    }
}
