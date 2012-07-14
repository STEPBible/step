package com.tyndalehouse.step.e2e.tests;

import org.junit.Test;

import com.tyndalehouse.step.e2e.fragments.PageOperations;
import com.tyndalehouse.step.e2e.fragments.Passage;
import com.tyndalehouse.step.e2e.framework.WebDriverTest;

/**
 * Tests basic pasage functionality
 * 
 * @author chrisburrell
 * 
 */
public class StepPassageTest extends WebDriverTest {

    @Test
    public void testSimplePassage0Lookup() {
        final Passage passage = PageOperations.loadPassage(this.getDriver(), 0, "ESV", "Mark 1", true);
        passage.verify();
        passage.checkPassageText("1The beginning of the gospel of Jesus Christ, athe Son of God.1");
    }

    @Test
    public void testSimplePassage1Lookup() {
        final Passage passage = PageOperations.loadPassage(this.getDriver(), 1, "ESV", "Titus 1", true);
        passage.verify();
        passage.checkPassageText("10For there are many who are insubordinate,");
    }
}
