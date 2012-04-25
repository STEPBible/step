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
package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.data.entities.User;

/**
 * This service gives information about the user, allows his to register, does session management, etc.
 * 
 * <p />
 * Firstly, createSession() is called to register the server session. This is an anonymous session but helps
 * us keep track of concurrent users. We can possibly run a job on the server version to do some stats on the
 * ip addresses that we log.
 * 
 * Secondly, we expect the user might want to register to access some specific features (notes, bookmarks)
 * 
 * Thirdly, we expect a user to login with his [email/password] combo.
 * 
 * Fourthly, we can access everything through the session, without need for username, etc.
 * 
 * @author Chris
 * 
 */
public interface UserDataService {

    /**
     * Registers and stores the user details.
     * 
     * @param emailAddress the email address
     * @param name the name of the person [optional]
     * @param country his country [optional]
     * @param password the password he has chosen, which we should SHA-1 and salt
     * @return the user that has been created
     */
    User register(String emailAddress, String name, String country, String password);

    /**
     * Associates the current session with the username assuming password and username authenticates
     * 
     * @param emailAddress the email address is used as the login token
     * @param password the password
     * @return the user that has logged in
     */
    User login(String emailAddress, String password);

    /**
     * logs the current user out
     */
    void logout();

    /**
     * @return the logged in user if the user is logged in
     */
    User getLoggedInUser();

    /**
     * From a password, a number of iterations and a salt, returns the corresponding digest
     * 
     * @param iterationNb int The number of iterations of the algorithm
     * @param password String The password to encrypt
     * @param salt byte[] The salt
     * @return The digested password
     */
    byte[] getHash(int iterationNb, String password, byte[] salt);
}
