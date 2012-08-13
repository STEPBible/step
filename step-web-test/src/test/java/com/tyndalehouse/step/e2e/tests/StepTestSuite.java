package com.tyndalehouse.step.e2e.tests;

import java.io.File;
import java.io.IOException;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriverService;

import com.tyndalehouse.step.e2e.framework.WebDriverTest;
import com.tyndalehouse.step.e2e.tests.regression.TimelineComponentOpensTest;
import com.tyndalehouse.step.e2e.tests.regression.TopMenuWithoutCookiesTest;

@RunWith(Suite.class)
@SuiteClasses({ StepPassageTest.class, StepBookmarkTest.class, NavigationButtonsTest.class,
        StepDisplayOptionsTest.class, TopMenuWithoutCookiesTest.class, TimelineComponentOpensTest.class })
public final class StepTestSuite {
    private static boolean createdByTest = false;
    private static ChromeDriverService service;
    public static final boolean RUN_IN_ONE_WINDOW = false;

    /** prevent instantiation */
    private StepTestSuite() {
        // no op
    }

    @BeforeClass
    public static void createAndStartService() throws IOException {
        service = new ChromeDriverService.Builder()
                .usingDriverExecutable(new File("d:/dev/chromedriver/chromedriver.exe")).usingAnyFreePort()
                .build();
        service.start();
    }

    @AfterClass
    public static void createAndStopService() {
        final WebDriver inOneWindow = WebDriverTest.getInOneWindow();
        if (inOneWindow != null) {
            WebDriverTest.getInOneWindow().quit();
        }

        service.stop();

    }

    /**
     * @return the service
     * @throws IOException
     */
    public static ChromeDriverService getService() throws IOException {
        if (service == null) {
            createdByTest = true;
            createAndStartService();
        }

        return service;
    }

    public static boolean isServiceCreateByTest() {
        return createdByTest;
    }
}
