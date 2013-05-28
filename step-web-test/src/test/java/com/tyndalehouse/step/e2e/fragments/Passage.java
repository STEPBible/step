package com.tyndalehouse.step.e2e.fragments;

import static org.junit.Assert.assertEquals;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Predicate;

public class Passage {
    private static final Logger LOGGER = LoggerFactory.getLogger(Passage.class);
    private final String reference;
    private final WebDriver driver;
    private final String version;
    private WebElement refElement;
    private WebElement versionElement;
    private final int passageId;

    /**
     * @param driver web driver
     * @param version version
     * @param reference ref
     */
    public Passage(final WebDriver driver, final String version, final String reference, final int passageId) {
        this.driver = driver;
        this.version = version;
        this.reference = reference;
        this.passageId = passageId;
    }

    public void execute() {

        this.refElement = findWithinPassage(".passageReference");
        this.refElement.clear();
        this.refElement.sendKeys(this.reference, Keys.TAB);

        this.versionElement = findWithinPassage(".passageVersion");
        this.versionElement.clear();
        this.versionElement.sendKeys(this.version, Keys.TAB);
    }

    public String checkPassageText(final String text) {
        final WebDriverWait w = new WebDriverWait(this.driver, 5);
        final WebElement passageText = findWithinPassage(".passageText");
        w.until(new Predicate<WebDriver>() {

            @Override
            public boolean apply(final WebDriver input) {
                final String webText = passageText.getText();
                LOGGER.trace("Passage currently reads [{}]", webText);
                return webText.contains(text);

            }
        });

        return passageText.getText();
    }

    public String checkPassageTextDisappeared(final String text) {
        final WebDriverWait w = new WebDriverWait(this.driver, 5);
        final WebElement passageText = findWithinPassage(".passageText");
        w.until(new Predicate<WebDriver>() {

            @Override
            public boolean apply(final WebDriver input) {
                final String webText = passageText.getText();
                LOGGER.trace("Passage currently reads [{}]", webText);
                return !webText.contains(text);

            }
        });

        return passageText.getText();
    }

    public void checkReference() {
        checkReference(this.reference);
    }

    public void checkReference(final String reference) {
        final WebDriverWait w = new WebDriverWait(this.driver, 5);
        w.until(new Predicate<WebDriver>() {
            @Override
            public boolean apply(final WebDriver input) {
                return Passage.this.refElement.getAttribute("value").equals(reference);
            }
        });
    }

    public WebElement findWithinPassage(final String css) {
        return this.driver.findElements(By.cssSelector(".passageContainer")).get(this.passageId)
                .findElement(By.cssSelector(css));
    }

    public void verify() {
        checkReference();
        assertEquals(this.version, this.versionElement.getAttribute("value"));
    }

    /**
     * @return the passageId
     */
    public int getPassageId() {
        return this.passageId;
    }

    /**
     * @return the driver
     */
    public WebDriver getDriver() {
        return this.driver;
    }

}
