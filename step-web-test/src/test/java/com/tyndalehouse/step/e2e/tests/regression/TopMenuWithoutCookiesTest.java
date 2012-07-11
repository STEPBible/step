package com.tyndalehouse.step.e2e.tests.regression;

import static org.junit.Assert.fail;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import com.tyndalehouse.step.e2e.fragments.PageOperations;
import com.tyndalehouse.step.e2e.framework.WebDriverTest;

/**
 * @author chrisburrell
 */
public class TopMenuWithoutCookiesTest extends WebDriverTest {
    @Test
    public void testOnlyOneTickInLevelMenu() {
        PageOperations.goToMainPage(getDriver());
        new Actions(getDriver()).moveToElement(getDriver().findElement(By.linkText("View"))).perform();

        final WebElement deeper = getDriver().findElement(By.linkText("Deeper"));
        final WebElement detailed = getDriver().findElement(By.linkText("Detailed"));

        assertNoTickPresent(deeper);
        assertNoTickPresent(detailed);
    }

    public void assertNoTickPresent(final WebElement parent) {
        try {
            parent.findElement(By.tagName("img"));
            fail("Element was found");
        } catch (final NoSuchElementException ex) {
            /* do nothing, link is not present, assert is passed */
        }
    }
}
