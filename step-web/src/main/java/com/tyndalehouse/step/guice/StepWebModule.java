package com.tyndalehouse.step.guice;

import com.google.inject.servlet.ServletScopes;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.utils.AbstractStepGuiceModule;
import com.tyndalehouse.step.guice.providers.ClientSessionProvider;
import com.tyndalehouse.step.models.TimelineTranslator;
import com.tyndalehouse.step.models.UiDefaults;
import com.tyndalehouse.step.models.timeline.simile.SimileTimelineTranslatorImpl;
import com.tyndalehouse.step.rest.framework.ObjectMapperProvider;
import org.codehaus.jackson.map.ObjectMapper;

/**
 * This module serves to inject data that is specific to the servlet layer. The purpose of it is therefore to abstract
 * away the identity of it being a java web servlet serving the page.
 */
public class StepWebModule extends AbstractStepGuiceModule {
    private static final String GUICE_PROPERTIES = "/step.web.properties";

    /**
     * sets up the module with the relevant properties file
     */
    public StepWebModule() {
        super(GUICE_PROPERTIES);
    }

    @Override
    protected void doConfigure() {
        // this provider is helpful for getting the request at runtime
        bind(ObjectMapper.class).toProvider(ObjectMapperProvider.class);
        bind(ClientSession.class).toProvider(ClientSessionProvider.class).in(ServletScopes.REQUEST);
        bind(UiDefaults.class).asEagerSingleton();
        bind(TimelineTranslator.class).to(SimileTimelineTranslatorImpl.class);
    }
}
