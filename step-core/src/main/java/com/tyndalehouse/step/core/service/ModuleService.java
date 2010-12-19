package com.tyndalehouse.step.core.service;

import java.util.List;

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.Definition;

/**
 * Interface to the service that gives information about the books of the bible, the different types of bible, etc. This
 * service will mainly use JSword but may also rely on other data sources to display text.
 * 
 * @author Chris
 * 
 */
public interface ModuleService {
    /**
     * Returns all the definitions associated with a particular set of lookup references
     * 
     * @param references a list of references
     * @return the definitions associated with the references
     */
    List<Definition> getDefinitions(String references);

    /**
     * Returns the definition for a particular reference
     * 
     * @param reference a reference
     * @return the definitions associated with the references
     */
    Definition getDefinition(String reference);

    /**
     * @return all installed modules
     */
    List<BibleVersion> getAvailableModules();

    /**
     * @return a list of all modules that could be installed
     */
    List<BibleVersion> getAllInstallableModules();
}
