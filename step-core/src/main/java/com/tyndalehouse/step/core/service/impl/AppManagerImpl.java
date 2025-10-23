package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.AppManagerService;
import com.tyndalehouse.step.core.utils.IOUtils;
import org.crosswire.common.util.CWProject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.Properties;
import java.util.TimeZone;

/**
 * Allows querying of app-specific properties, such as the installation properties
 */
@Singleton
public class AppManagerImpl implements AppManagerService {
    private static final String STEP_INSTALL_PROPERTIES = "step.install.properties";
    private static final Logger LOGGER = LoggerFactory.getLogger(AppManagerImpl.class);
    private Properties appProperties;
    private String appHome;
    private long lastGCTime = 1;
    private Runtime runtime;
    private long gcInterval = 1500;

    /**
     * Prevent instantiation and initialise properties
     */
    @Inject
    public AppManagerImpl(@Named("app.home") final String appHome) {
        this.appHome = appHome;
        appProperties = new Properties();
        this.runtime = Runtime.getRuntime();
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
        } finally {
            IOUtils.closeQuietly(fis);
        }
    }

    /**
     * @return the location of the file storing relevant app info
     */
    public File getStepInstallFile() {
        try {
            File stepHome = new File(CWProject.instance().getWriteableProjectSubdir(appHome, true));
            return new File(stepHome, STEP_INSTALL_PROPERTIES);
        } catch (IOException e) {
            throw new StepInternalException("Unable to create home directory");
        }
    }

    @Override
    public String getAppDomain() {
        return Boolean.TRUE.equals(Boolean.getBoolean("step.development")) ? "dev.stepbible.org" : "www.stepbible.org";
    }

    @Override
    public boolean isLocal() {
        //there is an argument to say that perhaps this should be taken from the install file as well.
        return Boolean.getBoolean("step.jetty");
    }

    @Override
    public String getAppVersion() {
        return appProperties.getProperty(APP_VERSION);
    }


    @Override
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
        } catch (Exception ex) {
            LOGGER.error("Unable to save properties to file", ex);
        } finally {
            IOUtils.closeQuietly(fos);
        }
    }

    @Override
    public void checkRunSetLastGCTime() {
        long curTime = System.currentTimeMillis();
        if (curTime - this.lastGCTime > gcInterval) { // in milliseconds
            long freeBytes1 = this.runtime.freeMemory();
            this.runtime.gc();
            String free2 = String.format("%,d", this.runtime.freeMemory() / 1048576);
            String free1 = String.format("%,d", freeBytes1 / 1048576);
            this.lastGCTime = curTime;
            Date now = new Date();
            TimeZone.setDefault( TimeZone.getTimeZone("GMT"));
            System.out.println(now + " GC time: " + (System.currentTimeMillis() - curTime) + " free memory before: " + free1 + "MB after: " + free2 + "MB, GC interval: " + gcInterval);
        }
    }

    public void setGCInterval(int newInterval) {
        this.gcInterval = newInterval;
    }
}
