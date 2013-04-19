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
