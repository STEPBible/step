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

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Provider;
import com.google.inject.ProvisionException;
import com.google.inject.servlet.GuiceServletContextListener;
import com.google.inject.servlet.ServletModule;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.guice.StepCoreModule;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.rest.controllers.ImageController;
import com.tyndalehouse.step.rest.controllers.IndexRedirect;
import com.tyndalehouse.step.rest.controllers.InternationalJsonController;
import com.tyndalehouse.step.rest.controllers.SearchPageController;
import com.tyndalehouse.step.rest.controllers.SetupPageController;
import com.tyndalehouse.step.rest.controllers.SiteMapController;
import com.tyndalehouse.step.rest.framework.FrontController;

import org.crosswire.common.util.CWProject;
import org.crosswire.common.util.Reporter;
import org.crosswire.common.util.ReporterEvent;
import org.crosswire.common.util.ReporterListener;
import org.crosswire.common.xml.TransformingSAXEventProvider;
import org.crosswire.jsword.book.sword.ConfigEntry;
import org.crosswire.jsword.book.sword.ConfigValueInterceptor;
import org.crosswire.jsword.book.sword.state.OpenFileStateManager;
import org.crosswire.jsword.index.IndexManagerFactory;
import org.crosswire.jsword.internationalisation.LocaleProvider;
import org.crosswire.jsword.internationalisation.LocaleProviderManager;
import org.crosswire.jsword.versification.BookName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import java.util.Locale;

/**
 * Configures the listener for the web app to return the injector used to configure the whole of the application.
 *
 * @author chrisburrell
 */

public class StepServletConfig extends GuiceServletContextListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(StepServletConfig.class);
    private Injector injector = null;

    @Override
    protected Injector getInjector() {
        if (injector == null) {
            synchronized (this) {
                ServletModule servletModule = new ServletModule() {
                    @Override
                    protected void configureServlets() {
                        serve("/" + ExternalPoweredByFilter.EXTERNAL_PREFIX + "*")
                                .with(FrontController.class);
                        serve("/rest/*").with(FrontController.class);
                        serve("/commentary_images/*").with(ImageController.class);
                        serve("/search*").with(SearchPageController.class);
                        serve("/index.jsp").with(IndexRedirect.class);
                        serve("/").with(SearchPageController.class);
                        serve("/international/interactive.js").with(InternationalJsonController.class);
                        serve("/international/*").with(InternationalJsonController.class);
                        serve("/config.jsp").with(SetupPageController.class);
//                        if (Boolean.getBoolean("metrics.enabled")) {
//                            serve("/metrics/*").with(AdminServlet.class);
//                        }
                        serve("/sitemap_version*").with(SiteMapController.class);
                        serve("/SITEMAP_version*").with(SiteMapController.class);
                        // filters
                        filter("/index.jsp", "/").through(SetupRedirectFilter.class);
                        filter("*_escaped_fragment_*", "/").through(HashBangFragmentFilter.class);
                        filter("/external/*").through(ExternalPoweredByFilter.class);
                    }
                };

//                if (Boolean.getBoolean("metrics.enabled")) {
//                    this.injector = Guice.createInjector(new StepCoreModule(), new StepWebModule(),
//                            new InstrumentationModule(), servletModule);
//                } else {
                this.injector = Guice.createInjector(new StepCoreModule(), new StepWebModule(),
                        servletModule);
//                }
            }
        }
        return this.injector;
    }

    /**
     * Context initialized.
     *
     * @param servletContextEvent the servlet context event
     */
    @Override
    public void contextInitialized(final ServletContextEvent servletContextEvent) {
        // set the type of book name
        OpenFileStateManager.init(60, 60);
        CWProject.instance().setFrontendName("step");

        // No call to super as it also calls getInjector()
        final ServletContext sc = servletContextEvent.getServletContext();

        String servletPath = sc.getRealPath("/");
        String[] servletContextSplits = servletPath.split("[\\\\\\/]"); // Either \ for Windows or / characters for Linux
        SearchPageController.SERVLET_CONTEXT = servletContextSplits[servletContextSplits.length - 1];

        sc.setAttribute(Injector.class.getName(), getInjector());

        configureJSword();
        configureJSwordErrorReporting();

        if (Boolean.getBoolean("step.loader")) {
            getInjector().getInstance(Loader.class).init();
        }
        else getInjector().getInstance(Loader.class).loadAugmentedStrongs(false);

    }

    /**
     * Configure JSword error reporting.
     */
    private void configureJSwordErrorReporting() {
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
    }

    /**
     * Configure JSword.
     */
    private void configureJSword() {
        BookName.setFullBookName(false);
        final Provider<ClientSession> provider = this.injector.getProvider(ClientSession.class);
        ConfigEntry.setConfigValueInterceptor(this.injector.getInstance(ConfigValueInterceptor.class));

        // set the locale resolution
        LocaleProviderManager.setLocaleProvider(new LocaleProvider() {

            @Override
            public Locale getUserLocale() {
                try {
                    return provider.get().getLocale();
                } catch (final ProvisionException ex) {
                    return Locale.ENGLISH;
                }
            }
        });

        if (Boolean.TRUE.equals(Boolean.getBoolean("step.development"))) {
            TransformingSAXEventProvider.setDevelopmentMode(true);
        }
    }

    /**
     * Context destroyed.
     *
     * @param servletContextEvent the servlet context event
     */
    @Override
    public void contextDestroyed(final ServletContextEvent servletContextEvent) {
        final ServletContext sc = servletContextEvent.getServletContext();
        // close some JSword things
        OpenFileStateManager.instance().shutDown();
        IndexManagerFactory.getIndexManager().closeAllIndexes();

        sc.removeAttribute(Injector.class.getName());
        getInjector().getInstance(EntityManager.class).close();

        super.contextDestroyed(servletContextEvent);
    }
}
