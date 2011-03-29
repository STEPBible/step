package com.tyndalehouse.step.core.guice.providers;

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
import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.caches.SessionCache;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.models.ClientSession;

/**
 * Testing various methods in the server-side session provider
 * 
 * @author Chris
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class ServerSessionProviderTest extends DataDrivenTestExtension {
    @Mock
    private Provider<ClientSession> clientSessionProvider;
    @Mock
    private SessionCache sessionCache;
    private ServerSessionProvider serverSessionProvider;

    /**
     * sets up the user service under test
     */
    @Before
    public void setUp() {
        // MockitoAnnotations.initMocks(this);
        this.serverSessionProvider = new ServerSessionProvider(super.getEbean(), this.clientSessionProvider,
                this.sessionCache, 10);
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
        this.serverSessionProvider.createSession();

        final Session persistedSession = getEbean().find(Session.class).where()
                .eq("jSessionId", testClientSessionId).findUnique();
        assertEquals(persistedSession.getIpAddress(), testIpAddress);
        assertTrue(persistedSession.getExpiresOn().after(new Date()));
    }
}
