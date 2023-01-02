package com.tyndalehouse.step.core.utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map.Entry;
import java.util.Properties;

import com.google.inject.AbstractModule;
import com.google.inject.name.Names;

/**
 * A colletion of utilities to read property files
 * 
 * @author chrisburrell
 */
public abstract class AbstractStepGuiceModule extends AbstractModule {
    private final String propertyFileUrl;
    private Properties moduleProperties;

    /**
     * Sets up the module to have properties in it
     * 
     * @param propertyFileUrl the classpath URL to the property file
     */
    public AbstractStepGuiceModule(final String propertyFileUrl) {
        this.propertyFileUrl = propertyFileUrl;
    }

    @Override
    protected final void configure() {
        readProperties();
        doConfigure();
    }

    /**
     * reads the core properties from the file
     * 
     * @return a list of properties read from file
     */
    private Properties readProperties() {
        InputStream stream = null;
        try {
            stream = AbstractStepGuiceModule.class.getResourceAsStream(this.propertyFileUrl);
            this.moduleProperties = new Properties();
            this.moduleProperties.load(stream);
            applySystemPropertiesOverride();

            Names.bindProperties(super.binder(), this.moduleProperties);
        } catch (final IOException e) {
            // This is the preferred way to tell Guice something went wrong
            super.addError(e);
        } finally {
            IOUtils.closeQuietly(stream);
        }
        return this.moduleProperties;
    }

    /**
     * Overrides with anything that has been specified in system properties
     */
    private void applySystemPropertiesOverride() {
        final Properties sys = System.getProperties();
        for (final Entry<Object, Object> p : sys.entrySet()) {
            if (this.moduleProperties.containsKey(p.getKey())) {
                this.moduleProperties.setProperty((String) p.getKey(), (String) p.getValue());
            }
        }
    }

    /**
     * @return the moduleProperties
     */
    public Properties getModuleProperties() {
        return this.moduleProperties;
    }

    /**
     * a place to do specific module configuration
     */
    protected abstract void doConfigure();
}
