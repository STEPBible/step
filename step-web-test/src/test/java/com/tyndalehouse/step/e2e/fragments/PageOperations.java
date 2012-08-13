package com.tyndalehouse.step.e2e.fragments;

import javax.annotation.Nullable;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.base.Predicate;

public final class PageOperations {
    private static final String STEP_URL = "http://localhost:8080/step-web?debug";

    /** prevent instantiation */
    private PageOperations() {
        // no op
    }

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

    public static void waitToClick(final WebDriver driver, final WebElement e) {
        final WebDriverWait wait = new WebDriverWait(driver, 5);
        wait.until(new Predicate<WebDriver>() {

            @Override
            public boolean apply(@Nullable final WebDriver input) {
                return e.isDisplayed();
            }
        });

        e.click();
    }

    public static Passage loadPassage(final WebDriver driver, final int passageId, final String version,
            final String reference, final boolean loadPage) {
        goToMainPage(driver);

        // then move mouse lower
        new Actions(driver).moveByOffset(0, 200).perform();

        return loadPassage(driver, passageId, version, reference);
    }

}
