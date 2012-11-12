/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.CONTROLLER_INITIALISATION_ERROR;
import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;
import static com.tyndalehouse.step.rest.framework.RequestUtils.validateSession;

import java.util.List;

import javax.inject.Provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.servlet.RequestScoped;
import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.BibleInformationService;

/**
 * The controller that will deal with any requests changing the behaviour of the application
 * 
 * @author chrisburrell
 * 
 */
@RequestScoped
public class SetupController {
    private static final Logger LOGGER = LoggerFactory.getLogger(SetupController.class);
    private final BibleInformationService bibleInformation;
    private final Loader loader;
    private final Provider<ClientSession> sessionProvider;

    /**
     * creates the controller
     * 
     * @param bibleInformationService the service that allows access to biblical material
     * @param loader service which is able to load the data into the database
     * @param sessionProvider the provider of the user session
     */
    @Inject
    public SetupController(final BibleInformationService bibleInformationService, final Loader loader,
            final Provider<ClientSession> sessionProvider) {
        notNull(bibleInformationService, "No bible information service was provided",
                CONTROLLER_INITIALISATION_ERROR);
        notNull(loader, "No loader module was provided", CONTROLLER_INITIALISATION_ERROR);
        notNull(sessionProvider, "No session provider was passed in", CONTROLLER_INITIALISATION_ERROR);

        this.sessionProvider = sessionProvider;
        this.bibleInformation = bibleInformationService;
        this.loader = loader;
    }

    /**
     * Kicks of installation process, which includes downloading the KJV & ESV and creating index for lots of
     * data.
     */
    public void installFirstTime() {
        this.loader.init();
    }

    /**
     * @return true if the installation has completed and the application is ready to be used
     */
    public boolean isInstallationComplete() {
        return this.loader.isComplete();
    }

    /**
     * @return reads progress state
     */
    public List<String> getProgress() {
        return this.loader.readOnceProgress();
    }

    /**
     * a REST method to retrieve events between two dates The arrays match in index, and go by three
     * (timebandId, from, to), (timebandId, from, to), ...
     * 
     * @return true if the software reckons this is the first time
     */
    public boolean isFirstTime() {
        LOGGER.debug("Checking whether this is the first time the software is being run");
        return !this.bibleInformation.hasCoreModules();
    }

    /**
     * Installing default modules
     * 
     */
    public void installDefaultModules() {
        validateSession(this.sessionProvider);
        LOGGER.debug("Installing default modules");
        // this.bibleInformation.installDefaultModules();
        this.loader.init();
    }

    /**
     * Installing default modules
     * 
     * @param reference the initials of the bible to install
     */
    public void installBible(final String reference) {
        validateSession(this.sessionProvider);

        notBlank(reference, "A reference must be provided to install a bible", USER_MISSING_FIELD);
        LOGGER.debug("Installing module {}", reference);
        this.bibleInformation.installModules(reference);
    }

    /**
     * indexes a book
     * 
     * @param initials the initials of the book to index
     */
    public void index(final String initials) {
        validateSession(this.sessionProvider);

        notBlank(initials, "A version must be provided", USER_MISSING_FIELD);
        this.bibleInformation.index(initials);
    }

    /**
     * Re-indexes a book
     * 
     * @param initials the initials of the book to index
     */
    public void reIndex(final String initials) {
        validateSession(this.sessionProvider);

        notBlank(initials, "A version must be provided", USER_MISSING_FIELD);
        this.bibleInformation.reIndex(initials);
    }
}
