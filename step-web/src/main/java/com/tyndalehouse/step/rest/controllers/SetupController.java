package com.tyndalehouse.step.rest.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.service.BibleInformationService;

/**
 * The controller that will deal with any requests changing the behaviour of the application
 * 
 * @author Chris
 * 
 */
@Singleton
public class SetupController {
    private static final Logger LOGGER = LoggerFactory.getLogger(SetupController.class);
    private final BibleInformationService bibleInformation;

    /**
     * creates the controller
     * 
     * @param bibleInformationService the service that allows access to biblical material
     */
    @Inject
    public SetupController(final BibleInformationService bibleInformationService) {
        this.bibleInformation = bibleInformationService;
    }

    /**
     * a REST method to retrieve events between two dates The arrays match in index, and go by three (timebandId, from,
     * to), (timebandId, from, to), ...
     * 
     * @return true if the software reckons this is the first time
     */
    // @RequestMapping("/isFirstTime")
    public boolean isFirstTime() {
        LOGGER.debug("Checking whether this is the first time the software is being run");
        return !this.bibleInformation.hasCoreModules();
    }

    /**
     * Installing default modules
     * 
     */
    // @RequestMapping("/install/defaultModules")
    public void installDefaultModules() {
        LOGGER.debug("Installing default modules");
        this.bibleInformation.installDefaultModules();
    }

    /**
     * Installing default modules
     * 
     * @param reference the initials of the bible to install
     */
    // @RequestMapping("/install/book/{reference}")
    public void installBible(final String reference) {
        LOGGER.debug("Installing module {}", reference);
        this.bibleInformation.installModules(reference);
    }
}
