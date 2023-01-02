package com.tyndalehouse.step.core.models;

import org.junit.Assert;
import org.junit.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.Assert.assertTrue;

/**
 * @author chrisburrell
 */
public class LookupOptionTest {
    /**
     * Tests that options are unique by UI Name
     * @throws Exception
     */
    @Test
    public void testFromUiOption() throws Exception {
        final LookupOption[] values = LookupOption.values();
        Set<Character> characters = new HashSet<Character>();
        for(LookupOption option : values) {
            if(option.getUiName() == '_') {
                continue;
            }

            assertTrue("Option: " + option + " has same ui name.", characters.add(option.getUiName()));
        }
    }
}
