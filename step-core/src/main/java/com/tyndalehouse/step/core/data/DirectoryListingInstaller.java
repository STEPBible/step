package com.tyndalehouse.step.core.data;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import org.crosswire.common.progress.JobManager;
import org.crosswire.common.progress.Progress;
import org.crosswire.common.util.IOUtil;
import org.crosswire.common.util.NetUtil;
import org.crosswire.jsword.JSMsg;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookDriver;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.crosswire.jsword.versification.custom.CustomVersification;
import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.sword.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Bases the list of books based on the directory listing of a particular folder, as opposed to a zip file of some kind.
 */
public class DirectoryListingInstaller extends DirectoryInstaller {
    public static String DIRECTORY_LISTING_INSTALLER = "directory-listing-installer";
    private static final Logger LOGGER = LoggerFactory.getLogger(DirectoryListingInstaller.class);

    /**
     * @param holdingDirectory the directory containing all packages
     */
    public DirectoryListingInstaller(final String installerName, final String holdingDirectory) {
        super(installerName, holdingDirectory, DIRECTORY_LISTING_INSTALLER);
    }

    /* (non-Javadoc)
     * @see org.crosswire.jsword.book.install.Installer#reloadBookList()
     */
    public void reloadBookList() throws InstallException {
        // TRANSLATOR: Progress label for downloading one or more files.
        String jobName = JSMsg.gettext("Downloading files");
        Progress job = JobManager.createJob(Progress.RELOAD_BOOK_LIST, jobName, Thread.currentThread());
        job.beginJob(jobName);

        try {
            loaded = false;
            loadCachedIndex();
        } catch (InstallException ex) {
            job.cancel();
            throw ex;
        } finally {
            job.done();
        }
    }

    /* (non-Javadoc)
    * @see org.crosswire.jsword.book.install.Installer#reloadBookList()
    */
    @Override
    public void loadCachedIndex() throws InstallException {
        //create this file dynamically based on what is present in the holding directory
        final File[] fileList = new File(super.getPackageDirectory()).listFiles(new FilenameFilter() {
            @Override
            public boolean accept(final File dir, final String name) {
                if (name != null && name.endsWith(".zip")) {
                    return true;
                }
                return false;
            }
        });

        //write a file that contains the extract from all other zip files
        final BookDriver fake = SwordBookDriver.instance();
        for (File bookZipFile : fileList) {
            try {
                extraConfFile(fake, bookZipFile);
            } catch (Exception ex) {
                LOGGER.error("Failed to read: [{}]", bookZipFile.getAbsoluteFile());
                LOGGER.trace(ex.getMessage(), ex);
            }
        }
        loaded = true;
    }

    /**
     * Extracts a single conf file to read its details
     *
     * @param zipFile the zip file in question
     */
    private void extraConfFile(BookDriver fakeDriver, File zipFile)  throws NoSuchKeyException, BookException {
        InputStream in = null;
        ZipInputStream zin = null;
        try {
            ConfigEntry.resetStatistics();

            in = NetUtil.getInputStream(zipFile.toURI());
            zin = new ZipInputStream(in);
            boolean confDone = false;
            boolean v11nDone = false;
            byte[] confBytes = null;
            byte[] v11nBytes = null;
            String confName = "";
            while (true) {
                ZipEntry entry = zin.getNextEntry();
                if (entry == null) {
                    // We scanned the whole zip file
                    if(v11nDone && v11nBytes != null) {
                        // process custom versification first
                        CustomVersification cv = new CustomVersification();
                        cv.loadFromJSON(v11nBytes);
                    }
                    if(confDone && confBytes != null) {
                        // Process the conf file
                        SwordBookMetaData sbmd = new SwordBookMetaData(confBytes, confName);
                        sbmd.setDriver(fakeDriver);
                        Book book = new SwordBook(sbmd, new NullBackend());
                        entries.put(book.getName(), book);

                        return;
                    }
                    break;
                }

                String internal = entry.getName();

                if (!v11nDone && internal.endsWith("json")
                        && internal.startsWith("step/versification/")) {
                    // Custom versification
                    LOGGER.trace("Reading a json file [{}]", entry.getName());

                    int size = (int) entry.getSize();

                    ByteArrayOutputStream os = new ByteArrayOutputStream();
                    byte[] bytes = new byte[1024];
                    int read;
                    while ((read = zin.read(bytes)) > 0) {
                        os.write(bytes, 0, read);
                    }

                    v11nBytes = os.toByteArray();

                    v11nDone = true;
                }
                else if (!confDone && internal.endsWith(SwordConstants.EXTENSION_CONF)
                        && internal.startsWith(SwordConstants.DIR_CONF + '/')) {
                    LOGGER.trace("Reading a conf file [{}]", entry.getName());

                    try {
                        int size = (int) entry.getSize();

                        ByteArrayOutputStream os = new ByteArrayOutputStream();
                        byte[] bytes = new byte[1024];
                        int read;
                        while ((read = zin.read(bytes)) > 0) {
                            os.write(bytes, 0, read);
                        }

                        internal = internal.substring(0, internal.length() - 5);
                        if (internal.startsWith(SwordConstants.DIR_CONF + '/')) {
                            internal = internal.substring(7);
                        }

                        confName = internal;
                        confBytes = os.toByteArray();
                        confDone = true;

                        /*
                        SwordBookMetaData sbmd = new SwordBookMetaData(os.toByteArray(), internal);
                        sbmd.setDriver(fakeDriver);
                        Book book = new SwordBook(sbmd, new NullBackend());
                        entries.put(book.getName(), book);
                        */
                        //assume 1 conf file per zip file
                        // return
                    } catch (Exception ex) {
                        LOGGER.error("Failed to load config for entry: {}", internal, ex);
                    }
                }
            }
            ConfigEntry.dumpStatistics();
        } catch (IOException ex) {
            LOGGER.error("Failed to configuration from [{}]", zipFile.getName());
            throw new StepInternalException("Error reading directory of zip files.", ex);
        } finally {
            IOUtil.close(zin);
            IOUtil.close(in);
        }
    }

}
