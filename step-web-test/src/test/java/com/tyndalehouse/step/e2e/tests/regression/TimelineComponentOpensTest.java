package com.tyndalehouse.step.e2e.tests.regression;

import static com.tyndalehouse.step.e2e.fragments.PageOperations.loadPassage;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.selenium.By;

import com.tyndalehouse.step.e2e.fragments.MenuOperations;
import com.tyndalehouse.step.e2e.fragments.Passage;
import com.tyndalehouse.step.e2e.framework.WebDriverTest;

public class TimelineComponentOpensTest extends WebDriverTest {
    @Test
    public void testTimelineComponentOpensAndEventAppears() {
        final Passage passage = loadPassage(this.getDriver(), 1, "ESV-THE", "Exodus 5", true);

        MenuOperations.clickMenuItem(passage, "Context", "Timeline", 3);

        assertTrue(getDriver().findElement(By.id("bottomSection")).isDisplayed());

        // check this can be found
        getDriver()
                .findElement(
                        By.xpath("//div[@id = 'bottomSection']//div[@class = 'timeline-event-label'][text() = 'Moses returns to Egypt and meets Pharaoh']"));

    }
}
