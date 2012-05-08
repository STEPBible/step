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
 * @author chrisburrell
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
