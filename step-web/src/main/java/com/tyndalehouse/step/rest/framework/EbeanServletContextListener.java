package com.tyndalehouse.step.rest.framework;

import javax.servlet.ServletContextEvent;

import com.avaje.ebeaninternal.server.core.ServletContextListener;

/**
 * Overrides the creation to avoid creation of Ebean - this is handled by Guice
 * 
 * TODO: remove this in favour of context listener? if so refactor of tests required
 * 
 * @author Chris
 * 
 */
public class EbeanServletContextListener extends ServletContextListener {
    @Override
    public void contextInitialized(final ServletContextEvent event) {
        // DO NOTHING
    }
}
