package com.saucelabs;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 * Created by cjburrell on 04/06/2015.
 */
public class HomePageTest extends AbstractSTEPTest {
    private String defaultURL;

    /**
     * Constructs a new instance of the test.  The constructor requires three string parameters, which represent the operating
     * system, version and browser to be used when launching a Sauce VM.  The order of the parameters should be the same
     * as that of the elements within the {@link #browsersStrings()} method.
     *
     * @param os
     * @param version
     * @param browser
     */
    public HomePageTest(String os, String version, String browser) {
        super(os, version, browser);
    }

    /**
     * Runs a simple test verifying the title of the amazon.com homepage.
     *
     * @throws Exception
     */
    @Test
    public void homePage() throws Exception {
        getDriver().get(getDefaultURL());
        assertEquals("Gen.1 | ESV | STEP | In the beginning, God created the heavens and the earth.", getDriver().getTitle());
    }
}
