package com.tyndalehouse.step.core.guice.providers;

import com.tyndalehouse.step.core.data.DirectoryInstaller;
import org.crosswire.jsword.book.install.Installer;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.Properties;

/**
 * Provides only offline installers
 */
public class OfflineInstallersProvider extends DefaultInstallersProvider {
    /**
     * @param stepProperties a list of properties to use to configure the installers
     */
    @Inject
    public OfflineInstallersProvider(@Named("StepCoreProperties") final Properties stepProperties) {
        super(stepProperties, null, null);
    }

    @Override
    protected synchronized Installer getInstaller(final String[] splitParts) {
        if (DirectoryInstaller.DIRECTORY_HOST.equals(splitParts[1])) {
            return new DirectoryInstaller(splitParts[0], getLocalDirectory(splitParts[2]));
        }

        // otherwise we ignore
        return null;
    }

    /**
     * Replaces the #step-home# token by the installation directory
     * 
     * @param offlineInstallationDirectory the directory containing the step-home token
     * @return the offline installation directory
     */
    private String getLocalDirectory(final String offlineInstallationDirectory) {
        final String stepHome = System.getProperty("step.home");
        final String replacement = stepHome != null ? stepHome : System.getProperty("user.dir");

        return offlineInstallationDirectory.replace("#step-home#", replacement);
    }
}
