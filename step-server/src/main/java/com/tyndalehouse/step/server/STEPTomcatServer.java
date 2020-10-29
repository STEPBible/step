package com.tyndalehouse.step.server;

import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.startup.Tomcat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.Calendar;
import java.util.Locale;
import java.util.ResourceBundle;

/**
 * Tomcat server for STEP
 */
public class STEPTomcatServer {
    public static final String SHUTDOWN_CONTEXT = "shutdown";
    public static final String ENGLISH_GENERIC_ERROR = "An error has occurred";
    public static final String ENGLISH_BROWSER_ERROR = "STEP was unable to launch the browser.";
    public static final String BACKGROUND_LAUNCH = "backgroundLaunch";
    public static final String STEP_DESCRIPTION = "STEP :: Scripture Tools for Every Person\n\u00a9 Tyndale House "
            + Calendar.getInstance().get(Calendar.YEAR);
    public static final String STEP_TITLE = "STEP :: Scripture Tools for Every Person";
    public static final int MAX_WAIT_TO_TEST_PORT_IN_USE_MS = 150;
    private static final Logger LOGGER = LoggerFactory.getLogger(STEPTomcatServer.class);
    private static final int DEFAULT_STEP_PORT = 8989;
    private static final String DEFAULT_WAR_LOCATION = "step-web";
    private static final String DEFAULT_WAR_CONTEXT = "";
    private final InetSocketAddress socket;
    private final String warPath;
    private final int stepPort;
    private final String contextPath;
    private final String browserUrl;
    private InetAddress listeningAddress;
    private ResourceBundle setupMessages = null;
    private ResourceBundle errorMessages = null;
    private ResourceBundle htmlMessages = null;
    private boolean ignoreBrowserError = Boolean.getBoolean("ignoreBrowserError");
    private boolean backgroundLaunch;

    public STEPTomcatServer(boolean backgroundLaunch) throws MalformedURLException {
        this.backgroundLaunch = backgroundLaunch;
        try {
            listeningAddress = InetAddress.getByName("localhost");
        } catch (UnknownHostException ex) {
            try {
                listeningAddress = InetAddress.getByAddress("localhost", new byte[]{0x7f, 0x00, 0x00, 0x01});
            } catch (UnknownHostException ex1) {
                try {
                    listeningAddress = InetAddress.getLocalHost();
                } catch (UnknownHostException ex3) {
                    //can't do much here
                    LOGGER.error("Unable to obtain IP address to bind on.");
                    throw new RuntimeException(ex3.getMessage());
                }
            }
        }
        this.stepPort = getStepPort();
        this.socket = new InetSocketAddress(listeningAddress, this.stepPort);
        this.warPath = getWarPath();
        this.contextPath = getContextPath();
        this.browserUrl = String.format("http://%s:%s/%s", this.listeningAddress.getHostName(), this.stepPort, this.contextPath);
    }

    private static void failedToLaunchWarning() {
        JOptionPane.showMessageDialog(null, "STEP was unable to launch. Please try again, or contact the STEP team for help",
                ENGLISH_GENERIC_ERROR, JOptionPane.ERROR_MESSAGE);
    }

    /**
     * Main method that kicks off embedded tomcat
     *
     * @param args the arguments
     * @throws ServletException   the servlet exception
     * @throws LifecycleException any lifecycle exception
     */
    public static void main(String[] args) throws ServletException, LifecycleException {
        try {
            System.setProperty("step.jetty", "true");
			System.setProperty("tomcat.util.http.parser.HttpParser.requestTargetAllow", "|");
            final boolean backgroundLaunch = args.length > 0 && BACKGROUND_LAUNCH.equals(args[0]);
            if (backgroundLaunch) {
                if (SplashScreen.getSplashScreen() != null) {
                    SplashScreen.getSplashScreen().close();
                }
            }

            new STEPTomcatServer(backgroundLaunch).start();
            //////
            //note: if successful, never gets past the line above.
            /////
        } catch (final Exception e) {
            failedToLaunchWarning();
            LOGGER.error(e.getMessage(), e);
        }

    }

    private void finishStartUp() {
        if (!this.backgroundLaunch) {
            launchBrowser();
            closeSpashScreen();
        }
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
     * Reads the bundles of translations from the various bundles in step-core. We pass in a class loader, so that we
     * can read the bundle off there!
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
    private void showError(String title, String defaultTitle, String bundleKey, String defaultEnglishMessage) {
        String finalTitle = this.errorMessages == null ? defaultTitle : this.errorMessages.getString(title);
        String message = this.errorMessages == null ? defaultEnglishMessage : setupMessages.getString(bundleKey);
        // String formattedMessage = String.format(message, args);
        JOptionPane.showMessageDialog(null, message, finalTitle, JOptionPane.ERROR_MESSAGE);
    }

    /**
     * Adds the system tray.
     *
     * @param server the server
     */
    private void addSystemTray(final Tomcat server) {
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
                        STEP_DESCRIPTION,
                        STEP_TITLE, JOptionPane.OK_CANCEL_OPTION,
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
            if (!backgroundLaunch) {
                trayIcon.displayMessage(
                        htmlMessages.getString("step_running"),
                        String.format(htmlMessages.getString("open_browser"), browserUrl), TrayIcon.MessageType.INFO);
            }
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
     * @return the context on which STEP will live. either step.war.context, or the default location which matches the
     * default location on file.
     */
    private String getContextPath() {
        final String pathToWar = System.getProperty("step.war.context");
        if (pathToWar == null || pathToWar.length() == 0) {
            return DEFAULT_WAR_CONTEXT;
        }
        return pathToWar;
    }

    private String getWarPath() {
        String webappDirLocation = System.getProperty("step.war.path");
        if (webappDirLocation == null) {
            webappDirLocation = DEFAULT_WAR_LOCATION;
        }
        return webappDirLocation;
    }

    /**
     * creates and configures the Jetty server
     *
     * @return the Server object if required to make modifications
     */
    private Tomcat start() throws Exception {
        final Tomcat tomcat = new Tomcat();
        tomcat.setPort(this.stepPort);

        try (Socket c = new Socket()) {
            c.connect(socket, MAX_WAIT_TO_TEST_PORT_IN_USE_MS);
            c.close();
            //connected succesfully, so no need to start tomcat again
            finishStartUp();

        } catch (IOException e) {
            //timed-out, so need to deploy app
            try {
                final String absolutePath = new File(this.warPath).getAbsolutePath();
                tomcat.addWebapp("", absolutePath);
                LOGGER.debug("Starting tomcat with path [{}] on port [{}]", absolutePath, this.stepPort);
                tomcat.start();

                final org.apache.catalina.Container child = tomcat.getHost().findChild("");

                initLanguages(((Context)child).getLoader().getClassLoader());
                addSystemTray(tomcat);

                finishStartUp();

                // add shutdown hook to stop server
                Runtime.getRuntime().addShutdownHook(new Thread() {
                    public void run() {
                        stopContainer(tomcat);
                    }
                });

                tomcat.getServer().await();
                return tomcat;
            } catch (LifecycleException ex) { // | ServletException ex) {
                throw e;
            }

        }
        return null;
    }

    /**
     * Stops the embedded Tomcat server.
     */
    public void stopContainer(final Tomcat tomcat) {
        try {
            if (tomcat != null) {
                tomcat.stop();
            }
        } catch (LifecycleException exception) {
            LOGGER.warn("Cannot Stop Tomcat {}", exception.getMessage(), exception);
        }
    }
}
