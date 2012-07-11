package com.tyndalehouse.step.e2e.tests;

import javax.annotation.Nullable;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.base.Predicate;
import com.tyndalehouse.step.e2e.fragments.PageOperations;
import com.tyndalehouse.step.e2e.fragments.Passage;
import com.tyndalehouse.step.e2e.framework.WebDriverTest;

public class StepBookmarkTest extends WebDriverTest {
    @Test
    public void testBookmarkButton() {
        doBookmarkButtonTest(0, "Mark 4");
        doBookmarkButtonTest(1, "John 7");
    }

    @Test
    public void testBookmarkMenuItem() {
        doBookmarkMenuItemTest(0, "Mark 5");
        doBookmarkMenuItemTest(1, "John 8");
    }

    private void doBookmarkMenuItemTest(final int passageId, final String reference) {
        final Passage passage = PageOperations.loadPassage(this.getDriver(), passageId, "ESV", reference, true);

        final WebElement topMenu = this.getDriver().findElements(By.linkText("Tools")).get(1 + passageId);
        new Actions(this.getDriver()).moveToElement(topMenu).perform();

        final WebElement menuItem = passage.findWithinPassage("a.bookmarkPassageMenuItem");
        new WebDriverWait(this.getDriver(), 5).until(new Predicate<WebDriver>() {

            @Override
            public boolean apply(@Nullable final WebDriver input) {
                return menuItem.isDisplayed();
            }
        });
        menuItem.click();

        checkBookmarkLoaded(reference);
    }

    private void doBookmarkButtonTest(final int passageId, final String reference) {
        final Passage passage = PageOperations.loadPassage(this.getDriver(), passageId, "ESV", reference, true);
        final WebElement bookmark = passage.findWithinPassage(".bookmarkPassageLink");

        bookmark.click();

        checkBookmarkLoaded(reference);
    }

    private void checkBookmarkLoaded(final String reference) {
        final WebDriverWait wait = new WebDriverWait(this.getDriver(), 5);
        wait.until(new Predicate<WebDriver>() {
            @Override
            public boolean apply(@Nullable final WebDriver input) {
                return StepBookmarkTest.this.getDriver().findElement(By.cssSelector(".bookmarkItem")).getText()
                        .trim().equals(reference);
            }
        });
    }
}
