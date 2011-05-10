package com.tyndalehouse.step.rest.controllers;

import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.service.UserDataService;

/**
 * Gives access to the user data of the application
 * 
 * @author Chris
 * 
 */
public class UserController {
    private final UserDataService userDataService;

    /**
     * we need access to the user data service for this
     * 
     * @param userDataService the service that allows us to carry out user operations
     */
    @Inject
    public UserController(final UserDataService userDataService) {
        this.userDataService = userDataService;
    }

    /**
     * Registers and stores the user details.
     * 
     * @param emailAddress the email address
     * @param name the name of the person [optional]
     * @param country his country [optional]
     * @param password the password he has chosen, which we should SHA-1 and salt
     * @return the registered user
     * 
     */
    public User register(final String emailAddress, final String name, final String country,
            final String password) {

        // do sha1 encoding here to avoid sending unencrypted string singletons all over the place...
        return this.userDataService.register(emailAddress, name, country, password);
    }

    /**
     * Associates the current session with the username assuming password and username authenticates
     * 
     * @param emailAddress the email address is used as the login token
     * @param password the password
     * @return the user that has logged in
     */
    public User login(final String emailAddress, final String password) {
        return this.userDataService.login(emailAddress, password);
    }

    /**
     * Logs a user out
     */
    public void logout() {
        this.userDataService.logout();
    }

    /**
     * @return true if logged in
     */
    public User getLoggedInUser() {
        return this.userDataService.getLoggedInUser();
    }
}
