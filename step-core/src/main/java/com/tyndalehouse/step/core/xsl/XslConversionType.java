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
package com.tyndalehouse.step.core.xsl;

/**
 * Defines which types of XSL stylesheets are available
 * 
 * @author chrisburrell
 * 
 */
public enum XslConversionType {
    /**
     * a standard text, where only one line of text will be displayed, (i.e. normal style)
     */
    DEFAULT,
    /**
     * identifies a text that requires outputs on multiple lines
     */
    INTERLINEAR("interlinear.xsl"),

    /**
     * Only outputs the headings that happen to be in the XML
     */
    HEADINGS_ONLY("headers-only.xsl"),

    /** commentaries contain verses, free text and references */
    COMMENTARY("commentary.xsl");

    /**
     * indicates the xsl conversion file to use for this work
     */
    private final String file;

    /**
     * giving a default XSL file to this Conversion type
     */
    private XslConversionType() {
        this("default.xsl");
    }

    /**
     * constructing a type associated with a specific file
     * 
     * @param file the XSL transformation file
     */
    private XslConversionType(final String file) {
        this.file = file;
    }

    /**
     * @return the file associated with this type
     */
    public String getFile() {
        return this.file;
    }
}
