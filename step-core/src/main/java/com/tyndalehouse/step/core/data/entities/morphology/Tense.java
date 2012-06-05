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

import com.tyndalehouse.step.core.models.HasDisplayName;

/**
 * Tense of a verb, etc.
 * 
 * @author chrisburrell
 */
// CHECKSTYLE:OFF
public enum Tense implements HasDisplayName {
    AORIST("Aorist"),
    COMPARATIVE("Comparative"),
    CONTRACTED_FORM("Contracted form"),
    FUTURE("Future"),
    IMPERFECT("ImpeRfect"),
    INDECLINABLE_LETTER("Indeclinable Letter"),
    INDECLINABLE_NUMERAL("Indeclinable NUmeral"),
    INDEFINITE_TENSE("Indefinite tense"),
    INTERROGATIVE("Interrogative"),
    NEGATIVE("Negative"),
    PRESENT("Present"),
    SECOND_AORIST("Second Aorist"),
    SECOND_FUTURE("Second Future"),
    SECOND_PERFECT("Second peRfect"),
    SECOND_PLUPERFECT("Second pLupeRfect");

    private static Map<String, Tense> values = getReverseMap(values());
    private final String displayName;

    /**
     * @param displayText the text to display on the screen
     */
    Tense(final String displayName) {
        this.displayName = displayName;
    }

    /**
     * @return the displayText
     */
    public String getDisplayName() {
        return this.displayName;
    }

    public static Tense resolveByDisplayName(final String displayName) {
        return values.get(displayName);
    }

    @Override
    public String toString() {
        return getDisplayName();
    }
}
