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
package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.ResourceBundle;

import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.rest.framework.FrontController;
import com.tyndalehouse.step.rest.framework.JsonResourceBundle;

/**
 * Serves the images by downloading them from a remote source if they do not already exist.
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class InternationalJsonController extends HttpServlet {
    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 1721159652548642069L;
    private static final Map<Locale, String> BUNDLES = new HashMap<Locale, String>();

    @Override
    protected void doGet(final HttpServletRequest req, final HttpServletResponse response)
            throws ServletException, IOException {

        final Locale locale;

        final String langParameter = req.getParameter("lang");
        if (isNotBlank(langParameter)) {
            locale = new Locale(langParameter);
        } else {
            locale = req.getLocale();
        }
        String qualifiedResponse = BUNDLES.get(locale);
        if (qualifiedResponse == null) {
            qualifiedResponse = readBundle(locale);
            BUNDLES.put(locale, qualifiedResponse);
        }

        response.setCharacterEncoding(FrontController.UTF_8_ENCODING);
        response.setLocale(locale);
        response.setContentType("application/json");
        response.getOutputStream().write(qualifiedResponse.getBytes(FrontController.UTF_8_ENCODING));
        response.flushBuffer();
        response.getOutputStream().close();
    }

    /**
     * Read bundle.
     * 
     * @param locale the locale
     * @return the string
     */
    private String readBundle(final Locale locale) {
        final ResourceBundle bundle = ResourceBundle.getBundle("InteractiveBundle", locale);

        final JsonResourceBundle jsonResourceBundle = new JsonResourceBundle(bundle);
        final ObjectMapper mapper = new ObjectMapper();
        String jsonResponse;

        try {
            jsonResponse = mapper.writeValueAsString(jsonResourceBundle);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to read messages", e);
        }

        return "var __s = " + jsonResponse;
    }
}
