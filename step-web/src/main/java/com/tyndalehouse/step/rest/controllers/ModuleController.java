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
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.service.ModuleService;
import com.tyndalehouse.step.core.service.MorphologyService;
import com.tyndalehouse.step.core.service.VocabularyService;
import com.tyndalehouse.step.models.info.Info;
import com.tyndalehouse.step.models.info.MorphInfo;
import com.tyndalehouse.step.models.info.VocabInfo;
import com.tyndalehouse.step.rest.framework.Cacheable;

/**
 * The Module Controller servicing requests for module information
 */
public class ModuleController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ModuleController.class);
    private final ModuleService moduleService;
    private final MorphologyService morphology;
    private final VocabularyService vocab;

    /**
     * sets up the controller to access module information
     * 
     * @param moduleService the service allowing access to module information
     * @param morphology the morphology service
     * @param vocabulary the vocabulary service
     */
    @Inject
    public ModuleController(final ModuleService moduleService, final MorphologyService morphology,
            final VocabularyService vocabulary) {
        notNull(moduleService,
                "Intialising the module service in the module administration controller failed",
                CONTROLLER_INITIALISATION_ERROR);
        notNull(morphology,
                "Intialising the morphology service failed in the module administration controller",
                CONTROLLER_INITIALISATION_ERROR);
        this.moduleService = moduleService;
        this.morphology = morphology;
        this.vocab = vocabulary;
    }

    /**
     * a REST method that returns version of the Bible that are available
     * 
     * @return all versions of modules that are considered to be Bibles.
     */
    public List<BibleVersion> getAllModules() {
        return this.moduleService.getAvailableModules();
    }

    /**
     * a REST method that returns version of the Bible that are not yet installed
     * 
     * @return all versions of modules that are considered to be modules and usable by STEP.
     */
    public List<BibleVersion> getAllInstallableModules() {
        return this.moduleService.getAllInstallableModules();
    }

    /**
     * a method that returns all the definitions for a particular key
     * 
     * @param vocabIdentifiers the strong number
     * @param morphIdentifiers the morphology code to lookup
     * @param osisId the id of the verse that we are looking up
     * @return the definition(s) that can be resolved from the reference provided
     */
    @Cacheable(true)
    public Info getInfo(final String vocabIdentifiers, final String morphIdentifiers, final String osisId) {
        // notEmpty(strong, "A reference must be provided to obtain a definition", USER_MISSING_FIELD);
        LOGGER.debug("Getting information for [{}], [{}], [{}]", new Object[] { this.vocab, morphIdentifiers,
                osisId });

        final Info i = new Info();
        i.setMorphInfos(translateToInfo(this.morphology.getMorphology(morphIdentifiers), true));

        if (isNotBlank(vocabIdentifiers)) {
            i.setVocabInfos(translateToVocabInfo(this.vocab.getDefinitions(vocabIdentifiers), true));
        }
        return i;
    }

    /**
     * a method that returns all the definitions for a particular key
     * 
     * @param vocabIdentifiers the strong number
     * @param morphIdentifiers the morphology code to lookup
     * @return the definition(s) that can be resolved from the reference provided
     */
    @Cacheable(true)
    public Info getQuickInfo(final String vocabIdentifiers, final String morphIdentifiers) {
        // notEmpty(strong, "A reference must be provided to obtain a definition", USER_MISSING_FIELD);
        LOGGER.debug("Getting quick information for [{}], [{}]",
                new Object[] { this.vocab, morphIdentifiers });

        final Info i = new Info();
        i.setMorphInfos(translateToInfo(this.morphology.getQuickMorphology(morphIdentifiers), false));

        if (isNotBlank(vocabIdentifiers)) {
            i.setVocabInfos(translateToVocabInfo(this.vocab.getQuickDefinitions(vocabIdentifiers), false));
        }
        return i;
    }

    /**
     * Copies over information
     * 
     * @param definitions info from definitions is copied over
     * @param includeAllInfo true to include all information
     * @return a list of infos
     */
    private List<VocabInfo> translateToVocabInfo(final EntityDoc[] definitions, final boolean includeAllInfo) {
        final List<VocabInfo> morphologyInfos = new ArrayList<VocabInfo>(definitions.length);
        for (final EntityDoc d : definitions) {
            morphologyInfos.add(new VocabInfo(d, includeAllInfo));
        }
        return morphologyInfos;
    }

    /**
     * Morphology to information for the UI
     * 
     * @param morphologies the list of all morphologies
     * @param includeAllInfo true to include all information
     * @return the morphology information pojo
     */
    private List<MorphInfo> translateToInfo(final List<EntityDoc> morphologies, final boolean includeAllInfo) {
        final List<MorphInfo> morphologyInfos = new ArrayList<MorphInfo>(morphologies.size());
        for (final EntityDoc m : morphologies) {
            morphologyInfos.add(new MorphInfo(m, includeAllInfo));
        }
        return morphologyInfos;
    }
}
