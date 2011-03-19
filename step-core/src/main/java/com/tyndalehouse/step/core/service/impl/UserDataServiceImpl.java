package com.tyndalehouse.step.core.service.impl;

import static com.avaje.ebean.Expr.eq;

import java.util.Calendar;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.UserDataService;

/**
 * An implementation of the user data service allowing us to register, login and create sessions. This class
 * is injected with a guice provider which changes at runtime.
 * 
 * The session allows us access to the user that is currently logged in. If no user is logged in then, we can
 * register / login
 * 
 */
@Singleton
public class UserDataServiceImpl implements UserDataService {
    private static final int EXPIRY_SESSION_INTERVAL = 30;
    private static final Logger LOG = LoggerFactory.getLogger(UserDataServiceImpl.class);
    private final Provider<Session> sessionProvider;
    private final EbeanServer ebean;
    private final Provider<ClientSession> clientSessionProvider;

    /**
     * sessions change at runtime based on which request we are serving
     * 
     * @param ebean the ebean server to persist and load data
     * @param sessionProvider the session provider
     * @param clientSessionProvider the client session (cookie information + ip address)
     */
    @Inject
    public UserDataServiceImpl(final EbeanServer ebean, final Provider<Session> sessionProvider,
            final Provider<ClientSession> clientSessionProvider) {
        this.ebean = ebean;
        this.sessionProvider = sessionProvider;
        this.clientSessionProvider = clientSessionProvider;
    }

    @Override
    public void register(final String emailAddress, final String name, final String country,
            final String password) {
        // first check that are we not logged in!
        Session session = this.sessionProvider.get();

        // check we have a session, otherwise create one for ourselves (this should be catered
        if (session == null || Calendar.getInstance().after(session.getExpiresOn())) {
            // the session is either non-existent or exists but has expired, so recreate one:
            createSession();
            session = this.sessionProvider.get();
            assert session != null;
        }

        if (session.getUser() != null) {
            throw new IllegalArgumentException("You cannot register, as you are already logged in.");
        }

        // it is easy enough to register, just create a user and save to the database
        final User u = new User();
        u.setEmailAddress(emailAddress);
        u.setName(name);
        u.setCountry(country);
        u.setPassword(password);

        this.ebean.save(u);

        // next, we just associate the current session with the user by logging in
        this.login(emailAddress, password);
    }

    @Override
    public Session createSession() {
        // TODO we can't use subclassing on Android so remove in preference to enhancements
        // final Session session = this.ebean.createEntityBean(Session.class);
        final Session session = new Session();
        final ClientSession clientSession = this.clientSessionProvider.get();

        // TODO we ensure that we expire the sessions after a while of inactivity
        // so we will need to add a filter to ensure this actually happens.
        // i.e. update the time of the session asynchronously if possible
        // write a job that deletes expired sessions
        // this also needs to match up with the value in the client session really
        final Calendar expiryDate = Calendar.getInstance();
        expiryDate.add(Calendar.DAY_OF_YEAR, EXPIRY_SESSION_INTERVAL);

        session.setJSessionId(clientSession.getSessionId());
        session.setIpAddress(clientSession.getIpAddress());
        session.setExpiresOn(new Date(expiryDate.getTimeInMillis()));

        LOG.debug("Persisting session (jSessionId=[{}],ip=[{}]", session.getJSessionId(),
                session.getIpAddress());
        this.ebean.save(session);
        return session;
    }

    @Override
    public User login(final String emailAddress, final String password) {
        // logging in basically means associating the user with the session
        final Session serverSession = this.sessionProvider.get();

        final User user = this.ebean.find(User.class).select("id, name").where()
                .and(eq("emailAddress", emailAddress), eq("password", password)).findUnique();

        // couldn't authenticate?
        if (user == null) {
            throw new StepInternalException("Unable to login with username/password provided");
        }

        serverSession.setUser(user);

        // saving the session
        this.ebean.save(serverSession);

        return user;
    }

    @Override
    public void logout() {
        // simply delete the session from the db
        this.ebean.delete(this.sessionProvider.get());
    }
}
