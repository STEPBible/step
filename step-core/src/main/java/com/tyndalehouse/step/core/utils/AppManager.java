package com.tyndalehouse.step.core.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.Date;
import java.util.Properties;

/**
 * Allows querying of app-specific properties, such as the installation properties
 *
 * @author chrisburrell
 */
public class AppManager {
    public static final String APP_VERSION = "app.version";
    private static final String STEP_INSTALL_PROPERTIES = "step.install.properties";
    private static final Logger LOGGER = LoggerFactory.getLogger(AppManager.class);
    private static volatile AppManager instance;
    private Properties appProperties;

    /**
     * Prevent instantiation and initialise properties
     */
    private AppManager() {
        appProperties = new Properties();
        File f = getStepInstallFile();
        if (!f.exists()) {
            return;
        }

        FileInputStream fis = null;
        try {
            fis = new FileInputStream(f);
            appProperties.load(fis);
        } catch (Exception e) {
            //catch all kinds of exception here, best to reindex if need be.
            LOGGER.error(e.getMessage(), e);
            return;
        } finally {
            IOUtils.closeQuietly(fis);
        }
    }

    /**
     * @return the location of the file storing relevant app info
     */
    private File getStepInstallFile() {
        return new File(System.getProperty("user.home"), STEP_INSTALL_PROPERTIES);
    }

    /**
     * @return the currently installed version of the application
     */
    public String getAppVersion() {
        return appProperties.getProperty(APP_VERSION);
    }

    /**
     * Sets the property in memory, and saves it
     *
     * @param newVersion the new version of STEP, set during an upgrade
     * @return
     */
    public void setAndSaveAppVersion(String newVersion) {
        appProperties.setProperty(APP_VERSION, newVersion);
        saveProperties();
    }

    /**
     * Saves the properties to disk.
     */
    private void saveProperties() {
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(getStepInstallFile(), false);
            appProperties.store(fos, String.format("Last updated %s", new Date().toString()));
            fos.getFD().sync();
        } catch(Exception ex) {
            LOGGER.error("Unable to save properties to file", ex);
        } finally {
            IOUtils.closeQuietly(fos);
        }
    }

    /**
     * @return a single instance of the app manager
     */
    public static AppManager instance() {
        if (instance == null) {
            synchronized (AppManager.class) {
                if (instance == null) {
                    instance = new AppManager();
                }
            }
        }
        return instance;
    }
}
