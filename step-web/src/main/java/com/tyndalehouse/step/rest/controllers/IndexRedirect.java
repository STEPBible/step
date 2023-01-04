package com.tyndalehouse.step.rest.controllers;

import com.yammer.metrics.annotation.Timed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Singleton
public class IndexRedirect extends HttpServlet {
    private static Logger LOGGER = LoggerFactory.getLogger(SearchPageController.class);

    @Inject
    public IndexRedirect() {
    }

    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
        try {
            response.setStatus(301);
            response.setHeader("Location", request.getRequestURL().toString().replaceAll("index.jsp", "") + "?" + request.getQueryString());
            response.setHeader("Connection", "close");
        } catch (Exception ex) {
            LOGGER.error("Failed to operate redirect", ex);
            return;
        }
    }

}
