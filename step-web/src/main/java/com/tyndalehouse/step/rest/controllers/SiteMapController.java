package com.tyndalehouse.step.rest.controllers;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.tyndalehouse.step.core.service.AppManagerService;
import com.yammer.metrics.annotation.Timed;
import org.apache.lucene.search.MatchAllDocsQuery;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.versification.BibleBook;
import org.crosswire.jsword.versification.Versification;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.utils.JSwordUtils;

/**
 * Gets the sitemap for STEP.
 */
@Singleton
public class SiteMapController extends HttpServlet {
    private static final long serialVersionUID = 5514500537490695745L;
    private final ModuleController modules;
    private String stepBase;
    private final JSwordVersificationService versificationService;
    private final AppManagerService appManagerService;
    private final EntityIndexReader definitions;

    /** Site map */
    private enum SiteMapType {
        SITEMAP_BIBLE,
        SITEMAP_COMMENTARY,
    }

    /**
     * Instantiates a new site map controller.
     * 
     * @param modules the modules
     * @param versificationService the versification service
     */
    @Inject
    public SiteMapController(final ModuleController modules,
            final JSwordVersificationService versificationService,
            final EntityManager entityManager,
            final AppManagerService appManagerService) {
        this.modules = modules;
        this.versificationService = versificationService;
        this.appManagerService = appManagerService;
        this.definitions = entityManager.getReader("definition");
    }

    @Override
    @Timed(name = "sitemap", group = "analysis", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    protected void doGet(final HttpServletRequest req, final HttpServletResponse response)
            throws ServletException, IOException {
        if (this.stepBase == null) {
            this.stepBase = String.format("https://%s/", appManagerService.getAppDomain());
        }

        final String filePath = req.getRequestURL().toString();

            // get the last bit of the path
            final String siteNameWithExtension = filePath.substring(filePath.lastIndexOf('/') + 1);

            response.setHeader("Content-Disposition", "attachment; filename=" + siteNameWithExtension);
            response.getOutputStream().write(getSiteMap());
    }

    /**
     * Close site map index.
     * 
     * @param siteMap the site map
     */
    private void closeSiteMapIndex(final StringBuilder siteMap) {
        siteMap.append("</sitemapindex>");
    }

    /**
     * Inits the site map index.
     * 
     * @param siteMap the site map
     */
    private void initSiteMapIndex(final StringBuilder siteMap) {
        siteMap.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?><sitemapindex xmlns=\"https://www.sitemaps.org/schemas/sitemap/0.9\">");
    }

    /**
     * Gets the site map.
     * 
     * @param mapType the map type
     * @param specifier the specifier that says which initial should be generated
     * @return the site map
     */
    public byte[] getSiteMap() {

        final StringBuilder siteMap = new StringBuilder(10 * 1024 * 1024);
        initSiteMap(siteMap);

        addVersions(siteMap);

        closeSiteMap(siteMap);
        try {
            return siteMap.toString().getBytes("UTF-8");
        } catch (final UnsupportedEncodingException e) {
            throw new StepInternalException("Unable to convert to UTF-8", e);
        }
    }

    /**
     * Inits the site map.
     * 
     * @param siteMap the site map
     */
    private void initSiteMap(final StringBuilder siteMap) {
        siteMap.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"https://www.sitemaps.org/schemas/sitemap/0.9\">");
    }

    /**
     * Close site map.
     * 
     * @param siteMap the site map
     */
    private void closeSiteMap(final StringBuilder siteMap) {
        siteMap.append("</urlset>");
    }

    /**
     * Adds the versions.
     * 
     * @param siteMap the site map
     * @param category the category
     * @param specifier the letter that should be included
     */
    private void addVersions(final StringBuilder siteMap) {
        final List<BibleVersion> allModules = this.modules.getAllModules();

        for (final BibleVersion version : allModules) {
            addVersion(siteMap, version);
        }
    }

    /**
     * Adds the version of the Bible
     * 
     * @param siteMap the site map
     * @param version the version
     */
    private void addVersion(final StringBuilder siteMap, final BibleVersion version) {
        boolean mainFile = false;
        final Book book = this.versificationService.getBookFromVersion(version.getInitials());
        final Versification versificationForVersion = this.versificationService
                .getVersificationForVersion(book);
        final Key globalKeyList = book.getGlobalKeyList();

        final Iterator<BibleBook> books = versificationForVersion.getBookIterator();

        while (books.hasNext()) {
            final BibleBook bb = books.next();
            if (JSwordUtils.isIntro(bb)) {
                continue;
            }
            Key keyToBook;
            try {
                keyToBook = book.getValidKey(versificationForVersion.getShortName(bb));
                keyToBook.retainAll(globalKeyList);
                if (keyToBook.getCardinality() == 0) {
                    continue;
                }
            } catch (final Exception ex) {
                return;
            }

            // if we got here, then we have been able to read the module
            if (!mainFile) {
                addUrl(siteMap, null, null, null, "version.jsp?version=", version.getInitials());
                mainFile = true;
            }
        }
    }

    /**
     * Adds the url to the sitemap
     * 
     * @param siteMap the site map
     * @param lastmod the lastmod
     * @param changefreq the changefreq
     * @param priority the priority
     * @param locArgs the loc args
     */
    private void addUrl(final StringBuilder siteMap, final String lastmod, final String changefreq,
            final String priority, final String... locArgs) {
        siteMap.append("<url>");
        siteMap.append("<loc>");
        siteMap.append(this.stepBase);
        for (final String loc : locArgs) {
            siteMap.append(loc);
        }
        siteMap.append("</loc>");

        if (lastmod != null) {
            siteMap.append("<lastmod>");
            siteMap.append(lastmod);
            siteMap.append("</lastmod>");
        }

        if (changefreq != null) {
            siteMap.append("<changefreq>");
            siteMap.append("</changefreq>");
        }
        if (priority != null) {
            siteMap.append("<priority>");
            siteMap.append(priority);
            siteMap.append("</priority>");
        }
        siteMap.append("</url>");
    }
}
