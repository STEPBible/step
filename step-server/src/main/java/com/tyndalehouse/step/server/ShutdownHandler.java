// ========================================================================
// Copyright (c) 2009-2009 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// All rights reserved. This program and the accompanying materials
// are made available under the terms of the Eclipse Public License v1.0
// and Apache License v2.0 which accompanies this distribution.
// The Eclipse Public License is available at
// http://www.eclipse.org/legal/epl-v10.html
// The Apache License v2.0 is available at
// http://www.opensource.org/licenses/apache2.0.php
// You may elect to redistribute this code under either of these licenses.
// ========================================================================
package com.tyndalehouse.step.server;

//import org.eclipse.jetty.server.Request;
//import org.eclipse.jetty.server.Server;
//import org.eclipse.jetty.server.handler.AbstractHandler;
//import org.eclipse.jetty.webapp.WebAppContext;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import javax.servlet.ServletException;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import java.io.IOException;

/* ------------------------------------------------------------ */
/**
// * Inspired from {@link org.eclipse.jetty.server.handler.ShutdownHandler} A handler that shuts the server down
 * on a valid request. Used to do "soft" restarts from Java. If _exitJvm ist set to true a hard System.exit()
 * call is being made.
 * 
 * This handler is a contribution from Johannes Brodwall: https://bugs.eclipse.org/bugs/show_bug.cgi?id=357687
 * 
 * Usage:
 * 
 * <pre>
 * Server server = new Server(8080);
 * HandlerList handlers = new HandlerList();
 * handlers.setHandlers(new Handler[] { someOtherHandler, new ShutdownHandler(server, &quot;secret password&quot;) });
 * server.setHandler(handlers);
 * server.start();
 * </pre>
 * 
 * <pre>
 * public static void attemptShutdown(int port, String shutdownCookie) {
 *     try {
 *         URL url = new URL(&quot;http://localhost:&quot; + port + &quot;/shutdown?cookie=&quot; + shutdownCookie);
 *         HttpURLConnection connection = (HttpURLConnection) url.openConnection();
 *         connection.setRequestMethod(&quot;POST&quot;);
 *         connection.getResponseCode();
 *         logger.info(&quot;Shutting down &quot; + url + &quot;: &quot; + connection.getResponseMessage());
 *     } catch (SocketException e) {
 *         logger.debug(&quot;Not running&quot;);
 *         // Okay - the server is not running
 *     } catch (IOException e) {
 *         throw new RuntimeException(e);
 *     }
 * }
 * </pre>
 */
// CHECKSTYLE:OFF
@SuppressWarnings("PMD")
public class ShutdownHandler {
//    private static final Logger LOG = LoggerFactory.getLogger(ShutdownHandler.class);
//    private final Server server;
//    private WebAppContext stepWebContext;
//    private final String shutdownPath;
//
//    /**
//     * Creates a listener that lets the server be shut down remotely (but only from localhost).
//     *
//     * @param server the Jetty instance that should be shut down
//     * @param shutdownPath the path to call to trigger a shutdown
//     * @param stepWebContext the context for the STEP-web app
//     */
//    public ShutdownHandler(final Server server, final String shutdownPath, final WebAppContext stepWebContext) {
//        this.server = server;
//        this.stepWebContext = stepWebContext;
//
//        if(shutdownPath != null && shutdownPath.length() > 0 && shutdownPath.charAt(0) != '/') {
//            this.shutdownPath = "/" + shutdownPath;
//        } else {
//            this.shutdownPath = shutdownPath;
//        }
//    }
//
//
//    public void handle(final String target, final Request baseRequest, final HttpServletRequest request,
//            final HttpServletResponse response) throws IOException, ServletException {
//        if (!target.equals(this.shutdownPath)) {
//            return;
//        }
//
//        response.sendRedirect(stepWebContext.getContextPath() +  "/shutdown.jsp");
//
//        new Thread() {
//            @Override
//            public void run() {
//                try {
//                    shutdownServer();
//                } catch (final InterruptedException e) {
//                    LOG.debug(e.getMessage(), e);
//                } catch (final Exception e) {
//                    throw new RuntimeException("Shutting down server", e);
//                }
//            }
//        }.start();
//    }
//
//    private void shutdownServer() throws Exception {
//        this.server.stop();
//        System.exit(0);
//    }
}
