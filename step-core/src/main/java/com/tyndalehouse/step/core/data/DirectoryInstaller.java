package com.tyndalehouse.step.core.data;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;

import org.crosswire.common.progress.Progress;
import org.crosswire.common.util.IOUtil;
import org.crosswire.common.util.NetUtil;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.install.InstallException;
import org.crosswire.jsword.book.install.sword.AbstractSwordInstaller;

/**
 * Installs packages from a directory
 * 
 * @author chrisburrell
 * 
 */
public class DirectoryInstaller extends AbstractSwordInstaller {
    /**
     * the default host convention for directory installers, required as it is used by JSword to create a
     * temporary directory to stage the "downloads"
     */
    public static final String DIRECTORY_HOST = "localhost-directory";

    /**
     * @param holdingDirectory the directory containing all packages
     */
    public DirectoryInstaller(final String holdingDirectory) {
        super.setPackageDirectory(holdingDirectory);
        super.setHost(DIRECTORY_HOST);
    }

    @Override
    public String getType() {
        return "sword-file";
    }

    @Override
    public URI toRemoteURI(final Book book) {
        final File bookPackage = getBookPackage(book);
        return bookPackage.toURI();
    }

    /**
     * @param book the book to be installed
     * @return the file in which can be found all packages that are available for installation
     */
    private File getBookPackage(final Book book) {
        return new File(super.getPackageDirectory(), book.getInitials() + ZIP_SUFFIX);
    }

    @Override
    public int getSize(final Book book) {
        return NetUtil.getSize(toRemoteURI(book));
    }

    @Override
    protected void download(final Progress job, final String packageDir, final String file, final URI dest)
            throws InstallException {
        final File sourceFile = new File(super.getPackageDirectory(), file);
        // copy two streams
        InputStream source = null;
        OutputStream target = null;
        try {
            target = new BufferedOutputStream(new FileOutputStream(new File(dest)));
            source = new BufferedInputStream(new FileInputStream(sourceFile));

            final byte[] buffer = new byte[1024];
            int length = 0;
            while ((length = source.read(buffer)) > 0) {
                target.write(buffer, 0, length);
            }
        } catch (final FileNotFoundException e) {
            throw new InstallException(
                    "File not found (either source or destination). Unable to open stream to copy file.", e);
        } catch (final IOException e) {
            throw new InstallException("General IOException. Can't read/write to specified files", e);
        } finally {
            IOUtil.close(source);
            IOUtil.close(target);
        }
    }
}
