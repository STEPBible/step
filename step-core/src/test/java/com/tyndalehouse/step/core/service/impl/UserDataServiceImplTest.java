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
package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.inject.Provider;
import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.entities.User;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.ClientSession;

/**
 * tests the paths through the user data service
 * 
 * @author Chris
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class UserDataServiceImplTest extends DataDrivenTestExtension {
    private static final int TEST_NUM_ENCRYPT_ITERATIONS = 1;
    @Mock
    private Provider<Session> serverSessionProvider;
    @Mock
    private Provider<ClientSession> clientSessionProvider;
    private UserDataServiceImpl userService;

    /**
     * sets up the user service under test
     */
    @Before
    public void setUp() {
        // MockitoAnnotations.initMocks(this);
        this.userService = new UserDataServiceImpl(super.getEbean(), this.serverSessionProvider,
                TEST_NUM_ENCRYPT_ITERATIONS, "UTF-8", "SHA-1", "SHA1PRNG", 8);
    }

    /**
     * Tests the successful path of registering a user
     */
    @Test
    public void testRegisterUser() {
        final String testEmail = "abc@abc.com";
        final String testName = "Mr Test";
        final String testCountry = "UK";
        final String testPassword = "password";

        // we will return with a session object with null fields
        final Session mockSession = new Session();
        mockSession.setJSessionId("1");
        when(this.serverSessionProvider.get()).thenReturn(mockSession);

        this.userService.register(testEmail, testName, testCountry, testPassword);

        final Session session = getEbean().find(Session.class).fetch("user").where()
                .eq("user.emailAddress", testEmail).findUnique();
        final User user = session.getUser();

        assertEquals(user.getEmailAddress(), testEmail);
        assertEquals(user.getName(), testName);
        assertEquals(user.getCountry(), testCountry);
    }

    /**
     * Tests the successful path of registering a user
     */
    @Test(expected = IllegalArgumentException.class)
    public void testRegisterUserWhenLoggedIn() {
        final String testEmail = "abc@abc.com";
        final String testName = "Mr Test";
        final String testCountry = "UK";
        final String testPassword = "password";

        // we will return with a session object with null fields
        final Session mockSession = new Session();
        mockSession.setUser(new User());
        when(this.serverSessionProvider.get()).thenReturn(mockSession);

        this.userService.register(testEmail, testName, testCountry, testPassword);
    }

    /**
     * we check that login in creates a row in the session table mapped to a user
     * 
     */
    @Test(expected = StepInternalException.class)
    public void testLoginFail() {
        final String email = "chris@chris.com";
        final String password = "not_registered";
        this.userService.login(email, password);
    }

    /**
     * we check that login in creates a row in the session table mapped to a user we also check that the hash
     * creating the user is used on retrieval of the user
     */
    @Test
    public void testLoginPass() {
        final String email = "chris@chris.com";
        final String password = "someValidPassword";
        final String testName = "Mr Bob";
        final Session currentServerSession = new Session();
        final ClientSession mockClient = mock(ClientSession.class);
        when(mockClient.getSessionId()).thenReturn("202");
        when(this.clientSessionProvider.get()).thenReturn(mockClient);
        when(this.serverSessionProvider.get()).thenReturn(currentServerSession);

        // save the user in a database
        final User u = new User();
        u.setEmailAddress(email);
        final byte[] salt = "abcdefg".getBytes();
        u.setSalt(salt);
        u.setPassword(this.userService.getHash(TEST_NUM_ENCRYPT_ITERATIONS, password, salt));
        u.setName(testName);
        getEbean().save(u);

        this.userService.login(email, password);

        // check that the user is logged in
        assertEquals(currentServerSession.getUser().getName(), testName);
    }

}
