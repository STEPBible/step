package com.tyndalehouse.step.core.service.jsword.impl;

import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.utils.TestUtils;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.system.Versifications;
import org.junit.Test;

import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

/**
 * The Class JSwordAnalysisServiceImplTest.
 */
public class JSwordAnalysisServiceImplTest {

    /**
     * Test pattern is correct.
     */
    @Test
    public void testPatternIsCorrect() {
        Pattern.compile(JSwordAnalysisServiceImpl.WORD_SPLIT);
    }

    @Test
    public void testExpand() throws NoSuchKeyException {
        JSwordAnalysisServiceImpl impl = new JSwordAnalysisServiceImpl(TestUtils.mockVersificationService(), null, null);

        //normal use cases
        assertEquals("Gen.3", impl.getExpandedBookData(get("Gen.3.3"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen.2-Gen.4", impl.getExpandedBookData(get("Gen.3.3"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen", impl.getExpandedBookData(get("Gen.3.3"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

        //beginning of a book
        assertEquals("Gen.1", impl.getExpandedBookData(get("Gen.1.3"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen.1-Gen.2", impl.getExpandedBookData(get("Gen.1.3"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen", impl.getExpandedBookData(get("Gen.1.3"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

        //end of a book
        assertEquals("Rev.22", impl.getExpandedBookData(get("Rev.22.3"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Rev.21-Rev.22", impl.getExpandedBookData(get("Rev.22.3"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Rev", impl.getExpandedBookData(get("Rev.22.3"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

        //test short book
        assertEquals("3John", impl.getExpandedBookData(get("3John.2"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("3John", impl.getExpandedBookData(get("3John.2"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("3John", impl.getExpandedBookData(get("3John.2"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

        //test cross chapter
        assertEquals("Gen.3-Gen.4", impl.getExpandedBookData(get("Gen.3.3-Gen.4.2"), ScopeType.CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen.2-Gen.5", impl.getExpandedBookData(get("Gen.3.3-Gen.4.2"), ScopeType.NEAR_BY_CHAPTER, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());
        assertEquals("Gen", impl.getExpandedBookData(get("Gen.3.3-Gen.4.2"), ScopeType.BOOK, impl.getStrongsV11n(), impl.getStrongsBook()).getKey().getOsisRef());

    }

    /**
     * a simple wrapper method to get a proper passage
     * @param key the key
     * @return the passage
     * @throws NoSuchKeyException an unhandled exception
     */
    private Passage get(String key) throws NoSuchKeyException {
        return PassageKeyFactory.instance().getKey(Versifications.instance().getVersification(Versifications.DEFAULT_V11N), key);
    }
}
