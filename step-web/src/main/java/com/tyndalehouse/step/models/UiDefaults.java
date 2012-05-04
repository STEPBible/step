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
package com.tyndalehouse.step.models;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

/**
 * A POJO to hold properties
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class UiDefaults {
    private final String defaultVersion1;
    private final String defaultVersion2;
    private final String defaultReference1;
    private final String defaultReference2;

    /**
     * injecting the defaults from property files
     * 
     * @param defaultVersion1 the default version for column 1
     * @param defaultReference1 the default reference for column 1
     * @param defaultVersion2 the default version for column 2
     * @param defaultReference2 the default reference for column 2
     */
    @Inject
    public UiDefaults(@Named("app.ui.defaults.1.version") final String defaultVersion1,
            @Named("app.ui.defaults.1.reference") final String defaultReference1,
            @Named("app.ui.defaults.2.version") final String defaultVersion2,
            @Named("app.ui.defaults.2.reference") final String defaultReference2) {
        this.defaultVersion1 = defaultVersion1;
        this.defaultReference1 = defaultReference1;
        this.defaultVersion2 = defaultVersion2;
        this.defaultReference2 = defaultReference2;
    }

    /**
     * @return the defaultVersion1
     */
    public String getDefaultVersion1() {
        return this.defaultVersion1;
    }

    /**
     * @return the defaultVersion2
     */
    public String getDefaultVersion2() {
        return this.defaultVersion2;
    }

    /**
     * @return the defaultReference1
     */
    public String getDefaultReference1() {
        return this.defaultReference1;
    }

    /**
     * @return the defaultReference2
     */
    public String getDefaultReference2() {
        return this.defaultReference2;
    }
}
