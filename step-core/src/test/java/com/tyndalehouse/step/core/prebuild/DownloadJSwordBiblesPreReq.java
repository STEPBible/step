package com.tyndalehouse.step.core.prebuild;

import java.util.ArrayList;
import java.util.List;

import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.book.install.sword.HttpSwordInstaller;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.service.impl.JSwordServiceImpl;

/**
 * Downloads the jsword bible versions
 * 
 * @author Chris
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
        final String[] modules = new String[] { "KJV", "ESV", "Byz", "StrongsGreek", "StrongsHebrew",
                "Robinson" };

        final JSwordService jsword = new JSwordServiceImpl(getInstallers());

        for (final String moduleInitials : modules) {
            if (!jsword.isInstalled(moduleInitials)) {
                LOGGER.debug("Installing [{}] to install: ", moduleInitials);
                jsword.installBook(moduleInitials);
            }
        }

        for (final String moduleInitials : modules) {
            // now wait for book to install
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

        // reload if never used before
        if (installer.getBooks().size() == 0) {
            installer.reloadBookList();
        }

        installers.add(installer);
        return installers;
    }
}
