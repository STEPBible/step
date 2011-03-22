package com.tyndalehouse.step.server;

import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URL;

import org.mortbay.jetty.Server;
import org.mortbay.jetty.webapp.WebAppContext;
import org.mortbay.xml.XmlConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

/**
 * the main class that kicks off the application
 * 
 * @author Chris
 * 
 */
public final class StepServer {
    private static final Logger LOGGER = LoggerFactory.getLogger(StepServer.class);

    /**
     * hiding implementation
     */
    private StepServer() {
        // hiding implementation
    }

    /**
     * creates and configures the Jetty server
     * 
     * @return the Server object if required to make modifications
     */
    private Server start() {
        final Server jetty = new Server();
        final ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        final URL jettyConfig = currentClassLoader.getResource("jetty.xml");

        // configure jetty
        XmlConfiguration configuration;
        try {
            final URL warURL = new File("step-web").toURI().toURL();
            configuration = new XmlConfiguration(jettyConfig);
            configuration.configure(jetty);

            // configure our web application
            jetty.setHandler(new WebAppContext(warURL.toExternalForm(), "/step-web"));

            // start the server
            jetty.start();
        } catch (final SAXException e) {
            LOGGER.error(e.getMessage(), e);
        } catch (final IOException e) {
            LOGGER.error(e.getMessage(), e);
            // CHECKSTYLE:OFF
        } catch (final Exception e) {
            // CHECKSTYLE:ON
            LOGGER.error(e.getMessage(), e);
        }
        return jetty;
    }

    /**
     * @param args a list of unused arguments on the command line
     */
    // CHECKSTYLE:OFF
    public static void main(final String[] args) {
        try {
            final StepServer ms = new StepServer();
            ms.start();
            Desktop.getDesktop().browse(new URI("http://localhost:8989/step-web/index.html"));

        } catch (final Exception e) {
            LOGGER.debug(e.getMessage(), e);
        }
    }
    // CHECKSTYLE:ON
}
