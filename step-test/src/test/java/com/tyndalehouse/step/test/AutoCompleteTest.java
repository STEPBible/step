package com.tyndalehouse.step.test;

import org.apache.commons.lang3.StringUtils;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

/**
 * Created by cjburrell on 04/06/2015.
 */
public class AutoCompleteTest extends AbstractSTEPTest {

    public AutoCompleteTest(String os, String version, String browser) {
        super(os, version, browser);
    }

    /**
     * Checks that for various prefixes, we get various references out
     */
    @Test
    public void testSimpleReferenceEnglish() {
        Object[][] tests = new Object[][] {
                { "Mar does not yield first three chapters and book in Mark", "Mar", new String[] {"[Bible]Mark", "[Reference]Mark 1", "[Reference]Mark 2", "[Reference]Mark 3"}, new String[] {"Mark 4", "Exodus"}},
                { "Psa does not yield first three chapters and book in Mark", "Psa", new String[] {"[Bible]Psalms", "[Reference]Psalms 1", "[Reference]Psalms 2", "[Reference]Psalms 3"}, new String[] {"[Reference]Psalms 4", "[Bible]Exodus"}},
                { "Ma should yield list of books", "Ma", new String[] {"[Bible]Matthew", "[Bible]Malachi", "[Bible]Mark", "[Reference]Matthew 1"}, new String[] {"[Reference]Matthew 2", "[Reference]Matthew 3"}},
                { "Jn should yield list of John references", "Jn", new String[] {"[Bible]John", "[Reference]John 1", "[Reference]John 2", "[Reference]John 3"}, new String[] {}},
                { "Jon should yield list of Jonah references", "Jon", new String[] {"[Bible]Jonah", "[Reference]Jonah 1", "[Reference]Jonah 2", "[Reference]Jonah 3"}, new String[] {}},
                { "Ob should yield single book", "Ob", new String[] {"[Bible]Ob"}, new String[] {"Ob 1"}}
        };

        for(Object[] test : tests) {
            testingReferencesPresentInSearchCommand((String) test[0], (String) test[1], (String[]) test[2], (String[]) test[3]);
        }
    }

    /**
     * Checks that references are Bible / Reference / Book depending on how they are. Also ensures that drill down
     * works correctly
     */
    @Test
    public void testNameOfReferenceBibleText() {
        openHomePage();

        //check we have Romans, Romans 1, 2,3
        testingReferencesPresentInSearchCommand("Correct Romans references are missing", "Rom", new String[]{"[Bible]Romans", "[Reference]Romans 1"}, new String[]{"[Whole book]Romans"});

        //now click on sub link
        clickSearchCommandOption("Bible", "Romans");
        waitForSearchCommandInteraction();

        List<String> romansChapters = new ArrayList<>();
        for(int ii = 1; ii <= 16; ii++) {
            romansChapters.add("[Reference]Romans " + ii);
        }
        romansChapters.add("[Whole book]Romans");
        assertSearchCommandContents("Drilled-down Romans does not contain all chapters.", romansChapters.toArray(new String[]{}), new String[]{});
    }

    @Test
    public void testSimpleReferenceInternational() {
        Object[][] tests = new Object[][] {
                { "Jean does not yield first three chapters and book in John", "Jean", },
        };

        openHomePage("fr");
        sendKeysToSearchCommand("Jean");
        assertSearchCommandContents("Failed international references", new String[] {"[Bible]Jean", "[Référence]Jean 1", "[Référence]Jean 2", "[Référence]Jean 3"}, new String[] {"Jean 4", "Marc", "Mark", "John"});
    }

    public void testingReferencesPresentInSearchCommand(String message, String keysToType, String[] present, String[] absent) {
        openHomePage();
        sendKeysToSearchCommand(keysToType);
        assertSearchCommandContents(message, present, absent);
    }

    private void clickSearchCommandOption(String sourceType, String text) {
        final List<WebElement> elements = getDriver().findElements(By.xpath(
                String.format("//span[@class='source' and text() = '[%s]']/ancestor::*[contains(@class, 'select2-result-selectable')]", sourceType)));

        final Pattern matchingItem = Pattern.compile(String.format("%s.*[\r\n]*.*%s$", sourceType, text));
        for(WebElement e : elements) {
            if(matchingItem.matcher(e.getText()).find()) {
                e.click();
                return;
            }
        }

        fail(String.format("Unable to find source type %s with text %s", sourceType, text));
    }

    public void assertSearchCommandContents(String message, String[] present, String[] absent) {
        //find results
        final List<WebElement> elements = getDriver().findElements(By.cssSelector(".select2-result-label"));
        Set<String> references = new HashSet<>();
        for (WebElement e : elements) {
            references.add(e.getText().replaceAll("[\r\n]", ""));
        }

        assertContains("Some references are missing. " + message, references, present);
        assertNotContains("Some references are showing when they shouldn't be. " + message, references, absent);
    }

    public void sendKeysToSearchCommand(String keysToType) {
        getDriver().findElement(By.cssSelector(".select2-search-field .select2-input")).sendKeys(keysToType);
        waitForSearchCommandInteraction();
        assertTrue("Results aren't showing", getDriver().findElement(By.cssSelector(".select2-results")).isDisplayed());
        waitForJQuery(getDriver());
    }

    public void waitForSearchCommandInteraction() {
        JavascriptExecutor js = (JavascriptExecutor) getDriver();
        final Number keyPause = (Number) js.executeScript("return KEY_PAUSE");
        try {
            Thread.sleep(keyPause.longValue() + 1);
        } catch (InterruptedException e) {
            fail("Failed to wait for keys to be sent to server");
        }
    }

    public void waitForJQuery(WebDriver driver) {
        (new WebDriverWait(driver, 5)).until(new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver d) {
                JavascriptExecutor js = (JavascriptExecutor) d;
                return (Boolean) js.executeScript("return jQuery.active == 0");
            }
        });
    }

    private void assertContains(String message, Set<String> set, String... items) {
        Set<String> missing = new HashSet<>();
        for (String i : items) {
            boolean found = false;
            for (String s : set) {
                if (s.contains(i)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missing.add(i);
            }
        }

        if (missing.size() > 0) {
            fail(message + ": " + StringUtils.join(missing, ','));
        }
    }


    private void assertNotContains(String message, Set<String> set, String... items) {
        Set<String> foundByMistake = new HashSet<>();
        for (String i : items) {
            boolean found = false;
            for (String s : set) {
                if (s.contains(i)) {
                    found = true;
                    break;
                }
            }
            if (found) {
                foundByMistake.add(i);
            }
        }

        if (foundByMistake.size() > 0) {
            fail(message + ": " + StringUtils.join(foundByMistake, ','));
        }
    }

}
