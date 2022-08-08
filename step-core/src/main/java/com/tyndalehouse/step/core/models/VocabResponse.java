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
package com.tyndalehouse.step.core.models;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.tyndalehouse.step.core.data.EntityDoc;

/**
 * The Class VocabResponse.
 */
public class VocabResponse {
    private EntityDoc[] definitions;
    private Map<String, List<LexiconSuggestion>> relatedWords;

    /**
     * Instantiates a new vocab response.
     * @param definitions the definitions
     * @param relatedWords the related words
     */
    public VocabResponse(final EntityDoc[] definitions,
                         final Map<String, List<LexiconSuggestion>> relatedWords) {
        this.definitions = definitions;
        this.relatedWords = relatedWords;
    }

    /**
     * Instantiates a new vocab response, all empty
     */
    public VocabResponse() {
        this(new EntityDoc[0]);
    }

    /**
     * Instantiates a new vocab response, only with definitions.
     * 
     * @param definitions the definitions
     */
    public VocabResponse(final EntityDoc[] definitions) {
        this(definitions, new HashMap<String, List<LexiconSuggestion>>());
    }

    /**
     * @return the definitions
     */
    public EntityDoc[] getDefinitions() {
        return this.definitions;
    }

    /**
     * @param definitions the definitions to set
     */
    public void setDefinitions(final EntityDoc[] definitions) {
        this.definitions = definitions;
    }

    /**
     * @return the relatedWords
     */
    public Map<String, List<LexiconSuggestion>> getRelatedWords() {
        return this.relatedWords;
    }

    /**
     * @param relatedWords the relatedWords to set
     */
    public void setRelatedWords(final Map<String, List<LexiconSuggestion>> relatedWords) {
        this.relatedWords = relatedWords;
    }
}
