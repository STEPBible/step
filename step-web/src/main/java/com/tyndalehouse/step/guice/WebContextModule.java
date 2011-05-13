package com.tyndalehouse.step.guice;

import com.google.inject.AbstractModule;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.guice.providers.ClientSessionProvider;
import com.tyndalehouse.step.models.UserInterfaceTranslator;
import com.tyndalehouse.step.models.timeline.simile.SimileTimelineTranslatorImpl;

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
        bind(UserInterfaceTranslator.class).to(SimileTimelineTranslatorImpl.class);
    }
}
