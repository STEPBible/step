package com.tyndalehouse.step.e2e.tests;

import static org.junit.Assert.assertFalse;

import org.junit.Test;
import org.openqa.selenium.WebElement;

import com.tyndalehouse.step.e2e.fragments.PageOperations;
import com.tyndalehouse.step.e2e.fragments.Passage;
import com.tyndalehouse.step.e2e.framework.WebDriverTest;

public class NavigationButtonsTest extends WebDriverTest {
    @Test
    public void testNavigationButtons() {
        doNavigationButtonTest(0, "Acts 4", "Now Peter and John were going up to the temple",
                "And as they were speaking to the people, the priests and the captain");
        doNavigationButtonTest(1, "John 7", "they saw the signs that he was doing on the sick",
                "After this Jesus went about in Galilee.");
    }

    /**
     * Clicking the button should ensure text is loaded before and after what is already visible. Then
     * scrolling up and down should do the same again
     */
    @Test
    public void testContinuousScroll() {
        final String start = "Jude, a servant of Jesus Christ and brother of James";
        final String end = "and authority, before all time and now and forever. Amen.";

        // 3 john and revelation
        final String before = "I had much to write to you, but I would rather not write with pen and ink.";
        final String after = "And to the angel of the church in Smyrna write";

        doTestContinuousScroll(0, "Jude", start, end, before, after);
    }

    private void doTestContinuousScroll(final int passageId, final String reference, final String start,
            final String end, final String before, final String after) {
        final Passage passage = PageOperations.loadPassage(this.getDriver(), 0, "ESV", reference, true);

        passage.checkPassageText(start);
        passage.checkPassageText(end);

        final WebElement continuous = passage.findWithinPassage(".continuousPassage");
        continuous.click();

        passage.checkPassageText(before);
        passage.checkPassageText(after);

        // now click item again, and we're back where we were
        continuous.click();
        passage.checkPassageText(start);
        final String newText = passage.checkPassageText(end);

        assertFalse(newText.contains(before));
        assertFalse(newText.contains(after));

    }

    private void doNavigationButtonTest(final int passageId, final String reference,
            final String previousText, final String nextText) {
        final Passage passage = PageOperations.loadPassage(this.getDriver(), passageId, "ESV", reference,
                true);

        final WebElement previous = passage.findWithinPassage(".previousChapter");
        final WebElement next = passage.findWithinPassage(".nextChapter");

        previous.click();
        passage.checkPassageText(previousText);

        next.click();
        passage.checkPassageText(nextText);
    }
}
