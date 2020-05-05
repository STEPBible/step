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
package com.tyndalehouse.step.core.utils;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;

import com.tyndalehouse.step.core.exceptions.UserExceptionType;
import com.tyndalehouse.step.core.exceptions.ValidationException;
import java.util.Locale;

/**
 * Checks various assertions and throws the exception: {@link ValidationException}
 * 
 * @author chrisburrell
 * 
 */
public final class ValidateUtils {
    /** can't instantiate */
    private ValidateUtils() {
        // no op
    }

    /**
     * @param o the parameter to test for null
     * @param exceptionMessage the message to be logged if the exception is caught later
     * @param type the type of error
     */
    public static void notNull(final Object o, final String exceptionMessage, final UserExceptionType type) {
        if (o == null) {
            throw new ValidationException(exceptionMessage, type);
        }
    }

    /**
     * @param s the parameter to test for null
     * @param exceptionMessage the exception message for use by a developer
     * @param type the type of exception
     */
    public static void notEmpty(final String s, final String exceptionMessage, final UserExceptionType type) {
        if (isEmpty(s)) {
            throw new ValidationException(exceptionMessage, type);
        }
    }

    /**
     * @param s the parameter to test for null
     * @param type the type of exception message
     * @param exceptionMessage the message to be logged if the exception is caught later
     */
    public static void notBlank(final String s, final String exceptionMessage, final UserExceptionType type) {
        if (isBlank(s)) {
            throw new ValidationException(exceptionMessage, type);
        }
    }

    /**
     * @param s the string to be tested
     * @param minCharacters the number of characters below which we reject the request
     * @param exceptionMessage the message
     * @param type the type of user exception
     */
    public static void atLeast(final String s, final int minCharacters, final String exceptionMessage,
            final UserExceptionType type) {
        if (s.length() < minCharacters) {
            throw new ValidationException(exceptionMessage, type);
        }
    }

    /**
     * @param inputLangCode the input Language Code that we need to check
     * @param locale passed in from the .jsp page
     * @return the validated Language Code
     */
    public static String checkLangCode(final String inputLangCode, final Locale locale)
    {
        String result = "en";
        if(inputLangCode == null) {
            if (locale.getLanguage().equalsIgnoreCase( "zh") && locale.getCountry().equalsIgnoreCase("tw")) {
                result = "zh_TW";
            }
            else {
                result = locale.getLanguage();
            }
        }
        else {
            if ((inputLangCode.length() >= 2) && (inputLangCode.length() <= 5)) {
                result = inputLangCode;
            }
        }
        return result;
    }

}
