package com.tyndalehouse.step.core.guice.providers;

import java.sql.Timestamp;
import java.util.Calendar;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.caches.SessionCache;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.models.ClientSession;

/**
 * A server session provider
 * 
 * @author Chris
 * 
 */
@Singleton
public class ServerSessionProvider implements Provider<Session> {
    // we store the provider, since the provider is request-scoped and therefore
    // values vary
    private static final Logger LOG = LoggerFactory.getLogger(ServerSessionProvider.class);
    private final Provider<ClientSession> clientSessionProvider;
    private final EbeanServer ebean;
    private final SessionCache sessionCache;
    private final int expiryPeriod;

    /**
     * Sets up a singleton provider that relies upon a request-scoped clientSessionProvider.
     * 
     * @param ebean the ebean server used to retrieve data
     * @param clientSessionProvider the client session provider, giving us an id to reference
     * @param sessionCache which will hold in memory to avoid too many DB calls
     * @param expiryPeriod the time a session will remain alive for the session
     */
    @Inject
    public ServerSessionProvider(final EbeanServer ebean,
            final Provider<ClientSession> clientSessionProvider, final SessionCache sessionCache,
            @Named("app.cache.session.timeToIdle") final int expiryPeriod) {
        this.ebean = ebean;
        this.clientSessionProvider = clientSessionProvider;
        this.sessionCache = sessionCache;
        this.expiryPeriod = expiryPeriod;
    }

    @Override
    public Session get() {
        LOG.debug("Retrieving session");
        final String clientSessionId = this.clientSessionProvider.get().getSessionId();

        Session session = this.sessionCache.get(clientSessionId);
        if (session == null) {
            LOG.debug("Session was not in cache, retrieving or creating from database");
            // cache miss, or no session in server
            session = getSessionFromDb(clientSessionId);
            this.sessionCache.put(clientSessionId, session);
        }
        return session;
    }

    /**
     * checks the database for the server session, and creates one if not present
     * 
     * @param clientSessionId the key identifying the session
     * @return the sesion that was or has now been persisted
     */
    private Session getSessionFromDb(final String clientSessionId) {
        final Session serverSession = this.ebean.find(Session.class).fetch("user", "id, name").where()
                .eq("jSessionId", clientSessionId).findUnique();

        // we create a server session
        if (serverSession == null) {
            LOG.debug("Server session was not present");
            return createSession();
        }

        // deal with expired sessions... This should never happen has a cache miss should have cleared out,
        // but all the same
        if (Calendar.getInstance().after(serverSession.getExpiresOn())) {
            // session has expired, so we remove the reference to the user and update the expiry date
            serverSession.setUser(null);
            serverSession.setExpiresOn(getExpiryTime());
            this.ebean.update(serverSession);
        }

        return serverSession;
    }

    /**
     * Creates a session in the database
     * 
     * @return the session that was created
     */
    Session createSession() {
        final Session session = new Session();
        final ClientSession clientSession = this.clientSessionProvider.get();
        session.setJSessionId(clientSession.getSessionId());
        session.setIpAddress(clientSession.getIpAddress());
        session.setExpiresOn(getExpiryTime());

        LOG.debug("Persisting session (jSessionId=[{}],ip=[{}])", session.getJSessionId(),
                session.getIpAddress());
        this.ebean.save(session);
        return session;
    }

    /**
     * Simply add today to the expiry period and return
     * 
     * @return the time at which the session will expire
     */
    private Timestamp getExpiryTime() {
        final Calendar expiryDate = Calendar.getInstance();
        expiryDate.add(Calendar.DAY_OF_YEAR, this.expiryPeriod);
        return new Timestamp(expiryDate.getTimeInMillis());
    }
}
