package com.tyndalehouse.step.core.utils;

/**
 * @author chrisburrell
 */
public interface AppManagerService {
    /**
     * The app.version property
     */
    String APP_VERSION = "app.version";

    /**
     * @return the currently installed version of the application
     */
    String getAppVersion();

    /**
     * Sets the property in memory, and saves it
     *
     * @param newVersion the new version of STEP, set during an upgrade
     * @return
     */
    void setAndSaveAppVersion(String newVersion);
}
