package com.tyndalehouse.step.core.service;

import java.io.File;

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
     */
    void setAndSaveAppVersion(String newVersion);

    File getStepInstallFile();

    /**
     * The domain on which the app is currently running
     * @return the domain, such as www.stepbible.org
     */
    String getAppDomain();

    /**
     * @return true to indicate this is hosted by the Step-Server app
     */
    boolean isLocal();
}
