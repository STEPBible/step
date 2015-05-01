/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
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
        assertNotNull("The ESV-THE module must be installed - please contact the dev team to obtain a manual copy.", Books.installed().getBook("ESV-THE"));

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
