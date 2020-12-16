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
package com.tyndalehouse.step.rest.controllers;

import static org.junit.Assert.fail;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.service.PassageOptionsValidationService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.exceptions.ValidationException;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.guice.providers.ClientSessionProvider;

/**
 * tests the bible controller
 * 
 * @author chrisburrell
 * 
 */
@SuppressWarnings("unchecked")
@RunWith(MockitoJUnitRunner.class)
public class BibleControllerTest {
    private final BibleInformationService bibleInformation = mock(BibleInformationService.class);

    @Mock
    private PassageOptionsValidationService optionsValidationService;

    @Mock
    private ClientSessionProvider clientSessionProvider;
    private BibleController testController;

    /**
     * sets the test up
     */
    @Before
    public void setUp() {
        this.testController = new BibleController(this.bibleInformation, this.clientSessionProvider, optionsValidationService);
    }

    /**
     * tests that we call correct method
     */
    @Test
    public void testGetBibleVersions() {
        final ClientSession clientSessionMock = mock(ClientSession.class);
        when(clientSessionMock.getLocale()).thenReturn(Locale.getDefault());
        when(this.clientSessionProvider.get()).thenReturn(clientSessionMock);

        // do test
        this.testController.getModules("true");
        verify(this.bibleInformation).getAvailableModules(true, null, Locale.getDefault());
    }

    /**
     * check that exception is thrown if no version provided
     */
    @Test(expected = ValidationException.class)
    public void testGetBibleTextNoVersion() {
        this.testController.getBibleText(null, "Ref");
    }

    /**
     * check that exception is thrown if no version provided
     */
    @Test(expected = ValidationException.class)
    public void testGetBibleTextNoVersionWithOptions() {
        this.testController.getBibleText(null, "Ref", "options");
    }

    /**
     * check that exception is thrown if no version provided
     */
    @Test(expected = ValidationException.class)
    public void testGetBibleTextNoVersionWithOptionsAndInterlinear() {
        this.testController.getBibleText(null, "Ref", "options", "interlinear", null);
    }

    /**
     * check that exception is thrown if no reference is provided
     */
    @Test(expected = ValidationException.class)
    public void testGetBibleTextNoReference() {
        this.testController.getBibleText("KJV", null);
    }

    /**
     * check that exception is thrown if no reference is provided
     */
    @Test(expected = ValidationException.class)
    public void testGetBibleTextNoReferenceWithOptions() {
        this.testController.getBibleText("KJV", null, "options");
    }

    /**
     * check that exception is thrown if no reference is provided
     */
    @Test(expected = ValidationException.class)
    public void testGetBibleTextNoReferenceWithOptionsAndInterlinear() {
        this.testController.getBibleText("KJV", null, "options", "interlinear", null);
    }

    /**
     * tests that options are parsed correctly and all arguments are passed
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    @Test
    public void testGetBibleText() {
        final List<LookupOption> options = new ArrayList<LookupOption>();
        options.add(LookupOption.HEADINGS);
        options.add(LookupOption.VERSE_NUMBERS);

        // do test
        this.testController.getBibleText("version", "reference", "HEADINGS,VERSE_NUMBERS", "kjv,esv",
                "INTERLINEAR");

        // verify
        verify(this.bibleInformation).getPassageText(eq("version"), eq("reference"),
                eq("HEADINGS,VERSE_NUMBERS"), eq("kjv,esv"), eq("INTERLINEAR"), eq("en"));

    }

    /**
     * Test the method delegates
     */
    @Test
    public void testGetFeatures() {
        final String version = "abp";
        this.testController.getFeatures(version, null, "NONE");
        verify(this.optionsValidationService).getAvailableFeaturesForVersion(eq(version), any(List.class), eq("NONE"), any(InterlinearMode.class));
    }

    /**
     * tests that method delegaes
     **/
    @Test
    public void testGetAllFeatures() {
        this.testController.getAllFeatures();
        verify(this.bibleInformation).getAllFeatures();
    }
}
