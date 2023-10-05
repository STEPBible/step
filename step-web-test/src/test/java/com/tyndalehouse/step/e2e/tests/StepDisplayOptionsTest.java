package com.tyndalehouse.step.e2e.tests;

import static com.tyndalehouse.step.e2e.fragments.PageOperations.loadPassage;

import java.util.Arrays;
import java.util.List;

import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import com.tyndalehouse.step.e2e.fragments.MenuOperations;
import com.tyndalehouse.step.e2e.fragments.Passage;
import com.tyndalehouse.step.e2e.framework.WebDriverTest;

/**
 * Tests basic pasage functionality
 */
@RunWith(Parameterized.class)
public class StepDisplayOptionsTest extends WebDriverTest {
    private final int passageId;
    private final String reference;
    private final String newText;
    private final String menuItem;
    private final String menuName;
    private static Passage[] passages = new Passage[2];

    public StepDisplayOptionsTest(final String menuName, final String menuItem, final String newText,
            final String reference, final int passageId) {
        this.menuName = menuName;
        this.menuItem = menuItem;
        this.newText = newText;
        this.reference = reference;
        this.passageId = passageId;
    }

    @BeforeClass
    public static void goToFirstPassages() {
        // first set the state so that we have no options selected, and use a passage we are not interested in
        // for the test
        passages[0] = loadPassage(WebDriverTest.getDriver(), 0, "ESVEx", "Exodus 2", true);
        passages[1] = loadPassage(WebDriverTest.getDriver(), 1, "ESVEx", "Romans 1", false);
        MenuOperations.disableAllOptions(passages[0], "Display");
        MenuOperations.disableAllOptions(passages[1], "Display");
    }

    @Parameters
    public static List<Object[]> getTests() {
        return Arrays.asList(new Object[][] {
                { "Display", "Headings", "The Birth of Moses", "Exodus 2", 0 },
                { "Display", "Verse numbers", "7 Then his sister", "Exodus 2", 0 },
                { "Display", "Verses on separate lines", "\n Then his sister", "Exodus 2", 0 },
                { "Display", "Notes and References", "ch. 6:20; Num. 26:59; 1 Chr. 23:14", "Exodus 2", 0 },

                { "Display", "Headings", "Longing to Go to Rome", "Romans 1", 1 },
                { "Display", "Verse numbers", "1 Paul, a servant", "Romans 1", 1 },
                { "Display", "Verses on separate lines", "\n For God is my witness", "Romans 1", "1" },
                { "Display", "Notes and References", "1 Cor. 1:1; [1 Cor. 9:1; Heb. 5:4]; See 2 Cor. 1:1", "Romans 1", 1 },

        });
    }

    @Test
    public void testMenuOption() {
        // first set the state so that we have no options selected, and use a passage we are not interested in
        // for the test
        passages[this.passageId].checkPassageTextDisappeared(this.newText);
        MenuOperations.clickMenuItem(passages[this.passageId], this.menuName, this.menuItem, 3);
        passages[this.passageId].checkPassageText(this.newText);
    }
}
