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

import java.awt.AWTException;
import java.awt.Desktop;
import java.awt.Image;
import java.awt.MenuItem;
import java.awt.PopupMenu;
import java.awt.SystemTray;
import java.awt.TrayIcon;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.Calendar;

import javax.imageio.ImageIO;
import javax.swing.JOptionPane;
import javax.swing.UIManager;
import javax.swing.UnsupportedLookAndFeelException;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.webapp.WebAppContext;
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
    private static final int STEP_PORT = 8989;

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
        InetAddress listeningAddress;
        try {
            listeningAddress = InetAddress.getLocalHost();
        } catch (final UnknownHostException e1) {
            try {
                listeningAddress = InetAddress.getByName("127.0.0.1");
            } catch (final UnknownHostException e) {
                throw new RuntimeException("Unable to get a suitable local host address");
            }
        }
        final InetSocketAddress socket = new InetSocketAddress(listeningAddress, STEP_PORT);

        final Server jetty = new Server(socket);
        jetty.setStopAtShutdown(true);

        // configure jetty
        try {
            final URL warURL = getWarUrl();

            // configure our web application
            final HandlerList handlers = new HandlerList();
            handlers.setHandlers(new Handler[] { new WebAppContext(warURL.toExternalForm(), "/step-web"),
                    new ShutdownHandler(jetty, "/shutdown") });
            jetty.setHandler(handlers);

            // start the server
            jetty.start();
            launchBrowser();

            addSystemTray(jetty);

            jetty.join();
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
     * Launch browser.
     * 
     */
    private void launchBrowser() {
        try {
            Desktop.getDesktop().browse(new URI("http://localhost:8989/step-web/"));
        } catch (final IOException e1) {
            LOGGER.error("Unable to launch browser.", e1);
            JOptionPane.showMessageDialog(null, "Unable to show browser. Please contact the STEP team.",
                    "An error has occurred", JOptionPane.ERROR_MESSAGE);
        } catch (final URISyntaxException e1) {
            JOptionPane.showMessageDialog(null, "Unable to show browser. Please contact the STEP team.",
                    "An error has occurred", JOptionPane.ERROR_MESSAGE);
            LOGGER.error("Unable to launch browser.", e1);
        }

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
        final MenuItem aboutItem = new MenuItem("About");
        final MenuItem exitItem = new MenuItem("Exit");
        final PopupMenu popupMenu = new PopupMenu();

        aboutItem.addActionListener(new ActionListener() {

            @Override
            public void actionPerformed(final ActionEvent e) {
                final int showOptionDialog = JOptionPane.showOptionDialog(null,
                        "STEP :: Scripture Tools for Every Person\n\u00a9 Tyndale House "
                                + Calendar.getInstance().get(Calendar.YEAR),
                        "STEP :: Scripture Tools for Every Person", JOptionPane.OK_CANCEL_OPTION,
                        JOptionPane.INFORMATION_MESSAGE, null, new Object[] { "Launch STEP!", "Close" },
                        "Launch STEP!");

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
     * Gets the war url.
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
            warDirectory = new File("step-web");
        }

        return warDirectory.toURI().toURL();
    }

    /**
     * @param args a list of unused arguments on the command line
     */
    // CHECKSTYLE:OFF
    public static void main(final String[] args) {
        try {
            final StepServer ms = new StepServer();
            ms.start();

        } catch (final Exception e) {
            LOGGER.debug(e.getMessage(), e);
        }
    }
    // CHECKSTYLE:ON
}
