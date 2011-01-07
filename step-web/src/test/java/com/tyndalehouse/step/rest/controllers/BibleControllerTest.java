package com.tyndalehouse.step.rest.controllers;

import static org.apache.commons.collections.CollectionUtils.isEqualCollection;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;
import org.mockito.ArgumentCaptor;

import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.service.BibleInformationService;

/**
 * tests the bible controller
 * 
 * @author Chris
 * 
 */
public class BibleControllerTest {
    private final BibleInformationService bibleInformation = mock(BibleInformationService.class);
    private final BibleController testController = new BibleController(this.bibleInformation);

    /**
     * tests that we call correct method
     */
    @Test
    public void testGetBibleVersions() {
        // do test
        this.testController.getBibleVersions();
        verify(this.bibleInformation).getAvailableBibleVersions();
    }

    /**
     * check that exception is thrown if no version provided
     */
    @Test(expected = IllegalArgumentException.class)
    public void testGetBibleTextNoVersion() {
        this.testController.getBibleText(null, "Ref");
    }

    /**
     * check that exception is thrown if no version provided
     */
    @Test(expected = IllegalArgumentException.class)
    public void testGetBibleTextNoVersionWithOptions() {
        this.testController.getBibleText(null, "Ref", "options");
    }

    /**
     * check that exception is thrown if no version provided
     */
    @Test(expected = IllegalArgumentException.class)
    public void testGetBibleTextNoVersionWithOptionsAndInterlinear() {
        this.testController.getBibleText(null, "Ref", "options", "interlinear");
    }

    /**
     * check that exception is thrown if no reference is provided
     */
    @Test(expected = IllegalArgumentException.class)
    public void testGetBibleTextNoReference() {
        this.testController.getBibleText("KJV", null);
    }

    /**
     * check that exception is thrown if no reference is provided
     */
    @Test(expected = IllegalArgumentException.class)
    public void testGetBibleTextNoReferenceWithOptions() {
        this.testController.getBibleText("KJV", null, "options");
    }

    /**
     * check that exception is thrown if no reference is provided
     */
    @Test(expected = IllegalArgumentException.class)
    public void testGetBibleTextNoReferenceWithOptionsAndInterlinear() {
        this.testController.getBibleText("KJV", null, "options", "interlinear");
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
        this.testController.getBibleText("version", "reference", "HEADINGS,VERSE_NUMBERS", "kjv,esv");

        // verify
        final ArgumentCaptor<List> captor = ArgumentCaptor.forClass(List.class);

        verify(this.bibleInformation).getPassageText(eq("version"), eq("reference"), captor.capture(),
                eq("kjv,esv"));

        // check the list that was captured
        final List value = captor.getValue();
        isEqualCollection(value, options);
    }

    /**
     * Test the method delegates
     */
    @Test
    public void testGetFeatures() {
        final String version = "abp";
        this.testController.getFeatures(version);
        verify(this.bibleInformation).getFeaturesForVersion(version);
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
