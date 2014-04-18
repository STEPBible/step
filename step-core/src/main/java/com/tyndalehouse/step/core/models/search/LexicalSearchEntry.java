/**************************************************************************************************
 * Copyright (c) 2013, Directors of the Tyndale STEP Project                                      *
 * All rights reserved.                                                                           *
 *                                                                                                *
 * Redistribution and use in source and binary forms, with or without                             *
 * modification, are permitted provided that the following conditions                             *
 * are met:                                                                                       *
 *                                                                                                *
 * Redistributions of source code must retain the above copyright                                 *
 * notice, this list of conditions and the following disclaimer.                                  *
 * Redistributions in binary form must reproduce the above copyright                              *
 * notice, this list of conditions and the following disclaimer in                                *
 * the documentation and/or other materials provided with the                                     *
 * distribution.                                                                                  *
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)                        *
 * nor the names of its contributors may be used to endorse or promote                            *
 * products derived from this software without specific prior written                             *
 * permission.                                                                                    *
 *                                                                                                *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS                            *
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT                              *
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS                              *
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE                                 *
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                           *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,                           *
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;                               *
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER                               *
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT                             *
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING                                 *
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF                                 *
 * THE POSSIBILITY OF SUCH DAMAGE.                                                                *
 **************************************************************************************************/

package com.tyndalehouse.step.core.models.search;

/**
 * @author chrisburrell
 */
public class LexicalSearchEntry implements SearchEntry {
    private String stepGloss;
    private String stepTransliteration;
    private String accentedUnicode;
    private String strongNumber;

    /**
     * @param stepGloss the stepGloss to set
     */
    public void setStepGloss(final String stepGloss) {
        this.stepGloss = stepGloss;
    }

    /**
     * @return the stepGloss
     */
    public String getStepGloss() {
        return this.stepGloss;
    }

    /**
     * @return the stepTransliteration
     */
    public String getStepTransliteration() {
        return this.stepTransliteration;
    }

    /**
     * @param stepTransliteration the stepTransliteration to set
     */
    public void setStepTransliteration(final String stepTransliteration) {
        this.stepTransliteration = stepTransliteration;
    }

    /**
     * @return the accentedUnicode
     */
    public String getAccentedUnicode() {
        return this.accentedUnicode;
    }

    /**
     * @param accentedUnicode the accentedUnicode to set
     */
    public void setAccentedUnicode(final String accentedUnicode) {
        this.accentedUnicode = accentedUnicode;
    }

    public String getStrongNumber() {
        return strongNumber;
    }

    public void setStrongNumber(final String strongNumber) {
        this.strongNumber = strongNumber;
    }
}
