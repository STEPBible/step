package com.tyndalehouse.step.core.guice.providers;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.UserDataService;

/**
 * A server session provider TODO should use CACHE here since we query almost everytime there is a request for
 * bookmarks, etc.
 * 
 * @author Chris
 * 
 */
@Singleton
public class ServerSessionProvider implements Provider<Session> {
    // we store the provider, since the provider is request-scoped and therefore
    // values vary
    private final Provider<ClientSession> clientSessionProvider;
    private final EbeanServer ebean;
    private final UserDataService userDataService;

    /**
     * Sets up a singleton provider that relies upon a request-scoped clientSessionProvider.
     * 
     * @param ebean the ebean server used to retrieve data
     * @param clientSessionProvider the client session provider, giving us an id to reference
     * @param userDataService a service for user and session management
     */
    @Inject
    public ServerSessionProvider(final EbeanServer ebean,
            final Provider<ClientSession> clientSessionProvider, final UserDataService userDataService) {
        this.ebean = ebean;
        this.clientSessionProvider = clientSessionProvider;
        this.userDataService = userDataService;
    }

    @Override
    public Session get() {
        final String clientSessionId = this.clientSessionProvider.get().getSessionId();
        final Session serverSession = this.ebean.find(Session.class).fetch("user", "id, name").where()
                .eq("jSessionId", clientSessionId).findUnique();

        if (serverSession == null) {
            // we create a server session
            return this.userDataService.createSession();
        }

        return serverSession;
    }
}
