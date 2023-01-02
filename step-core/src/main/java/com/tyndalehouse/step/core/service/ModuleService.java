package com.tyndalehouse.step.core.service;

import java.util.List;

import org.crosswire.jsword.book.BookCategory;

import com.tyndalehouse.step.core.models.BibleVersion;

/**
 * Interface to the service that gives information about the books of the bible, the different types of bible,
 * etc. This service will mainly use JSword but may also rely on other data sources to display text.
 *
 * @author chrisburrell
 */
public interface ModuleService {
    /**
     * @return all installed modules
     */
    List<BibleVersion> getAvailableModules();

    /**
     * @param categories     the types of modules to include
     * @param installerIndex installer index to look up modules from
     * @return a list of all modules that could be installed
     */
    List<BibleVersion> getAllInstallableModules(int installerIndex, BookCategory... categories);

}
