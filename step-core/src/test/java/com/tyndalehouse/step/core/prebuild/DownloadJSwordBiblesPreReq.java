package com.tyndalehouse.step.core.prebuild;

import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static junit.framework.Assert.assertNotNull;

import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.book.install.sword.HttpSwordInstaller;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.service.jsword.impl.JSwordModuleServiceImpl;
import com.tyndalehouse.step.core.utils.TestUtils;

/**
 * Downloads the jsword bible versions
 * 
 * @author chrisburrell
 * 
 */
public class DownloadJSwordBiblesPreReq {
    private static final Logger LOGGER = LoggerFactory.getLogger(DownloadJSwordBiblesPreReq.class);

    /**
     * downloads some bibles so that tests can pass
     * 
     * @throws InstallException uncaught exception
     */
    @Test
    public void installDefaultJSwordDefaultBibleVersions() throws InstallException {
        assertNotNull("The ESV_th module must be installed - please contact the dev team to obtain a manual copy.", Books.installed().getBook("ESV_th"));

        final String[] modules = new String[] { "KJV", "Byz", "FreSegond", "NETfree", "Tisch", "YLT",
                "ASV", "Montgomery", "FreCrampon", "SBLGNT", "TR", "WHNU", "OSMHB", "Chiuns" };

        final JSwordModuleServiceImpl jsword = new JSwordModuleServiceImpl(getInstallers(),
                new ArrayList<Installer>(0), TestUtils.mockVersificationService(), TestUtils.mockVersionResolver());

        for (final String moduleInitials : modules) {
            LOGGER.debug("Checking [{}] for install", moduleInitials);
            if (!jsword.isInstalled(moduleInitials)) {
                LOGGER.debug("Installing [{}] to install: ", moduleInitials);
                jsword.installBook(moduleInitials);

                while (!jsword.isInstalled(moduleInitials)) {
                    LOGGER.debug("Waiting for [{}] to install: ", moduleInitials);
                    try {
                        Thread.sleep(1000);
                    } catch (final InterruptedException e) {
                        // we ignore this and wait some more
                        LOGGER.warn("Download was interrupted: [{}]", moduleInitials);
                    }
                }
            }

            LOGGER.debug("Checking [{}] for index: ", moduleInitials);
            if(!jsword.isIndexed(moduleInitials)) {
                LOGGER.debug("Indexing [{}]", moduleInitials);
                jsword.index(moduleInitials);
            }

            if(!jsword.isIndexed("ESV_th")) {
                jsword.index("ESV_th");
            }
        }
    }

    /**
     * Sets up the installers to download Sword resources from
     * 
     * @return a list of valid installers
     * @throws InstallException an exception if it occurs
     */
    private List<Installer> getInstallers() throws InstallException {
        final List<Installer> installers = new ArrayList<Installer>();
        final HttpSwordInstaller installer = new HttpSwordInstaller();
        installer.setHost("www.crosswire.org");
        installer.setPackageDirectory("/ftpmirror/pub/sword/packages/rawzip");
        installer.setCatalogDirectory("/ftpmirror/pub/sword/raw");

        final String proxyHost = System.getProperty("http.proxyHost");
        final String proxyPort = System.getProperty("http.proxyPort");
        LOGGER.info("Using [{}:{}]", proxyHost, proxyPort);

        if (isNotBlank(proxyHost)) {
            installer.setProxyHost(proxyHost);
        }

        if (isNotBlank(proxyPort)) {
            installer.setProxyPort(Integer.parseInt(proxyPort));
        }

        // reload if never used before
        if (installer.getBooks().size() == 0) {
            installer.reloadBookList();
        }

        installers.add(installer);
        return installers;
    }
}
