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
        doNavigationButtonTest(0, "Acts 4",
                "1Now Peter and John were ogoing up to the temple at pthe hour of prayer, qthe ninth hour",
                "1And as they were speaking to the people, the priests and lthe captain of the temple",
                "Acts 3", "Acts 4");
        doNavigationButtonTest(1, "John 7",
                "1After this jJesus went away to the other side of kthe Sea of Galilee",
                "1After this Jesus went about in Galilee. He would not go about in Judea", "John 6", "John 7");
    }

    /**
     * Clicking the button should ensure text is loaded before and after what is already visible. Then
     * scrolling up and down should do the same again
     */
    @Test
    public void testContinuousScroll() {
        final String start = "1Jude, a servant1 of Jesus Christ and brother of James";
        final String end = "and authority, before all time and now and forever. Amen.";

        // 3 john and revelation
        final String before = "13oI had much to write to you, but I would rather not write with pen and ink";

        doTestContinuousScroll(0, "Jude", start, end, before);
    }

    private void doTestContinuousScroll(final int passageId, final String reference, final String start,
            final String end, final String before) {
        final Passage passage = PageOperations.loadPassage(this.getDriver(), 0, "ESV-THE", reference, true);

        passage.checkPassageText(start);
        passage.checkPassageText(end);

        final WebElement continuous = passage.findWithinPassage(".continuousPassage");
        continuous.click();

        // check that it contains some more text before
        passage.checkPassageText(before);
        // don't check after, since that depends on screen size

        // now click item again, and we're back where we were
        continuous.click();
        passage.checkPassageText(start);
        final String newText = passage.checkPassageText(end);

        assertFalse(newText.contains(before));
    }

    private void doNavigationButtonTest(final int passageId, final String reference,
            final String previousText, final String nextText, final String previousReference,
            final String nextReference) {
        final Passage passage = PageOperations.loadPassage(this.getDriver(), passageId, "ESV-THE", reference,
                true);

        final WebElement previous = passage.findWithinPassage(".previousChapter");
        final WebElement next = passage.findWithinPassage(".nextChapter");

        previous.click();
        passage.checkReference(previousReference);
        passage.checkPassageText(previousText);

        next.click();
        passage.checkReference(nextReference);
        passage.checkPassageText(nextText);
    }
}
