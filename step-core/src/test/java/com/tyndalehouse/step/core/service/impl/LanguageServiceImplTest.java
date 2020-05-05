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

import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Locale;

import javax.inject.Provider;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.Language;

/**
 * Tests {@link LanguageServiceImpl}
 */
@RunWith(MockitoJUnitRunner.class)
public class LanguageServiceImplTest {
    @Mock
    private Provider<ClientSession> clientSessionProvider;

    /**
     * Sets up the test mocks
     */
    @Before
    public void setUp() {
        final ClientSession clientSession = mock(ClientSession.class);
        when(this.clientSessionProvider.get()).thenReturn(clientSession);
        when(clientSession.getLocale()).thenReturn(Locale.ENGLISH);
    }

    /**
     * Checks that languages are read adequaltey
     */
    @Test
    public void testGetLanguages() {
        final LanguageServiceImpl languageServiceImpl = new LanguageServiceImpl(
                "ru,uk,zh,zh_TW,es,mk,fr,bg,sw,ar,vi,fi,no,tr,pt-BR,en", "en", "en", this.clientSessionProvider);
        final List<Language> availableLanguages = languageServiceImpl.getAvailableLanguages();
        assertTrue(availableLanguages.size() > 10);

        // check "francais" has been marked to be "Francais"
        for (final Language language : availableLanguages) {
            if ("fr".equals(language.getCode())) {
                // check capitalisation
                assertTrue(language.getOriginalLanguageName().equals("Fran\u00e7ais"));
                break;
            }
        }
    }
}
