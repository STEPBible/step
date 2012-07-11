package com.tyndalehouse.step.e2e.fragments;

import org.openqa.selenium.WebDriver;

public class PageOperations {
    private static final String STEP_URL = "http://localhost:8080/step-web?debug";

    /**
     * Goes to the main page
     * 
     * @param driver the web driver
     */
    public static void goToMainPage(final WebDriver driver) {
        driver.get(STEP_URL);
    }

    public static Passage loadPassage(final WebDriver driver, final int passageId, final String version,
            final String reference) {
        final Passage passage = new Passage(driver, version, reference, passageId);
        passage.execute();
        return passage;
    }

    public static Passage loadPassage(final WebDriver driver, final int passageId, final String version,
            final String reference, final boolean loadPage) {
        goToMainPage(driver);
        return loadPassage(driver, passageId, version, reference);
    }

}
