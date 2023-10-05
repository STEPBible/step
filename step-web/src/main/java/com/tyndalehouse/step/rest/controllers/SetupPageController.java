package com.tyndalehouse.step.rest.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Pattern;

@Singleton
public class SetupPageController extends HttpServlet {
    private static final Pattern COMMA_SEPARATORS = Pattern.compile(",");
    private static String DEV_TOKEN = "UA-36285759-2";
    private static String LIVE_TOKEN = "UA-36285759-1";
    private static Logger LOGGER = LoggerFactory.getLogger(SetupPageController.class);
    private final ModuleController modules;

    @Inject
    public SetupPageController(
                               final ModuleController modules) {
        this.modules = modules;
    }

    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
        request.setAttribute("installedVersions", this.modules.getAllModules());
        request.getRequestDispatcher("/setup.jsp").forward(request, response);

    }

}
