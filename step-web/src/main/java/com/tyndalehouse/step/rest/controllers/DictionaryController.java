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

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.DictionaryArticle;
import com.tyndalehouse.step.core.service.DictionaryService;
import com.tyndalehouse.step.rest.framework.Cacheable;

/**
 * The controller for retrieving information on the bible or texts from the bible
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class DictionaryController {
    private static final Logger LOGGER = LoggerFactory.getLogger(DictionaryController.class);
    private final DictionaryService dictionary;

    /**
     * creates the controller giving access to bible information
     * 
     * @param dictionary the dictionary serivce that looks up and searches articles
     */
    @Inject
    public DictionaryController(final DictionaryService dictionary) {
        this.dictionary = dictionary;
        LOGGER.debug("Created Dictionary Controller");
    }

    /**
     * 
     * @param headword the headword to lookup
     * @param headwordInstance the number of the article to retrieve
     * @return the list of matching articles
     */
    @Cacheable(true)
    public DictionaryArticle lookupDictionaryByHeadword(final String headword, final String headwordInstance) {
        final int headwordI = Integer.parseInt(headwordInstance);
        return this.dictionary.lookupArticleByHeadword(headword, headwordI);
    }

    /**
     * Searches all article matching the headword.
     * 
     * @param headword the article name
     * @return the list of articles
     */
    public List<DictionaryArticle> searchDictionaryByHeadword(final String headword) {
        return this.dictionary.searchArticlesByHeadword(headword);
    }
}