package com.tyndalehouse.step.test;

import com.saucelabs.common.SauceOnDemandAuthentication;
import com.saucelabs.common.SauceOnDemandSessionIdProvider;
import com.saucelabs.junit.ConcurrentParameterized;
import com.saucelabs.junit.SauceOnDemandTestWatcher;
import org.junit.*;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.LinkedList;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

/**
 * Demonstrates how to write a JUnit test that runs tests against Sauce Labs using multiple browsers in parallel.
 * <p/>
 * The test also includes the {@link SauceOnDemandTestWatcher} which will invoke the Sauce REST API to mark
 * the test as passed or failed.
 *
 * @author Ross Rowe
 */
@RunWith(ConcurrentParameterized.class)
public abstract class AbstractSTEPTest implements SauceOnDemandSessionIdProvider {

    /**
     * Constructs a {@link SauceOnDemandAuthentication} instance using the supplied user name/access key.  To use the authentication
     * supplied by environment variables or from an external file, use the no-arg {@link SauceOnDemandAuthentication} constructor.
     */
    public SauceOnDemandAuthentication authentication;

    /**
     * JUnit Rule which will mark the Sauce Job as passed/failed when the test succeeds or fails.
     */
    @Rule
    public SauceOnDemandTestWatcher resultReportingTestWatcher;

    /**
     * Represents the browser to be used as part of the test run.
     */
    private String browser;
    /**
     * Represents the operating system to be used as part of the test run.
     */
    private String os;
    /**
     * Represents the version of the browser to be used as part of the test run.
     */
    private String version;
    /**
     * Instance variable which contains the Sauce Job Id.
     */
    private String sessionId;

    /**
     * The {@link WebDriver} instance which is used to perform browser interactions with.
     */
    private WebDriver driver;

    /**
     * Chrome driver (or equivalent)
     */
    private static DriverService service = null;

    /**
     * Constructs a new instance of the test.  The constructor requires three string parameters, which represent the operating
     * system, version and browser to be used when launching a Sauce VM.  The order of the parameters should be the same
     * as that of the elements within the {@link #browsersStrings()} method.
     *
     * @param os
     * @param version
     * @param browser
     */
    public AbstractSTEPTest(String os, String version, String browser) {
        super();
        this.os = os;
        this.version = version;
        this.browser = browser;

        if (System.getProperty("local") == null) {
            this.authentication = new SauceOnDemandAuthentication(System.getProperty("sauceUsername"), System.getProperty("saucePassword"));
            this.resultReportingTestWatcher = new SauceOnDemandTestWatcher(this, authentication);
        }
    }

    /**
     * @return a LinkedList containing String arrays representing the browser combinations the test should be run against. The values
     * in the String array are used as part of the invocation of the test constructor
     */
    @ConcurrentParameterized.Parameters
    public static LinkedList browsersStrings() {
        LinkedList browsers = new LinkedList();
        browsers.add(new String[]{"Windows 8.1", null, "chrome"});

        if(System.getProperty("local") == null) {
            //internet explorer on all windows versions
            browsers.add(new String[]{"Windows 8.1", "11", "internet explorer"});
            browsers.add(new String[]{"Windows 8", "10", "internet explorer"});
            browsers.add(new String[]{"Windows 7", "9", "internet explorer"});

            //chrome & opera
            browsers.add(new String[]{"Windows 8.1", null, "opera"});

            //firefox
            browsers.add(new String[]{"Windows 8.1", null, "firefox"});

            //mac osx
            browsers.add(new String[]{"OSX 10.8", null, "safari"});
            browsers.add(new String[]{"OSX 10.9", null, "safari"});
            browsers.add(new String[]{"OSX 10.10", null, "safari"});
        }
        return browsers;
    }

    @BeforeClass
    public static void start() throws IOException {
        if (System.getProperty("local") != null) {
            service = new ChromeDriverService.Builder()
                    .usingDriverExecutable(new File("c:\\dev\\tools\\chromedriver.exe"))
                    .usingAnyFreePort()
                    .build();
            service.start();
        }
    }

    /**
     * Constructs a new {@link RemoteWebDriver} instance which is configured to use the capabilities defined by the {@link #browser},
     * {@link #version} and {@link #os} instance variables, and which is configured to run against ondemand.saucelabs.com, using
     * the username and access key populated by the {@link #authentication} instance.
     *
     * @throws Exception if an error occurs during the creation of the {@link RemoteWebDriver} instance.
     */
    @Before
    public void setUp() throws Exception {

        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability(CapabilityType.BROWSER_NAME, browser);
        if (version != null) {
            capabilities.setCapability(CapabilityType.VERSION, version);
        }
        capabilities.setCapability(CapabilityType.PLATFORM, os);
        capabilities.setCapability("name", "STEP Integration tests");

        if (System.getProperty("local") != null) {
            this.driver = new RemoteWebDriver(service.getUrl(), DesiredCapabilities.chrome());
        } else {
            if(authentication.getUsername() == null || authentication.getAccessKey() == null) {
                fail("No login credentials for sauce. Maybe use -Dlocal to execute locally");
            }

            this.driver = new RemoteWebDriver(
                    new URL("http://" + authentication.getUsername() + ":" + authentication.getAccessKey() + "@ondemand.saucelabs.com:80/wd/hub"),
                    capabilities);
        }
        this.sessionId = (((RemoteWebDriver) driver).getSessionId()).toString();
    }


    /**
     * Closes the {@link WebDriver} session.
     *
     * @throws Exception
     */
    @After
    public void tearDown() throws Exception {
        driver.quit();
    }

    @AfterClass
    public static void finish() {
        if (service != null) {
            service.stop();
        }
    }

    /**
     * @return the value of the Sauce Job id.
     */
    @Override
    public String getSessionId() {
        return sessionId;
    }

    public WebDriver getDriver() {
        return driver;
    }

    public String getDefaultURL() {
        return System.getProperty("url") == null ? "http://dev.stepbible.org" : System.getProperty("url");
    }

    public void openHomePage() {
        getDriver().get(getDefaultURL());
    }

    public void openHomePage(String language) {
        openHomePage();
        getDriver().findElement(By.linkText("Language")).click();
        getDriver().findElement(By.xpath(String.format("//a[@lang='%s']", language))).click();
    }

}
