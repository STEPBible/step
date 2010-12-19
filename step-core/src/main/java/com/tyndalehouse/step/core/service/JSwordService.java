package com.tyndalehouse.step.core.service;

import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;

import com.tyndalehouse.step.core.models.LookupOption;

/**
 * The service providing access to JSword. All JSword calls should preferably be placed in this service
 * 
 * @author Chris
 * 
 */
public interface JSwordService {
    /**
     * returns the Osis Text as a String
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @return the OSIS text in an HTML form
     */
    String getOsisText(String version, String reference, List<LookupOption> options, String interlinearVersion);

    /**
     * returns the biblical text as xml dom
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @return the OSIS text in an HTML form
     */
    String getOsisText(String version, String reference);

    /**
     * looks up any installed module
     * 
     * @param bibleCategory the categories of the modules to be returned
     * @return a list of bible books
     */
    List<Book> getInstalledModules(BookCategory... bibleCategory);

    /**
     * Gets the features for a module
     * 
     * @param version the initials of the book to look up
     * @return the list of supported features
     */
    List<LookupOption> getFeatures(String version);

    /**
     * Using module initials, checks whether the module has been installed
     * 
     * @param moduleInitials the initials of the modules to check for installation state
     * @return true if the module is installed
     */
    boolean isInstalled(String moduleInitials);

    /**
     * Kicks of a process to install this version (asynchronous)
     * 
     * @param version version to be installs
     */
    void installBook(String version);

    /**
     * assesses the progress made on an installation
     * 
     * @param bookName the book name
     * @return the percentage of completion (0 - 1.0)
     */
    double getProgressOnInstallation(String bookName);

    /**
     * retrieves all modules that have been installed
     * 
     * @param bookCategory the list of categories to be included
     * @return all modules whether installed or not
     */
    List<Book> getAllModules(BookCategory... bookCategory);

}
