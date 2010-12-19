package com.tyndalehouse.step.guice;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;
import com.google.inject.servlet.ServletModule;
import com.tyndalehouse.step.core.guice.StepCoreModule;
import com.tyndalehouse.step.rest.controllers.FrontController;

/**
 * Configures the listener for the web app to return the injector used to configure the whole of the application
 * 
 * @author Chris
 * 
 */
public class StepServletConfig extends GuiceServletContextListener {

    @Override
    protected Injector getInjector() {
        return Guice.createInjector(new StepCoreModule(), new ServletModule() {
            @Override
            protected void configureServlets() {
                serve("/rest/*").with(FrontController.class);
            }
        });
    }
}
