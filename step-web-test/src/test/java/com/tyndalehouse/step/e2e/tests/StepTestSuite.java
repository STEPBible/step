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

@RunWith(Suite.class)
@SuiteClasses({ StepPassageTest.class, StepBookmarkTest.class, NavigationButtonsTest.class })
public class StepTestSuite {
    private static ChromeDriverService service;
    private static final boolean RUN_IN_ONE_WINDOW = true;

    @BeforeClass
    public static void createAndStartService() throws IOException {
        service = new ChromeDriverService.Builder()
                .usingDriverExecutable(new File("d:/dev/chromedriver/chromedriver.exe")).usingAnyFreePort()
                .build();
        service.start();

        if (RUN_IN_ONE_WINDOW) {
            WebDriverTest.setInOneWindow(WebDriverTest.createDriver());
        }
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
            createAndStartService();
        }

        return service;
    }
}
