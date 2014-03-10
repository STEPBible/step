package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.models.search.SubjectSuggestion;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordSearchServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordVersificationServiceImpl;
import com.tyndalehouse.step.core.service.search.impl.SubjectSearchServiceImpl;
import com.tyndalehouse.step.core.utils.TestUtils;
import org.crosswire.jsword.book.Books;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import java.util.List;

import static com.tyndalehouse.step.core.utils.TestUtils.mockVersificationService;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Tests SubjectSearchServiceImpl
 * @author chrisburrell
 */
@RunWith(MockitoJUnitRunner.class)
public class SubjectSearchServiceImplTest {
    public static final String prefix = "lov";
    
    @Mock
    private EntityManager entityManager;
    private SubjectSearchServiceImpl subjectSearchService;
    
    @Before
    public void setup() {
        when(entityManager.getReader(any(String.class))).thenReturn(mock(EntityIndexReader.class));
        this.subjectSearchService = new SubjectSearchServiceImpl(
                entityManager, 
                new JSwordSearchServiceImpl(mockVersificationService(),null, null), null);
        
    }
    
    /**
     * Tests that lookups work
     */
    @Test
    public void testSimpleSubjectAutoComplete() {
        final List<SubjectSuggestion> prefixedTerms = subjectSearchService.autocomplete("Lov");
        assertTrue(prefixedTerms.size() > 0);
        for(SubjectSuggestion prefixedTerm : prefixedTerms) {
            assertTrue(prefixedTerm.getValue().startsWith(prefix) );       
        }
    }
}

