package com.tyndalehouse.step.core.xsl.impl;

import com.tyndalehouse.step.core.service.VocabularyService;
import org.crosswire.common.util.Language;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.passage.PassageKeyFactory;
import org.crosswire.jsword.passage.VerseFactory;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.system.Versifications;
import org.junit.Test;

import java.lang.reflect.InvocationTargetException;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * A simple test class to test to the provider
 */
public class InterlinearProviderImplTest {
    /**
     * this checks that when keyed with strong, morph and verse number, we can retrieve the word. We should be
     * able to retrieve by (strong,morph), regardless of verse number. We should also be able to retrieve by
     * (strong,verse number)
     * 
     * @throws InvocationTargetException reflection exception which should fail the test
     * @throws IllegalAccessException reflection exception which should fail the test
     * @throws NoSuchMethodException reflect exception which should fail the test
     */
    @Test
    public void testInterlinearStrongMorphBased() throws NoSuchKeyException {
        final InterlinearProviderImpl interlinear = new InterlinearProviderImpl();
        final Book mock = mock(Book.class);
        final VocabularyService vocabularyService = mock(VocabularyService.class);
        interlinear.setCurrentBook(mock);
        interlinear.setVocabProvider(vocabularyService);
        when(mock.getLanguage()).thenReturn(new Language("fr"));


        // NOTE: because we don't want to expose a method called during initialisation as non-private (could
        // break
        // the initialisation, of the provider, we use reflection to open up its access for testing purposes!

        Versification NRSV = Versifications.instance().getVersification("NRSV");
        interlinear.addTextualInfo(VerseFactory.fromString(NRSV, "Gen.1.1"), "strong", "word", "");
        assertEquals(interlinear.getWord(PassageKeyFactory.instance().getKey(
                NRSV, "Gen.1.1"), "strong", false), "word");
        assertEquals(interlinear.getWord(PassageKeyFactory.instance().getKey(
                NRSV, "Gen.2.1"), "strong", false), "");
    }
}
