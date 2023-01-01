package com.tyndalehouse.step.core.utils;

import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.entities.impl.TestEntityManager;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordVersificationServiceImpl;

/**
 * static utilities for testing, creating entities, etc.
 * 
 * @author chrisburrell
 * 
 */
public final class TestUtils {
    /**
     * no op
     */
    private TestUtils() {
        // no op
    }

    /**
     * writes entities to the index
     * 
     * @param entityName the name of the entity
     * @param fields the fields in the entity
     */
    public static void createEntities(final String entityName, final String... fields) {
        final TestEntityManager manager = new TestEntityManager();
        final EntityIndexWriterImpl newWriter = manager.getNewWriter(entityName);

        for (int ii = 0; ii < fields.length; ii = ii + 2) {
            newWriter.addFieldToCurrentDocument(fields[ii], fields[ii + 1]);
        }
        newWriter.save();
        newWriter.close();
        manager.close();
    }

    /**
     * Mock versification service, such that it always returns a book
     * 
     * @return the j sword versification service
     */
    public static JSwordVersificationService mockVersificationService() {
        final VersionResolver resolver = mockVersionResolver();
        final JSwordVersificationService versification = new JSwordVersificationServiceImpl(resolver);
        return versification;
    }

    /**
     * Mocks a version resolver.
     * 
     * @return the version resolver
     */
    public static VersionResolver mockVersionResolver() {
        final VersionResolver resolver = mock(VersionResolver.class);
        when(resolver.getLongName(anyString())).thenAnswer(new Answer<String>() {

            @Override
            public String answer(final InvocationOnMock invocation) {
                return (String) invocation.getArguments()[0];
            }
        });
        when(resolver.getShortName(anyString())).thenAnswer(new Answer<String>() {

            @Override
            public String answer(final InvocationOnMock invocation) {
                return (String) invocation.getArguments()[0];
            }
        });
        return resolver;
    }
}
