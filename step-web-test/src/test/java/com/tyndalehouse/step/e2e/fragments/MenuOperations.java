package com.tyndalehouse.step.e2e.fragments;

import static com.tyndalehouse.step.e2e.fragments.PageOperations.waitToClick;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.base.Predicate;

/**
 * Helper for menu operations
 */
public final class MenuOperations {
    /**
     * prevent instantiation
     */
    private MenuOperations() {
        // no op
    }

    public static void clickMenuItem(final Passage p, final String menuName, final String menuItem,
                                     final int retry) {
        openMenu(p, menuName);

        try {
            final WebDriverWait wait = new WebDriverWait(p.getDriver(), 2);
            wait.until(new Predicate<WebDriver>() {
                @Override
                public boolean apply(final WebDriver input) {
                    try {
                        final WebElement menuLink = p.getDriver().findElement(By.linkText(menuItem));
                        menuLink.click();
                        return true;
                    } catch (final WebDriverException e) {
                        return false;
                    }
                }
            });
        } catch (final TimeoutException e) {
            if (retry > 0) {
                clickMenuItem(p, menuName, menuItem, retry - 1);
            }
        }
    }

    private static WebElement openMenu(final Passage p, final String menuName) {
        int realPassageId = p.getPassageId();

        final List<WebElement> elements = p.getDriver().findElements(By.linkText(menuName));
        final WebElement topMenu = elements.size() > 1 ? elements.get(realPassageId) : elements.get(0);
        new Actions(p.getDriver()).moveToElement(topMenu).perform();

        return topMenu;
    }

    /**
     * disables all options for a passasge pane
     *
     * @param passage  passage
     * @param menuName the name of the menu
     */
    public static void disableAllOptions(final Passage passage, final String menuName) {
        final WebElement menu = openMenu(passage, menuName);

        // there may be no options, so reduce the implicit timings
        passage.getDriver().manage().timeouts().implicitlyWait(500, TimeUnit.MILLISECONDS);
        final List<WebElement> findElements = menu.findElements(By.xpath("..//li/a[img]"));
        for (final WebElement w : findElements) {
            waitToClick(passage.getDriver(), w);
        }

        final WebDriverWait wait = new WebDriverWait(passage.getDriver(), 10);
        wait.until(new Predicate<WebDriver>() {

            @Override
            public boolean apply(final WebDriver input) {
                return menu.findElements(By.xpath(".//li/a[img]")).size() == 0;
            }
        });
        passage.getDriver().manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);

    }

    public static List<WebElement> getOptionsForTopMenu(final WebDriver driver, final String menuName) {
        driver.manage().timeouts().implicitlyWait(500, TimeUnit.MILLISECONDS);
        final List<WebElement> findElements = driver.findElements(By.xpath("//li[@menu-name = '" + menuName
                + "']//a[img[@class = 'selectingTick']]"));
        driver.manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);
        return findElements;
    }
}
