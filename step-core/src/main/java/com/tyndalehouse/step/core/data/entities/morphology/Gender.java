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
package com.tyndalehouse.step.core.data.entities.morphology;

import static com.tyndalehouse.step.core.utils.EnumUtils.getReverseMap;

import java.util.Map;

import com.tyndalehouse.step.core.models.HasCsvValueName;

/**
 * Gender of the word
 * 
 * @author chrisburrell
 * 
 */
// CHECKSTYLE:OFF
public enum Gender implements HasCsvValueName {
    FEMININE("Feminine", null, "fem"),
    MASCULINE("Masculine", null, "mas"),
    NEUTRER("Neuter", null, "neut"),
    AEOLIC("Aeolic"),
    APOCOPATED_FORM("Apocopated form"),
    ATTIC_FORM("ATTic form", "Attic form"),
    CONTRACTED_FORM("Contracted form"),
    IRREGULAR_OR_IMPURE_FORM("iRRegular or impure form", "Irregular form"),
    MIDDLE_SIGNIFICANCE("Middle significance");

    private static Map<String, Gender> values = getReverseMap(values());
    private final String csvValueName;
    private final String displayName;
    private final String cssClass;

    /**
     * @param displayText name to be displayed on the screen
     */
    Gender(final String csvValueName) {
        this(csvValueName, null);
    }

    Gender(final String csvValueName, final String displayName) {
        this(csvValueName, null, null);
    }

    /**
     * @param displayText name to be displayed on the screen
     */
    Gender(final String csvValueName, final String displayName, final String cssClass) {
        this.csvValueName = csvValueName;
        this.displayName = displayName;
        this.cssClass = cssClass;

    }

    /**
     * @return the displayName
     */
    public String getCsvValueName() {
        return this.csvValueName;
    }

    public static Gender resolveByCsvValueName(final String csvValueName) {
        return values.get(csvValueName);
    }

    /**
     * @return the displayName
     */
    String getDisplayName() {
        if (this.displayName != null) {
            return this.displayName;
        }
        return this.csvValueName;
    }

    @Override
    public String toString() {
        return getDisplayName();
    }

    /**
     * @return the cssClass
     */
    public String getCssClass() {
        return this.cssClass;
    }
}
