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
 * A simple wrapper around a string for returning as a JSON-mapped object
 * 
 * @author chrisburrell
 * 
 */
public class OsisWrapper implements Serializable {
    private static final long serialVersionUID = -5651330317995494895L;
    private String value;
    private String reference;
    private String osisId;
    private boolean fragment;
    private boolean isMultipleRanges;
    private int startRange;
    private int endRange;
    private final String languageCode;

    /**
     * the value to be wrapped
     * 
     * @param value the value to be wrapped around
     * @param reference reference
     * @param languageCode languageCode of the retrieved Bible
     * @param osisId TODO
     */
    public OsisWrapper(final String value, final String reference, final String languageCode,
            final String osisId) {
        this.value = value;
        this.reference = reference;
        this.languageCode = languageCode;
        this.osisId = osisId;
    }

    /**
     * @return the value to be returned
     */
    public String getValue() {
        return this.value;
    }

    /**
     * @return the reference
     */
    public String getReference() {
        return this.reference;
    }

    /**
     * @param fragment the fragment to set
     */
    public void setFragment(final boolean fragment) {
        this.fragment = fragment;
    }

    /**
     * @return the fragment
     */
    public boolean isFragment() {
        return this.fragment;
    }

    /**
     * @param value the value to set
     */
    public void setValue(final String value) {
        this.value = value;
    }

    /**
     * @param reference the reference to set
     */
    public void setReference(final String reference) {
        this.reference = reference;
    }

    /**
     * @return the startRange
     */
    public int getStartRange() {
        return this.startRange;
    }

    /**
     * @param startRange the startRange to set
     */
    public void setStartRange(final int startRange) {
        this.startRange = startRange;
    }

    /**
     * @return the endRange
     */
    public int getEndRange() {
        return this.endRange;
    }

    /**
     * @param endRange the endRange to set
     */
    public void setEndRange(final int endRange) {
        this.endRange = endRange;
    }

    /**
     * @return the isMultipleRanges
     */
    public boolean isMultipleRanges() {
        return this.isMultipleRanges;
    }

    /**
     * @param hasMultipleRanges the isMultipleRanges to set
     */
    public void setMultipleRanges(final boolean hasMultipleRanges) {
        this.isMultipleRanges = hasMultipleRanges;
    }

    /**
     * @return the languageCode
     */
    public String getLanguageCode() {
        return this.languageCode;
    }

    /**
     * @return the osisId
     */
    public String getOsisId() {
        return this.osisId;
    }

    /**
     * @param osisId the osisId to set
     */
    public void setOsisId(final String osisId) {
        this.osisId = osisId;
    }
}
