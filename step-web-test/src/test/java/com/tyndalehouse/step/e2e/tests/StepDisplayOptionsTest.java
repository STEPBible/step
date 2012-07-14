package com.tyndalehouse.step.e2e.tests;

import static com.tyndalehouse.step.e2e.fragments.PageOperations.loadPassage;

import java.util.Arrays;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import com.tyndalehouse.step.e2e.fragments.MenuOperations;
import com.tyndalehouse.step.e2e.fragments.Passage;
import com.tyndalehouse.step.e2e.framework.WebDriverTest;

/**
 * Tests basic pasage functionality
 * 
 * @author chrisburrell
 * 
 */
@RunWith(Parameterized.class)
public class StepDisplayOptionsTest extends WebDriverTest {
    private final String passageId;
    private final String reference;
    private final String newText;
    private final String menuItem;
    private final String menuName;

    public StepDisplayOptionsTest(final String menuName, final String menuItem, final String newText,
            final String reference, final String passageId) {
        this.menuName = menuName;
        this.menuItem = menuItem;
        this.newText = newText;
        this.reference = reference;
        this.passageId = passageId;
    }

    @Parameters
    public static List<String[]> getTests() {
        return Arrays.asList(new String[][] {
                { "Display", "Headings", "The Birth of Moses", "Exodus 2", "0" },
                { "Display", "Verse Numbers", "7Then his sister", "Exodus 2", "0" },
                { "Display", "Verses on separate lines", "\n Then his sister", "Exodus 2", "0" },
                { "Display", "Notes and References", "Hebrew papyrus reeds", "Exodus 2", "0" },

                { "Display", "Headings", "Longing to Go to Rome", "Romans 1", "1" },
                { "Display", "Verse Numbers", "1Paul, a servant", "Romans 1", "1" },
                { "Display", "Verses on separate lines", "\n For God is my witness", "Romans 1", "1" },
                { "Display", "Notes and References", "Or slave; Greek bondservant", "Romans 1", "1" },

        });
    }

    @Test
    public void testMenuOption() {
        // first set the state so that we have no options selected, and use a passage we are not interested in
        // for the test
        Passage passage = loadPassage(this.getDriver(), Integer.parseInt(this.passageId), "ESV",
                "Genesis 1:1", true);

        MenuOperations.disableAllOptions(passage, "Display");

        passage = loadPassage(this.getDriver(), Integer.parseInt(this.passageId), "ESV", this.reference,
                false);

        MenuOperations.clickMenuItem(passage, this.menuName, this.menuItem, 3);
        passage.checkPassageText(this.newText);

        MenuOperations.clickMenuItem(passage, this.menuName, this.menuItem, 3);
        passage.checkPassageTextDisappeared(this.newText);

    }
}
