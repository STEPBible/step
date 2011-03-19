package com.tyndalehouse.step.guice;

import com.google.inject.AbstractModule;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.guice.providers.ClientSessionProvider;

/**
 * This module serves to inject data that is specific to the servlet layer. The purpose of it is therefore to
 * abstract away the identity of it being a java web servlet serving the page.
 * 
 * @author Chris
 * 
 */
public class WebContextModule extends AbstractModule {

    @Override
    protected void configure() {
        // this provider is helpful for getting the request at runtime
        bind(ClientSession.class).toProvider(ClientSessionProvider.class);
    }
}
