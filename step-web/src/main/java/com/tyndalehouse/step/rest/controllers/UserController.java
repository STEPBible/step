package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.CONTROLLER_INITIALISATION_ERROR;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;
import static com.tyndalehouse.step.rest.framework.RequestUtils.validateSession;

import javax.inject.Provider;

import com.google.inject.Inject;
import com.google.inject.servlet.RequestScoped;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.UserService;

/**
 * Checking user is registered
 */
@RequestScoped
public class UserController {
    private final UserService userService;
    private final Provider<ClientSession> sessionProvider;

    /**
     * @param userService the main user service
     * @param sessionProvider the provider of request sessions
     */
    @Inject
    public UserController(final UserService userService, final Provider<ClientSession> sessionProvider) {
        notNull(userService, "Failed to initialise User Controller, userService was null",
                CONTROLLER_INITIALISATION_ERROR);
        notNull(sessionProvider, "Failed to initialise User Controller, sessionProvider was null",
                CONTROLLER_INITIALISATION_ERROR);
        this.userService = userService;
        this.sessionProvider = sessionProvider;

    }

    /**
     * checks a user is valid
     * 
     * @param email the email of the user
     * @param name the name of the user
     * @return true if valid user
     */
    public boolean checkValidUser(final String email, final String name) {
        return this.userService.checkUserIdentity(email, name);
    }

    /**
     * @param enable the enabled to set, true to enable
     */
    public void enable(final String enable) {
        validateSession(this.sessionProvider);
        this.userService.setEnabled(Boolean.TRUE.toString().equals(enable));
    }

    /**
     * @param autoregister true to automatically create new users
     */
    public void autoregister(final String autoregister) {
        validateSession(this.sessionProvider);
        this.userService.setAutoRegister(Boolean.TRUE.toString().equals(autoregister));
    }

    /** refreshes the list of users */
    public void refresh() {
        validateSession(this.sessionProvider);
        this.userService.refresh();
    }

}
