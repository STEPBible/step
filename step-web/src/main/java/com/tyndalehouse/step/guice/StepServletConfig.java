package com.tyndalehouse.step.guice;

import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Enumeration;

import javax.servlet.ServletContextEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;
import com.google.inject.servlet.ServletModule;
import com.tyndalehouse.step.core.guice.StepCoreModule;
import com.tyndalehouse.step.rest.framework.FrontController;

/**
 * Configures the listener for the web app to return the injector used to configure the whole of the
 * application
 * 
 * @author Chris
 * 
 */
public class StepServletConfig extends GuiceServletContextListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(StepServletConfig.class);

    @Override
    protected Injector getInjector() {
        return Guice.createInjector(new StepCoreModule(), new WebContextModule(), new ServletModule() {
            @Override
            protected void configureServlets() {
                serve("/rest/*").with(FrontController.class);
            }
        });
    }

    @Override
    public void contextDestroyed(final ServletContextEvent servletContextEvent) {
        deregisterDbDrivers();
        super.contextDestroyed(servletContextEvent);

    }

    /**
     * Deregisters database drivers to prevent leaks
     */
    private void deregisterDbDrivers() {
        final Enumeration<Driver> drivers = DriverManager.getDrivers();
        while (drivers.hasMoreElements()) {
            final Driver driver = drivers.nextElement();

            try {
                DriverManager.deregisterDriver(driver);
                LOGGER.info("Deregistering Jdbc driver: {}", driver);
            } catch (final SQLException e) {
                LOGGER.error("Error deregistering driver " + driver.toString(), e);
            }
        }
    }
}
