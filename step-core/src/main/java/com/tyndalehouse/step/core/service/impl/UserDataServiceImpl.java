package com.tyndalehouse.step.core.service.impl;

import static com.avaje.ebean.Expr.eq;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
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
    private static final String USER_ID_FIELD = "id";
    private static final String UNABLE_TO_LOGIN_MESSAGE = "Unable to login with username/password provided";
    private static final Logger LOG = LoggerFactory.getLogger(UserDataServiceImpl.class);
    private final int numCryptoIterations;
    private final int saltLength;
    private final String inputEncoding;
    private final String hashingAlgorithm;
    private final String saltingRandomAlgorithm;
    private final Provider<Session> sessionProvider;
    private final EbeanServer ebean;

    /**
     * sessions change at runtime based on which request we are serving
     * 
     * @param ebean the ebean server to persist and load data
     * @param sessionProvider the session provider
     * @param numCryptoIterations the number of iterations that should be performed when encrypting
     * @param inputEncoding the encoding of the input password
     * @param hashingAlgorithm what algorithm to use for hashing the password
     * @param saltingRandomAlgorithm what algorithm to use for salting
     * @param saltLength the length of the salt that should be obtained in bytes (e.g 8 for 64-bit)
     */
    @Inject
    public UserDataServiceImpl(final EbeanServer ebean, final Provider<Session> sessionProvider,
            @Named("app.security.numIterations") final int numCryptoIterations,
            @Named("app.security.inputEncoding") final String inputEncoding,
            @Named("app.security.hashingAlgorithm") final String hashingAlgorithm,
            @Named("app.security.saltingAlgorithm") final String saltingRandomAlgorithm,
            @Named("app.security.saltLength") final int saltLength) {
        this.ebean = ebean;
        this.sessionProvider = sessionProvider;
        this.numCryptoIterations = numCryptoIterations;
        this.inputEncoding = inputEncoding;
        this.hashingAlgorithm = hashingAlgorithm;
        this.saltingRandomAlgorithm = saltingRandomAlgorithm;
        this.saltLength = saltLength;

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
        // however we salt the password as we do...
        final byte[] salt = getRandomSalt();

        final User u = new User();
        u.setEmailAddress(emailAddress);
        u.setName(name);
        u.setCountry(country);
        u.setPassword(getHash(this.numCryptoIterations, password, salt));
        u.setSalt(salt);

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
        final User user = this.ebean.find(User.class).select("id, name, salt").where()
                .eq("emailAddress", emailAddress).findUnique();

        if (user == null) {
            throw new StepInternalException(UNABLE_TO_LOGIN_MESSAGE);
        }

        // compute salt and check password leaving password in DB (we could optimise, but
        // that would require removing the encrypted password from the database (?)
        final byte[] salt = user.getSalt();

        final int matchingPasswords = this.ebean
                .find(User.class)
                .select(USER_ID_FIELD)
                .where()
                .and(eq(USER_ID_FIELD, user.getId()),
                        eq("password", getHash(this.numCryptoIterations, password, salt))).findRowCount();

        // couldn't authenticate?
        if (matchingPasswords != 1) {
            throw new StepInternalException(UNABLE_TO_LOGIN_MESSAGE);
        }

        // WORKAROUND: ideally we want to be able to specify/annotate fields that should not be serialised
        return login(this.ebean.find(User.class).select("id, name").where().eq(USER_ID_FIELD, user.getId())
                .findUnique());
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

    /**
     * @return a securely generated random salt
     */
    private byte[] getRandomSalt() {
        SecureRandom random;
        try {
            random = SecureRandom.getInstance(this.saltingRandomAlgorithm);
            final byte[] bSalt = new byte[this.saltLength];
            random.nextBytes(bSalt);
            return bSalt;
        } catch (final NoSuchAlgorithmException e) {
            throw new StepInternalException("Can't generate salt", e);
        }
    }

    @Override
    public byte[] getHash(final int iterationNb, final String password, final byte[] salt) {
        MessageDigest digest;
        byte[] input = null;
        try {
            digest = MessageDigest.getInstance(this.hashingAlgorithm);
            digest.reset();
            digest.update(salt);
            input = digest.digest(password.getBytes(this.inputEncoding));
            for (int i = 0; i < iterationNb; i++) {
                digest.reset();
                input = digest.digest(input);
            }
        } catch (final NoSuchAlgorithmException e) {
            throw new StepInternalException("Unable to find encryption algorithm", e);
        } catch (final UnsupportedEncodingException e) {
            throw new StepInternalException("Unable carry out encryption", e);
        }

        return input;
    }
}
