package com.tyndalehouse.step.server;

//import java.awt.Desktop;
import java.awt.Desktop;
import java.net.URI;
import java.net.URL;

import org.mortbay.jetty.Server;
import org.mortbay.jetty.webapp.WebAppContext;
import org.mortbay.xml.XmlConfiguration;

public class StepServer {

    /**
     * creates and configures the Jetty server
     * 
     * @return the Server object if required to make modifications
     * @throws Exception any uncaught exceptions that should be logged before exiting
     */
    private Server start() throws Exception {
        final Server jetty = new Server();
        final URL jettyConfig = StepServer.class.getClassLoader().getResource("jetty.xml");
        final URL warURL = StepServer.class.getClassLoader().getResource("war");

        // configure jetty
        final XmlConfiguration configuration = new XmlConfiguration(jettyConfig);
        configuration.configure(jetty);

        // configure our web application
        jetty.setHandler(new WebAppContext(warURL.toExternalForm(), "/step-web"));

        // start the server
        jetty.start();
        return jetty;
    }

    /**
     * @param args
     */
    public static void main(final String[] args) {
        try {
            // TODO setup logger somewhere!
            final StepServer ms = new StepServer();
            ms.start();
            Desktop.getDesktop().browse(new URI("http://localhost:8080/step-web"));
        } catch (final Exception e) {
            e.printStackTrace();
        }
    }
}
