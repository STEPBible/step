package com.tyndalehouse.step.e2e.framework;

import static org.junit.Assert.fail;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.junit.AfterClass;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.e2e.tests.StepTestSuite;

public class WebDriverTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(WebDriverTest.class);
//    private static WebDriver inOneWindow = null;
    private static WebDriver driver;

    public static WebDriver createDriver() {
        try {
            // created driver
            final RemoteWebDriver remoteWebDriver = new RemoteWebDriver(StepTestSuite.getService().getUrl(),
                    DesiredCapabilities.chrome());
            remoteWebDriver.manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);
            return remoteWebDriver;
        } catch (final IOException e) {
            fail("Fails the test because driver was not created successfully");
            throw new IllegalStateException("This will never occur");
        }
    }

    @After
    public void quitDriver() {
        if (StepTestSuite.RUN_IN_ONE_WINDOW) {
            return;
        }

        this.getDriver().quit();
    }

    @AfterClass
    public static void tearDown() {
        try {
            if (StepTestSuite.isServiceCreateByTest()) {
                StepTestSuite.getService().stop();
            }
        } catch (final IOException e) {
            LOGGER.error("Failed to tear down test", e);
        }
    }

    public static WebDriver getDriver() {
//        if (inOneWindow != null) {
//            return inOneWindow;
//        }

        if (driver == null) {
            driver = createDriver();
        }

        return driver;
    }

//    protected void setDriver(final WebDriver driver) {
//        this.driver = driver;
//    }

//    /**
//     * @param inOneWindow the inOneWindow to set
//     */
//    public static void setInOneWindow(final WebDriver inOneWindow) {
////        WebDriverTest.inOneWindow = inOneWindow;
//    }

//    /**
//     * @return the inOneWindow
//     */
//    public static WebDriver getInOneWindow() {
//        return inOneWindow;
//    }
}
