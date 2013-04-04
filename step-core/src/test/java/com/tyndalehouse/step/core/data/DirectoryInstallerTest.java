package com.tyndalehouse.step.core.data;

import static org.junit.Assert.fail;

import java.io.File;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import org.crosswire.common.util.Reporter;
import org.crosswire.common.util.ReporterEvent;
import org.crosswire.common.util.ReporterListener;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.install.Installer;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.service.jsword.impl.JSwordModuleServiceImpl;

/**
 * Test installations from a directory
 * 
 * @author chrisburrell
 * 
 */
public class DirectoryInstallerTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(DirectoryInstallerTest.class);

    /**
     * test simple directory installation
     * 
     * @throws URISyntaxException an uncaught exception
     * @throws BookException an uncaught exception
     * @throws InterruptedException an interrupted exception
     **/
    @Test
    public void testDirectoryInstallation() throws URISyntaxException, BookException, InterruptedException {
        final List<Installer> installers = new ArrayList<Installer>(1);
        installers.add(new DirectoryInstaller(new File(getClass().getResource(
                "/com/tyndalehouse/step/core/data/").toURI()).getAbsolutePath()));

        final Book tempEsv = Books.installed().getBook("ESVTemp");
        if (tempEsv != null) {
            Books.installed().removeBook(tempEsv);
        }

        final JSwordModuleServiceImpl jSwordModuleServiceImpl = new JSwordModuleServiceImpl(null, installers);
        jSwordModuleServiceImpl.setOffline(true);
        jSwordModuleServiceImpl.reloadInstallers();

        final Thread main = Thread.currentThread();
        Reporter.addReporterListener(new ReporterListener() {

            @Override
            public void reportMessage(final ReporterEvent ev) {
                LOGGER.info(ev.getMessage());
            }

            @Override
            public void reportException(final ReporterEvent ev) {
                LOGGER.error(ev.getMessage(), ev.getException());
                main.interrupt();

            }
        });

        jSwordModuleServiceImpl.installBook("ESVTemp");

        // wait until installed
        long maxWait = 10000;
        while (maxWait != 0) {
            maxWait -= 1000;
            if (jSwordModuleServiceImpl.isInstalled("ESVTemp")) {
                return;
            }
            try {
                Thread.sleep(1000);
            } catch (final InterruptedException e) {
                // ignore;
            }
        }

        fail("ESVTemp was not installed in time");
    }
}
