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

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.webapp.WebAppContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.IOException;
import java.net.*;
import java.util.Calendar;
import java.util.Locale;
import java.util.ResourceBundle;

/**
 * The main class that kicks off the application. Reads in the following system properties
 * step.war.path the location on disk to the WAR directory
 * step.war.context the context on which the server listens.
 *
 * @author chrisburrell
 */
public final class StepServer {
    private static final Logger LOGGER = LoggerFactory.getLogger(StepServer.class);
    private static final int DEFAULT_STEP_PORT = 8989;
    private static final String DEFAULT_WAR_LOCATION = "step-web";
    public static final String SHUTDOWN_CONTEXT = "shutdown";
    public static final String ENGLISH_GENERIC_ERROR = "An error has occurred";
    public static final String ENGLISH_BROWSER_ERROR = "STEP was unable to launch the browser.";
    private InetAddress listeningAddress;
    private final InetSocketAddress socket;
    private final URL warURL;
    private final int stepPort;
    private final String contextPath;
    private final ResourceBundle resourceBundle;
    private final String browserUrl;
    private ResourceBundle setupMessages = null;
    private ResourceBundle errorMessages = null;
    private ResourceBundle htmlMessages = null;
    private boolean ignoreBrowserError = Boolean.getBoolean("ignoreBrowserError");

    /**
     * Initialises all the common variables required to setup the server
     *
     * @throws MalformedURLException couldn't create a location to our disk
     */
    public StepServer() throws MalformedURLException {
        try {
            listeningAddress = InetAddress.getByName("localhost");
        } catch(UnknownHostException ex) {
            try {
                listeningAddress = InetAddress.getByAddress("localhost", new byte[] {0x7f,0x00,0x00,0x01});
            } catch (UnknownHostException ex1) {
                try {
                    listeningAddress = InetAddress.getLocalHost();
                } catch(UnknownHostException ex3) {
                    //can't do much here
                    LOGGER.error("Unable to obtain IP address to bind on.");
                    throw new RuntimeException(ex.getMessage(), ex);
                }
            }
        }
        this.stepPort = getStepPort();
        socket = new InetSocketAddress(listeningAddress, this.stepPort);
        warURL = getWarUrl();
        contextPath = getContextPath();
        browserUrl = String.format("http://%s:%s/%s/", this.listeningAddress.getHostName(), this.stepPort, this.contextPath);
        resourceBundle = loadLanguage();
    }

    /**
     * @return loads the language based on the Desktop locale - we accept this may be different from the browser locale
     */
    private ResourceBundle loadLanguage() {

        return null;
    }

    /**
     * creates and configures the Jetty server
     *
     * @return the Server object if required to make modifications
     */
    private Server start() {
        final Server jetty = new Server(socket);
        jetty.setStopAtShutdown(true);

        // configure jetty
        try {
            // configure our web application
            final HandlerList handlers = new HandlerList();
            final WebAppContext webAppContext = new WebAppContext(warURL.toExternalForm(), "/" + this.contextPath);
            handlers.setHandlers(new Handler[]{webAppContext,
                    new ShutdownHandler(jetty, SHUTDOWN_CONTEXT, webAppContext)});
            jetty.setHandler(handlers);

            // start the server
            jetty.start();
            initLanguages(webAppContext.getClassLoader());
            addSystemTray(jetty);

            finishStartUp();
            jetty.join();
        } catch(final BindException ex) {
            LOGGER.info("Attempting to start STEP when already started.");
            try {
                jetty.stop();
            } catch(Exception e) {
                LOGGER.warn("Failed to stop extra Jetty instance.", e);
            }

            finishStartUp();
        } catch (final SAXException e) {
            LOGGER.error(e.getMessage(), e);
        } catch (final IOException e) {
            LOGGER.error(e.getMessage(), e);
        } catch (final Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
        return jetty;
    }

    private void finishStartUp() {
        launchBrowser();
        closeSpashScreen();
    }

    /**
     * Closes the splash screen
     */
    private void closeSpashScreen() {
        SplashScreen screen = SplashScreen.getSplashScreen();
        if (screen != null) {
            screen.close();
        }
    }

    /**
     * Reads the bundles of translations from the various bundles in step-core.
     * We pass in a class loader, so that we can read the bundle off there!
     *
     * @param classLoader
     */
    private void initLanguages(final ClassLoader classLoader) {
        setupMessages = ResourceBundle.getBundle("SetupBundle", Locale.getDefault(), classLoader);
        htmlMessages = ResourceBundle.getBundle("HtmlBundle", Locale.getDefault(), classLoader);
        errorMessages = ResourceBundle.getBundle("ErrorBundle", Locale.getDefault(), classLoader);
    }


    /**
     * Launch browser.
     */
    private void launchBrowser() {
        try {
            Desktop.getDesktop().browse(new URI(browserUrl));
        } catch (final IOException e1) {
            if (!ignoreBrowserError) {
                showError("error_generic", ENGLISH_GENERIC_ERROR, "error_unable_to_show_browser", ENGLISH_BROWSER_ERROR);
            }
            LOGGER.error("Unable to launch browser.", e1);
        } catch (final URISyntaxException e1) {
            if (!ignoreBrowserError) {
                showError("error_generic", ENGLISH_GENERIC_ERROR, "error_unable_to_show_browser", ENGLISH_BROWSER_ERROR);
            }
            LOGGER.error("Unable to launch browser.", e1);
        }
    }

    /**
     * Reads the error bundle, if loaded, or defaults to the default parameters and shows a dialog message
     *
     * @param title                 the title bar message
     * @param defaultTitle          the title if no error bundle has been loaded
     * @param bundleKey             the key to the error bundle
     * @param defaultEnglishMessage the message to display if no error bundle has been loaded
     */
    private void showError(String title, String defaultTitle, String bundleKey, String defaultEnglishMessage, String... args) {
        String finalTitle = this.errorMessages == null ? defaultTitle : this.errorMessages.getString(title);
        String message = this.errorMessages == null ? defaultEnglishMessage : setupMessages.getString(bundleKey);
        String formattedMessage = String.format(message, args);
        JOptionPane.showMessageDialog(null, formattedMessage, finalTitle, JOptionPane.ERROR_MESSAGE);
    }


    /**
     * Adds the system tray.
     *
     * @param server the server
     */
    private void addSystemTray(final Server server) {
        setDefaultUILookAndFeel();

        if (!SystemTray.isSupported()) {
            return;
        }

        Image icon;
        try {
            icon = ImageIO.read(getClass().getResource("/step.png")).getScaledInstance(16, 16,
                    Image.SCALE_DEFAULT);

        } catch (final IOException e1) {
            LOGGER.error("Failed to load image", e1);
            return;
        }

        final TrayIcon trayIcon = new TrayIcon(icon);
        final MenuItem aboutItem = new MenuItem(htmlMessages.getString("help_about"));
        final MenuItem launchStepBrowser = new MenuItem(htmlMessages.getString("launch_browser"));
        final MenuItem exitItem = new MenuItem(htmlMessages.getString("tools_exit"));
        final PopupMenu popupMenu = new PopupMenu();

        aboutItem.addActionListener(new ActionListener() {

            @Override
            public void actionPerformed(final ActionEvent e) {
                final int showOptionDialog = JOptionPane.showOptionDialog(null,
                        "STEP :: Scripture Tools for Every Person\n\u00a9 Tyndale House "
                                + Calendar.getInstance().get(Calendar.YEAR),
                        "STEP :: Scripture Tools for Every Person", JOptionPane.OK_CANCEL_OPTION,
                        JOptionPane.INFORMATION_MESSAGE, null,
                        new Object[]{htmlMessages.getString("launch_browser"), htmlMessages.getString("close")},
                        htmlMessages.getString("launch_browser"));

                if (showOptionDialog == 0) {
                    launchBrowser();
                }
            }
        });
        exitItem.addActionListener(new ActionListener() {

            @Override
            public void actionPerformed(final ActionEvent e) {
                try {
                    server.stop();
                } catch (final Exception ex) {
                    LOGGER.error("Error while shutting down", ex);
                }
                System.exit(0);
            }
        });

        launchStepBrowser.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(final ActionEvent e) {
                launchBrowser();
            }
        });

        popupMenu.add(launchStepBrowser);
        popupMenu.add(aboutItem);
        popupMenu.add(exitItem);
        trayIcon.setToolTip("STEP :: Scripture Tools for Every Person");
        trayIcon.addActionListener(new ActionListener() {

            @Override
            public void actionPerformed(final ActionEvent e) {
                launchBrowser();
            }
        });
        trayIcon.setPopupMenu(popupMenu);
        try {
            SystemTray.getSystemTray().add(trayIcon);
            trayIcon.displayMessage(
                    htmlMessages.getString("step_running"),
                    String.format(htmlMessages.getString("open_browser"), browserUrl), TrayIcon.MessageType.INFO);
        } catch (final AWTException e) {
            LOGGER.error("Unable to add system tray icon", e);
        }
    }

    /**
     * Sets the default ui look and feel.
     */
    private void setDefaultUILookAndFeel() {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (final ClassNotFoundException e2) {
            LOGGER.error("Failed to change look and feel", e2);
        } catch (final InstantiationException e2) {
            LOGGER.error("Failed to change look and feel", e2);
        } catch (final IllegalAccessException e2) {
            LOGGER.error("Failed to change look and feel", e2);
        } catch (final UnsupportedLookAndFeelException e2) {
            LOGGER.error("Failed to change look and feel", e2);
        }
    }

    /**
     * @return the port on which the server listens
     */
    private int getStepPort() {
        Integer port = Integer.getInteger("step.war.port");
        if (port == null) {
            return DEFAULT_STEP_PORT;
        }
        return port;
    }


    /**
     * @return the context on which STEP will live. either step.war.context, or the default location which matches
     *         the default location on file.
     */
    private String getContextPath() {
        final String pathToWar = System.getProperty("step.war.context");
        if (pathToWar == null || pathToWar.length() == 0) {
            return DEFAULT_WAR_LOCATION;
        }
        return pathToWar;
    }

    /**
     * Gets the war url, to the location on disk where the WAR is stored.
     *
     * @return the war url
     * @throws MalformedURLException the malformed url exception
     */
    private URL getWarUrl() throws MalformedURLException {
        final String pathToWar = System.getProperty("step.war.path");
        File warDirectory = null;
        if (pathToWar != null && pathToWar.length() != 0) {
            final File f = new File(pathToWar);
            if (f.exists()) {
                warDirectory = f;
            }
        }

        if (warDirectory == null) {
            warDirectory = new File(DEFAULT_WAR_LOCATION);
        }

        return warDirectory.toURI().toURL();
    }

    /**
     * @param args a list of unused arguments on the command line
     */
    public static void main(final String[] args) {
        try {
            System.setProperty("step.jetty", "true");
            final StepServer ms = new StepServer();
            ms.start();
            //////
            //note: if successful, never gets past the line above.
            /////
        } catch (final Exception e) {
            failedToLaunchWarning();
            LOGGER.error(e.getMessage(), e);
        }
    }

    private static void failedToLaunchWarning() {
        JOptionPane.showMessageDialog(null, "STEP was unable to launch. Please try again, or contact the STEP team for help",
                ENGLISH_GENERIC_ERROR, JOptionPane.ERROR_MESSAGE);
    }
}
