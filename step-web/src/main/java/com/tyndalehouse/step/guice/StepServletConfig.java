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
package com.tyndalehouse.step.guice;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;

import org.crosswire.common.util.Reporter;
import org.crosswire.common.util.ReporterEvent;
import org.crosswire.common.util.ReporterListener;
import org.crosswire.jsword.book.sword.state.OpenFileStateManager;
import org.crosswire.jsword.versification.BookName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;
import com.google.inject.servlet.ServletModule;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.guice.StepCoreModule;
import com.tyndalehouse.step.rest.controllers.ImageController;
import com.tyndalehouse.step.rest.framework.FrontController;

/**
 * Configures the listener for the web app to return the injector used to configure the whole of the
 * application
 * 
 * @author chrisburrell
 * 
 */
public class StepServletConfig extends GuiceServletContextListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(StepServletConfig.class);

    @Override
    protected Injector getInjector() {
        return Guice.createInjector(new StepCoreModule(), new StepWebModule(), new ServletModule() {
            @Override
            protected void configureServlets() {

                serve("/" + ExternalPoweredByFilter.EXTERNAL_PREFIX + "*").with(FrontController.class);
                serve("/rest/*").with(FrontController.class);
                serve("/commentary_images/*").with(ImageController.class);
                serve("/index.jsp");

                // filters
                filter("/index.jsp", "/").through(SetupRedirectFilter.class);
                filter("/external/*").through(ExternalPoweredByFilter.class);
            }
        });
    }

    @Override
    public void contextInitialized(final ServletContextEvent servletContextEvent) {
        // No call to super as it also calls getInjector()
        final ServletContext sc = servletContextEvent.getServletContext();
        sc.setAttribute(Injector.class.getName(), getInjector());

        Reporter.addReporterListener(new ReporterListener() {
            @Override
            public void reportMessage(final ReporterEvent ev) {
                LOGGER.warn("Reporting message from JSword: {} {}", ev.getSourceName(), ev.getMessage());
            }

            @Override
            public void reportException(final ReporterEvent ev) {
                LOGGER.error("Reporting exception from JSword: {} {}", ev.getSourceName(), ev.getMessage());
                LOGGER.error("Error occurred in JSword application", ev.getException());

            }
        });

        BookName.setFullBookName(false);
        if (Boolean.getBoolean("step.loader")) {
            getInjector().getInstance(Loader.class).init();
        }
    }

    @Override
    public void contextDestroyed(final ServletContextEvent servletContextEvent) {
        final ServletContext sc = servletContextEvent.getServletContext();
        OpenFileStateManager.shutDown();
        sc.removeAttribute(Injector.class.getName());
        getInjector().getInstance(EntityManager.class).close();
        super.contextDestroyed(servletContextEvent);
    }
}
