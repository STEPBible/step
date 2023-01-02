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
