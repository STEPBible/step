package com.tyndalehouse.step.e2e.framework;

import static org.junit.Assert.fail;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.tyndalehouse.step.e2e.tests.StepTestSuite;

public class WebDriverTest {
    private WebDriver driver;
    private static WebDriver inOneWindow = null;

    public static WebDriver createDriver() {
        try {
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
        if (inOneWindow != null) {
            return;
        }

        this.getDriver().quit();
    }

    protected WebDriver getDriver() {
        if (inOneWindow != null) {
            return inOneWindow;
        } else if (this.driver == null) {
            this.driver = createDriver();
        }

        return this.driver;
    }

    protected void setDriver(final WebDriver driver) {
        this.driver = driver;
    }

    /**
     * @param inOneWindow the inOneWindow to set
     */
    public static void setInOneWindow(final WebDriver inOneWindow) {
        WebDriverTest.inOneWindow = inOneWindow;
    }

    /**
     * @return the inOneWindow
     */
    public static WebDriver getInOneWindow() {
        return inOneWindow;
    }
}
