package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.core.models.OsisWrapper;

import javax.inject.Inject;
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

    @Inject
    public SearchPageController(final SearchController search) {
        this.search = search;
    }
    
    @Override
    protected void doGet(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {
        final Object text = this.search.masterSearch(req.getParameter("q"));
        req.setAttribute("passage", text);
        resp.setCharacterEncoding("UTF-8");
        req.getRequestDispatcher("/responsive.jsp").include(req, resp);
    }
}
