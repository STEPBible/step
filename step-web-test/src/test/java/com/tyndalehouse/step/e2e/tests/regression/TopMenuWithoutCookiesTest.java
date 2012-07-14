package com.tyndalehouse.step.e2e.tests.regression;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

import com.tyndalehouse.step.e2e.fragments.MenuOperations;
import com.tyndalehouse.step.e2e.fragments.PageOperations;
import com.tyndalehouse.step.e2e.framework.WebDriverTest;

/**
 * @author chrisburrell
 */
public class TopMenuWithoutCookiesTest extends WebDriverTest {
    @Test
    public void testOnlyOneTickInLevelMenu() {
        PageOperations.goToMainPage(getDriver());

        assertTrue("0 or more than 1 option is ticked",
                MenuOperations.getOptionsForTopMenu(getDriver(), "VIEW").size() == 1);
    }
}
