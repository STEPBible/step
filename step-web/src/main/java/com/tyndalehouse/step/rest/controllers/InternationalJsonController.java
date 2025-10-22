package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.Language;
import com.tyndalehouse.step.core.service.LanguageService;
import com.tyndalehouse.step.rest.framework.FrontController;
import com.tyndalehouse.step.rest.framework.JsonResourceBundle;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

/**
 * Serves the images by downloading them from a remote source if they do not already exist.
 */
@Singleton
public class InternationalJsonController extends HttpServlet {
    private static final long serialVersionUID = 1721159652548642069L;
    private static final Map<Locale, String> BUNDLES = new HashMap<Locale, String>();
    private final ObjectMapper objectMapper;
    private final Provider<ClientSession> clientSessionProvider;
    private final ModuleController modules;
    private final LanguageService languageService;

    @Inject
    public InternationalJsonController(final Provider<ObjectMapper> objectMapperProvider,
                                       final Provider<ClientSession> clientSessionProvider,
                                       final ModuleController modules,
                                       final LanguageService languageService) {
        this.clientSessionProvider = clientSessionProvider;
        this.objectMapper = objectMapperProvider.get();
        this.modules = modules;
        this.languageService = languageService;
    }
    
    @Override
    protected void doGet(final HttpServletRequest req, 
                         final HttpServletResponse response)
            throws ServletException, IOException {

        Locale locale;
        final String pathInfo = req.getPathInfo();
        String langParameter = "";
        if ((pathInfo != null) && (pathInfo.charAt(0) == '/')) {
            int pos = pathInfo.indexOf(".", 1);
            if ((pos > 2) && (pos < 7)) langParameter = pathInfo.substring(1, pos).toLowerCase();
        }
        else langParameter = req.getParameter("lang");
        if (isNotBlank(langParameter)) {
            if (langParameter.equalsIgnoreCase("zh_tw")) locale = new Locale("zh", "TW");
            else locale = new Locale(langParameter);
        } else {
            locale = clientSessionProvider.get().getLocale();
        }
        String qualifiedResponse = BUNDLES.get(locale);
        if (qualifiedResponse == null) {
            qualifiedResponse = readBundle(locale, "HtmlBundle", "InteractiveBundle", "SearchBundle");
            BUNDLES.put(locale, qualifiedResponse);
        }

        response.setCharacterEncoding(FrontController.UTF_8_ENCODING);
        response.setLocale(locale);
        response.setContentType("text/js");
        response.getOutputStream().write("window.bibleVersions=[".getBytes(FrontController.UTF_8_ENCODING));
        List<BibleVersion> allMods = modules.getAllModules();
        // Converting to array will save 2/3 size of the Bible module information to send to the browser
        // This information is sent to the browser everytime it requests a page from the web server.
        // In 2023, this reduced from from 190K to 68K.
        for (int i = 0; i < allMods.size(); i++) {
            BibleVersion currentMod = allMods.get(i);
            String[] moduleInArray = new String[8];
            moduleInArray[0] = currentMod.getInitials();
            moduleInArray[1] = currentMod.getName();
            moduleInArray[2] = currentMod.getOriginalLanguage();
            moduleInArray[3] = currentMod.getLanguageCode();
            moduleInArray[4] = currentMod.getCategory();
            moduleInArray[5] = currentMod.getLanguageName();
            moduleInArray[6] = currentMod.getShortInitials();
            // Use one character (T or F) to represent true or false for each field.
            moduleInArray[7] =  (currentMod.isHasStrongs() ? "T" : "F") +
                                (currentMod.isHasMorphology() ? "T" : "F") +
                                (currentMod.isHasRedLetter() ? "T" : "F") +
                                (currentMod.isHasNotes() ? "T" : "F") +
                                (currentMod.isHasHeadings() ? "T" : "F") +
                                (currentMod.isQuestionable() ? "T" : "F") +
                                (currentMod.isHasSeptuagintTagging() ? "T" : "F") +
                                currentMod.getHasAllNTOTorBoth(); // "B" = both OT & NT, "N" = NT, "O" = OT, " " = not regular books
            response.getOutputStream().write(objectMapper.writeValueAsString(moduleInArray).getBytes(FrontController.UTF_8_ENCODING));
            if (i < allMods.size() - 1)
                response.getOutputStream().write(",".getBytes(FrontController.UTF_8_ENCODING)); // separator
        }
        allMods = null;
        response.getOutputStream().write("];".getBytes(FrontController.UTF_8_ENCODING));
        response.getOutputStream().write("window.availLangs=[".getBytes(FrontController.UTF_8_ENCODING));
        List<Language> allLanguages = this.languageService.getAvailableLanguages();
        // Converting to array will save 2/3 size of the Bible module information to send to the browser
        // This information is sent to the browser everytime it requests a web page from the web server.
        for (int i = 0; i < allLanguages.size(); i++) {
            Language curLang = allLanguages.get(i);
            String[] langsInArray = new String[4];
            langsInArray[0] = curLang.getCode();
            langsInArray[1] = curLang.getOriginalLanguageName();
            langsInArray[2] = curLang.getUserLocaleLanguageName();
            // Use one character (T or F) to represent true or false for each field.
            langsInArray[3] = (curLang.isComplete() ? "T" : "F") +
                    (curLang.isPartial() ? "T" : "F");
            response.getOutputStream().write(objectMapper.writeValueAsString(langsInArray).getBytes(FrontController.UTF_8_ENCODING));
            if (i < allLanguages.size() - 1)
                response.getOutputStream().write(",".getBytes(FrontController.UTF_8_ENCODING)); // separator
        }
        response.getOutputStream().write("];".getBytes(FrontController.UTF_8_ENCODING));
        response.getOutputStream().write(qualifiedResponse.getBytes(FrontController.UTF_8_ENCODING));
        response.flushBuffer();
        response.getOutputStream().close();
    }

    /**
     * Read bundle.
     *
     * @param locale the locale
     * @return the string
     */
    private String readBundle(final Locale locale, final String... bundleNames) {
        List<ResourceBundle> bundles = new ArrayList<ResourceBundle>(bundleNames.length);
        for (String b : bundleNames) {
            bundles.add(ResourceBundle.getBundle(b, locale));
        }

        final JsonResourceBundle jsonResourceBundle = new JsonResourceBundle(bundles);
        String jsonResponse;

        try {
            jsonResponse = objectMapper.writeValueAsString(jsonResourceBundle);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to read messages", e);
        }

        return "var __s = " + jsonResponse;
    }

    /**
     * Used for debugging, to reset the international JSON
     */
    public void resetCache() {
        //double check that we are actually in dev mode as well
        if(Boolean.TRUE.equals(Boolean.getBoolean("step.development"))) {
            BUNDLES.clear();
        }
    }
}
