package com.tyndalehouse.step.core.data.create;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import com.avaje.ebean.EbeanServer;
import com.google.inject.AbstractModule;
import com.google.inject.name.Names;
import com.tyndalehouse.step.core.guice.providers.DatabaseConfigProvider;

/**
 * A simple guice module to initialise the database
 * 
 * @author Chris
 * 
 */
public class DataTestModule extends AbstractModule {
    private static final String CORE_GUICE_PROPERTIES = "/step.core.properties";

    @Override
    protected void configure() {
        bind(Properties.class).annotatedWith(Names.named("StepCoreProperties")).toInstance(readProperties());
        bind(EbeanServer.class).toProvider(DatabaseConfigProvider.class).asEagerSingleton();
    }

    /**
     * TODO share this code with main code reads the core properties from the file
     * 
     * @return a list of properties read from file
     */
    private Properties readProperties() {
        final InputStream stream = getClass().getResourceAsStream(CORE_GUICE_PROPERTIES);
        final Properties appProperties = new Properties();
        try {
            appProperties.load(stream);
            Names.bindProperties(super.binder(), appProperties);
        } catch (final IOException e) {
            // This is the preferred way to tell Guice something went wrong
            super.addError(e);
        }
        return appProperties;
    }

}
