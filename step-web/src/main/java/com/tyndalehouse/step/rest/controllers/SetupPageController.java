package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.core.models.AbstractComplexSearch;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LexiconSuggestion;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.SearchToken;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.service.AppManagerService;
import com.tyndalehouse.step.core.service.LanguageService;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.tyndalehouse.step.core.utils.language.ContemporaryLanguageUtils;
import com.yammer.metrics.annotation.Timed;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.*;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * @author chrisburrell
 */
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
