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
import java.io.*;
import java.util.Date;
import java.util.Properties;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Allows querying of app-specific properties, such as the installation properties
 */
@Singleton
public class AppManagerImpl implements AppManagerService {
    private static final String STEP_INSTALL_PROPERTIES = "step.install.properties";
    private static final Logger LOGGER = LoggerFactory.getLogger(AppManagerImpl.class);
    private Properties appProperties;
    private String appHome;

    /**
     * Prevent instantiation and initialise properties
     */
    @Inject
    public AppManagerImpl(@Named("app.home") final String appHome) {
        this.appHome = appHome;
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

    @Override
    public boolean isWWWServer() {
        String result = appProperties.getProperty("IS_WWW_SERVER");
        if ((result != null) && (result.equals("true")))
            return true;
        return false;
    }

    @Override
    public void setIsWWWServer() {
        File myObj = new File("/etc/hosts");
        // try-with-resources: Scanner will be closed automatically
        try (Scanner myReader = new Scanner(myObj)) {
            Pattern pattern = Pattern.compile("127\\.0\\.0\\.1\\s+www\\.stepbible\\.org", Pattern.CASE_INSENSITIVE);
            while (myReader.hasNextLine()) {
                String data = myReader.nextLine();
                Matcher matcher = pattern.matcher(data);
                if (matcher.find()) {
                    appProperties.setProperty("IS_WWW_SERVER", "true");
                    return;
                }
            }
        } catch (FileNotFoundException e) {
            System.out.println("Cannot read /etc/hosts file.  It is OK if this is not a server running for www.stepbible.org");
            e.printStackTrace();
        }
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
}
