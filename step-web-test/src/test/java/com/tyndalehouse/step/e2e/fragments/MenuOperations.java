package com.tyndalehouse.step.e2e.fragments;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

public class MenuOperations {

    public static void clickMenuItem(final Passage p, final String menuName, final String menuItem) {
        int realPassageId = p.getPassageId();
        if ("Tools".equals(menuName)) {
            realPassageId++;
        }

        final WebElement topMenu = p.getDriver().findElements(By.linkText(menuName)).get(realPassageId);
        new Actions(p.getDriver()).moveToElement(topMenu).perform();

        final WebElement menuLink = p.getDriver().findElement(By.linkText(menuItem));
        menuLink.click();

    }
}
