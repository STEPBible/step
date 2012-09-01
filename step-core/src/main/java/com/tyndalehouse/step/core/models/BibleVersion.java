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

import java.io.Serializable;

/**
 * Contains information about a bible version to be displayed on the screen in the UI
 * 
 * @author CJBurrell
 * 
 */
public class BibleVersion implements Serializable {
    private static final long serialVersionUID = 6598606392490334637L;
    private String initials;
    private String name;
    private boolean hasStrongs;
    private boolean hasMorphology;
    private boolean questionable;
    private String languageCode;
    private String category;

    /**
     * @return true if the version contains strong-tagged information
     */
    public boolean isHasStrongs() {
        return this.hasStrongs;
    }

    /**
     * @return the hasMorphology
     */
    public boolean isHasMorphology() {
        return this.hasMorphology;
    }

    /**
     * @param hasMorphology the hasMorphology to set
     */
    public void setHasMorphology(final boolean hasMorphology) {
        this.hasMorphology = hasMorphology;
    }

    /**
     * @param hasStrongs true if the version contains strong information
     */
    public void setHasStrongs(final boolean hasStrongs) {
        this.hasStrongs = hasStrongs;
    }

    /**
     * @return the initials
     */
    public String getInitials() {
        return this.initials;
    }

    /**
     * @param initials the initials to set
     */
    public void setInitials(final String initials) {
        this.initials = initials;
    }

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * @param name the name to set
     */
    public void setName(final String name) {
        this.name = name;
    }

    /**
     * @return the languageCode
     */
    public String getLanguageCode() {
        return this.languageCode;
    }

    /**
     * @param languageCode the languageCode to set
     */
    public void setLanguageCode(final String languageCode) {
        this.languageCode = languageCode;
    }

    /**
     * @return the questionable
     */
    public boolean isQuestionable() {
        return this.questionable;
    }

    /**
     * @param questionable the questionable to set
     */
    public void setQuestionable(final boolean questionable) {
        this.questionable = questionable;
    }

    /**
     * @return the category
     */
    public String getCategory() {
        return this.category;
    }

    /**
     * @param category the category to set
     */
    public void setCategory(final String category) {
        this.category = category;
    }
}
