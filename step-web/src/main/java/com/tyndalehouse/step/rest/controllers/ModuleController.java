package com.tyndalehouse.step.rest.controllers;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.service.ModuleService;
import com.tyndalehouse.step.rest.framework.Cacheable;

/**
 * The Module Controller servicing requests for module information
 */
public class ModuleController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ModuleController.class);
    private final ModuleService moduleDefintions;

    /**
     * sets up the controller to access module information
     * 
     * @param moduleDefintions the service allowing access to module information
     */
    @Inject
    public ModuleController(final ModuleService moduleDefintions) {
        this.moduleDefintions = moduleDefintions;
    }

    /**
     * a REST method that returns version of the Bible that are available
     * 
     * @return all versions of modules that are considered to be Bibles.
     */
    public List<BibleVersion> getAllModules() {
        return this.moduleDefintions.getAvailableModules();
    }

    /**
     * a REST method that returns version of the Bible that are not yet installed
     * 
     * @return all versions of modules that are considered to be modules and usable by STEP.
     */
    public List<BibleVersion> getAllInstallableModules() {
        return this.moduleDefintions.getAllInstallableModules();
    }

    /**
     * a REST method that returns all the definitions for a particular key
     * 
     * @param reference a reference for a module to lookup
     * @return the definition(s) that can be resolved from the reference provided
     */
    @Cacheable(true)
    public String getDefinition(final String reference) {
        LOGGER.debug("Getting definition for {}", reference);
        return this.moduleDefintions.getDefinition(reference).getExplanation();
    }
}
