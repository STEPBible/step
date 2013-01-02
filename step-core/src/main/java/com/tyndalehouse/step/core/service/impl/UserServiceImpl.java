package com.tyndalehouse.step.core.service.impl;

import static com.tyndalehouse.step.core.utils.IOUtils.closeQuietly;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.UserService;
import com.tyndalehouse.step.core.utils.IOUtils;

/**
 * A user service implementation, that checks whether a user is allowed in. Then given a number of parameters,
 * either registers the user automatically, or denies access...
 * 
 * @author chrisburrell
 */
@Singleton
public class UserServiceImpl implements UserService {
    private static final Pattern EMAIL = Pattern
            .compile("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
    private static final Logger LOGGER = LoggerFactory.getLogger(UserServiceImpl.class);
    private final File usersFile;
    private boolean autoRegister;
    private boolean enabled;
    private volatile Set<String> users = null;
    private volatile Writer userWriter;
    private volatile boolean refreshUsers = false;

    /**
     * Creates a user service
     * 
     * @param autoRegister true if users are automatically registered and allowed through
     * @param enabled true to indicate a check should be performed
     * @param usersFileName the location of the users file
     */
    @Inject
    public UserServiceImpl(@Named("app.user.autoregister") final boolean autoRegister,
            @Named("app.user.enablecheck") final boolean enabled,
            @Named("app.user.data") final String usersFileName) {
        this.autoRegister = autoRegister;
        this.enabled = enabled;
        this.usersFile = new File(usersFileName);
    }

    @Override
    public boolean checkUserIdentity(final String email, final String name) {
        validateEmail(email);

        if (!this.enabled) {
            return true;
        }

        ensureUsers();
        final String properEmail = email.toLowerCase(Locale.ENGLISH);
        if (this.users.contains(properEmail)) {
            return true;
        }

        // otherwise check auto register
        if (this.autoRegister) {
            // add users to files
            try {
                createUser(properEmail, name);
                return true;
            } catch (final StepInternalException ex) {
                LOGGER.warn("Unable to write user. enabled=[{}], autoRegister=[{}]", this.enabled,
                        this.autoRegister);
                LOGGER.info("Stack for write user exception is", ex);

            }
        }

        return false;
    }

    /**
     * throws an exception if the email address is invalid
     * 
     * @param email email address
     */
    private void validateEmail(final String email) {
        if (!EMAIL.matcher(email).matches()) {
            throw new StepInternalException("An invalid email was provided.");
        }

    }

    @Override
    public void refresh() {
        this.refreshUsers = true;
        this.enabled = true;
    }

    /**
     * @param email the email address of the user
     * @param name the name of the user
     */
    private synchronized void createUser(final String email, final String name) {

        ensureFileIsOpenForWrite();
        try {
            this.userWriter.write(email);
            this.userWriter.write(',');
            this.userWriter.write(name);
            this.userWriter.write(',');
            this.userWriter.write(new SimpleDateFormat("yyyy-MMM-dd HH:mm:ss", Locale.ENGLISH)
                    .format(new Date()));
            this.userWriter.write('\n');
            this.userWriter.flush();

            this.users.add(email);
        } catch (final IOException e) {
            IOUtils.closeQuietly(this.userWriter);
            throw new StepInternalException("Unable to write user", e);
        }
    }

    /** opens the user writer if not already open */
    private void ensureFileIsOpenForWrite() {
        if (this.enabled && this.userWriter == null) {
            synchronized (this) {
                if (this.enabled && this.userWriter == null) {
                    try {
                        this.userWriter = new FileWriter(this.usersFile, true);
                    } catch (final IOException e) {
                        LOGGER.error("Unable to open writer", e);
                        IOUtils.closeQuietly(this.userWriter);
                    }
                }
            }
        }
    }

    /** populates the user reader if not already populated */
    private void ensureUsers() {
        if (this.users == null || this.refreshUsers) {
            synchronized (this) {
                if (this.users == null || this.refreshUsers) {
                    this.users = null;
                    this.refreshUsers = false;
                    this.users = readUsersFile();
                }
            }
        }
    }

    /**
     * @return a set of users
     */
    private synchronized Set<String> readUsersFile() {
        final Set<String> usersFromFile = new HashSet<String>();
        if (!this.usersFile.exists()) {
            return usersFromFile;
        }

        FileInputStream fis = null;
        BufferedReader reader = null;
        InputStreamReader isr = null;
        try {
            fis = new FileInputStream(this.usersFile);
            isr = new InputStreamReader(fis);
            reader = new BufferedReader(isr);

            String line = null;
            while ((line = reader.readLine()) != null) {
                final String[] userEntry = line.split("[,]+");
                if (userEntry.length < 2) {
                    LOGGER.warn("Invalid user entry: [{}]", line);
                    continue;
                }

                // add email to hashset
                usersFromFile.add(userEntry[0]);
            }
        } catch (final IOException e) {
            throw new StepInternalException("Unable to read file", e);
        } finally {
            IOUtils.closeQuietly(fis);
            IOUtils.closeQuietly(isr);
            IOUtils.closeQuietly(reader);
        }

        return usersFromFile;
    }

    /**
     * @param users the users to set
     */
    void setUsers(final Set<String> users) {
        this.users = users;
    }

    /**
     * @param userWriter the userWriter to set
     */
    void setUserWriter(final Writer userWriter) {
        this.userWriter = userWriter;
    }

    @Override
    public void setAutoRegister(final boolean autoRegister) {
        this.autoRegister = autoRegister;
    }

    @Override
    public void setEnabled(final boolean enabled) {
        this.enabled = enabled;

        if (!enabled) {
            // close writer
            synchronized (this) {
                closeQuietly(this.userWriter);
            }
        }
    }
}
