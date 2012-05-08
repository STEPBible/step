/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.rest.controllers;

import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.service.UserDataService;

/**
 * Gives access to the user data of the application
 * 
 * @author chrisburrell
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
