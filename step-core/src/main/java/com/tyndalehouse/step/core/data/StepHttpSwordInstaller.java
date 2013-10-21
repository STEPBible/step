package com.tyndalehouse.step.core.data;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import org.crosswire.common.util.IOUtil;
import org.crosswire.common.util.NetUtil;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookDriver;
import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.install.sword.HttpSwordInstaller;
import org.crosswire.jsword.book.sword.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Bases the list of books based on the directory listing of a particular folder, as opposed to a zip file of some kind.
 *
 * @author chrisburrell
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
