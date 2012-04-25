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
     * TODO: share this code with main code reads the core properties from the file
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
