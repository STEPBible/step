package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.core.models.OsisWrapper;
import org.codehaus.jackson.map.ObjectMapper;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author chrisburrell
 */
@Singleton
public class SearchPageController extends HttpServlet {
    private final SearchController search;
    private final Provider<ObjectMapper> objectMapper;

    @Inject
    public SearchPageController(final SearchController search, Provider<ObjectMapper> objectMapper) {
        this.search = search;
        this.objectMapper = objectMapper;
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
        
        if(text instanceof OsisWrapper) {
            final OsisWrapper osisWrapper = (OsisWrapper) text;
            req.setAttribute("passageText", osisWrapper.getValue());
            req.setAttribute("searchType", osisWrapper.getSearchType().name());
            osisWrapper.setValue(null);
            req.setAttribute("passageModel", objectMapper.get().writeValueAsString(text));
        }
        
        resp.setCharacterEncoding("UTF-8");
        req.getRequestDispatcher("/responsive.jsp").include(req, resp);
    }
}
