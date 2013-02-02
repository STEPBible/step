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
package com.tyndalehouse.step.core.exceptions;

/**
 * Contains a list of errors and their corresponding error messages, a step towards localisation
 * 
 * @author chrisburrell
 * 
 */
public enum UserExceptionType {
    /**
     * Some general error while receiving a request at the service layer
     */
    SERVICE_VALIDATION_ERROR("internal_error"),
    /** Functionality not available unless the user logs in */
    LOGIN_REQUIRED("error_login"),
    /** the user incorrectly provided a field */
    USER_VALIDATION_ERROR("error_validation"),
    /** the user did not provide a field */
    USER_MISSING_FIELD("error_missing_field"),
    /** App is not providing a field that is expected */
    APP_MISSING_FIELD("internal_error"),
    /** Some general error at the controller layer */
    CONTROLLER_INITIALISATION_ERROR("internal_error");

    private final String langKey;

    /**
     * Instantiates a new user exception type.
     * 
     * @param langKey the lang key
     */
    UserExceptionType(final String langKey) {
        this.langKey = langKey;
    }

    /**
     * @return the langKey
     */
    public String getLangKey() {
        return this.langKey;
    }
}
