package com.tyndalehouse.step.core.service.impl;

import static com.avaje.ebean.Expr.eq;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
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
    private static final Logger LOG = LoggerFactory.getLogger(UserDataServiceImpl.class);
    private final Provider<Session> sessionProvider;
    private final EbeanServer ebean;

    /**
     * sessions change at runtime based on which request we are serving
     * 
     * @param ebean the ebean server to persist and load data
     * @param sessionProvider the session provider
     */
    @Inject
    public UserDataServiceImpl(final EbeanServer ebean, final Provider<Session> sessionProvider) {
        this.ebean = ebean;
        this.sessionProvider = sessionProvider;
    }

    @Override
    public User register(final String emailAddress, final String name, final String country,
            final String password) {

        LOG.debug("Registering user [{}] with email address [{}]", name, emailAddress);

        // first check that are we not logged in!
        final Session session = this.sessionProvider.get();

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
        return this.login(u);
    }

    @Override
    public User getLoggedInUser() {
        final Session session = this.sessionProvider.get();
        if (session == null) {
            LOG.debug("There was no user no logged in");
            return null;
        }

        LOG.debug("Returning a user ");
        return session.getUser();
    }

    @Override
    public User login(final String emailAddress, final String password) {
        LOG.debug("Logging [{}] in to the system", emailAddress);

        // logging in basically means associating the user with the session
        final User user = this.ebean.find(User.class).select("id, name").where()
                .and(eq("emailAddress", emailAddress), eq("password", password)).findUnique();

        // couldn't authenticate?
        if (user == null) {
            throw new StepInternalException("Unable to login with username/password provided");
        }

        return login(user);
    }

    /**
     * A way of logging in without authenticating
     * 
     * @param user the user that requires loggin in
     * @return the user once logged in
     */
    private User login(final User user) {
        final Session serverSession = this.sessionProvider.get();
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
