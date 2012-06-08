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
package com.tyndalehouse.step.core.guice.providers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Date;

import javax.inject.Provider;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.caches.SessionCache;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.models.ClientSession;

/**
 * Testing various methods in the server-side session provider
 * 
 * @author chrisburrell
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
