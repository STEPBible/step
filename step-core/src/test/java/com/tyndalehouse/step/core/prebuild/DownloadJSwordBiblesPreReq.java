package com.tyndalehouse.step.core.prebuild;

import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.book.install.sword.HttpSwordInstaller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

/**
 * Downloads the jsword bible versions
 */
public class DownloadJSwordBiblesPreReq {
    private static final Logger LOGGER = LoggerFactory.getLogger(DownloadJSwordBiblesPreReq.class);

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
