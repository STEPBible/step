package com.tyndalehouse.step.core.data;

import org.crosswire.jsword.book.install.sword.HttpSwordInstaller;
import org.crosswire.jsword.book.sword.*;

/**
 * Bases the list of books based on the directory listing of a particular folder, as opposed to a zip file of some kind.
 */
public class StepHttpSwordInstaller extends HttpSwordInstaller {
    private String installerName;

    /**
     * @return The installer name
     */
    public String getInstallerName() {
        return installerName;
    }

    /**
     * @param installerName the name of the installer
     */
    public void setInstallerName(final String installerName) {
        this.installerName = installerName + " (Internet)";
    }
}
