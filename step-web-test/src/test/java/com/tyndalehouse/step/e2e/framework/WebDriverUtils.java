package com.tyndalehouse.step.e2e.framework;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

/**
 * @author chrisburrell
 */
public class WebDriverUtils {
    /**
     * Selects all content in the text box
     * @param textbox
     */
    public static void selectAll(WebElement textbox) {
        textbox.sendKeys(Keys.CONTROL, "a");
    }
}
