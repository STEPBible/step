package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Date;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.inject.Provider;
import com.tyndalehouse.step.core.data.AbstractDataTest;
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
public class UserDataServiceImplTest extends AbstractDataTest {
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
                this.clientSessionProvider);
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
        assertEquals(user.getPassword(), testPassword);
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
     * we check that login in creates a row in the session table mapped to a user
     * 
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
        u.setPassword(password);
        u.setName(testName);
        getEbean().save(u);

        this.userService.login(email, password);

        // check that the user is logged in
        assertEquals(currentServerSession.getUser().getName(), testName);
    }

    /**
     * we check that we can create a session
     */
    @Test
    public void testCreateSession() {
        final String testClientSessionId = "999";
        final String testIpAddress = "xx.xxx.xx.xx";
        final ClientSession clientSession = mock(ClientSession.class);
        when(this.clientSessionProvider.get()).thenReturn(clientSession);
        when(clientSession.getSessionId()).thenReturn(testClientSessionId);
        when(clientSession.getIpAddress()).thenReturn(testIpAddress);
        this.userService.createSession();

        final Session persistedSession = getEbean().find(Session.class).where()
                .eq("jSessionId", testClientSessionId).findUnique();
        assertEquals(persistedSession.getIpAddress(), testIpAddress);
        assertTrue(persistedSession.getExpiresOn().after(new Date()));
    }
}
