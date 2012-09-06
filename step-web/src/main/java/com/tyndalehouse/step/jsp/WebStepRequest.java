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
package com.tyndalehouse.step.jsp;

import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.models.UiDefaults;
import com.tyndalehouse.step.rest.controllers.BibleController;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page
 * 
 * @author chrisburrell
 * 
 */
// CHECKSTYLE:OFF
public class WebStepRequest {
    private static final String REF_0_PARAM = "reference";
    private static final String REF_1_PARAM = "reference-1";
    private static final String VERSION_0_PARAM = "version";
    private static final String VERSION_1_PARAM = "version-1";
    private static final Logger LOG = LoggerFactory.getLogger(WebStepRequest.class);
    private static final String CURRENT_REFERENCE_0 = "step.passage.0.reference";
    private static final String CURRENT_REFERENCE_1 = "step.passage.1.reference";
    private static final String CURRENT_VERSION_0 = "step.passage.0.version";
    private static final String CURRENT_VERSION_1 = "step.passage.1.version";
    private final HttpServletRequest request;
    private Map<String, String> cookieMap;
    private final Injector injector;
    private final List<String> references;
    private final List<String> versions;
    private final UiDefaults defaults;

    /**
     * wraps around the servlet request for easy access
     * 
     * @param request the servlet request
     * @param injector the injector for the application
     */
    public WebStepRequest(final Injector injector, final HttpServletRequest request) {
        this.injector = injector;
        this.request = request;
        this.defaults = injector.getInstance(UiDefaults.class);

        this.references = new ArrayList<String>();
        this.versions = new ArrayList<String>();

        init(request, this.references, REF_0_PARAM, CURRENT_REFERENCE_0, this.defaults.getDefaultReference1());
        init(request, this.references, REF_1_PARAM, CURRENT_REFERENCE_1, this.defaults.getDefaultReference2());

        init(request, this.versions, VERSION_0_PARAM, CURRENT_VERSION_0, this.defaults.getDefaultVersion1());
        init(request, this.versions, VERSION_1_PARAM, CURRENT_VERSION_1, this.defaults.getDefaultVersion2());
    }

    /**
     * Initialises the state of the web request, with either the request parameter, the cookie, or the
     * failsafe-default value
     * 
     * @param servletRequest the request object
     * @param store the store in which to store the value we are calcualting
     * @param requestParamName the name of the request parameter in the url
     * @param cookieName the name of the cookie key
     * @param failsafeValue the default value
     */
    private void init(final HttpServletRequest servletRequest, final List<String> store,
            final String requestParamName, final String cookieName, final String failsafeValue) {
        final String passageReference = servletRequest.getParameter(requestParamName);
        if (!isEmpty(passageReference)) {
            store.add(passageReference);
        } else {
            final String cookieValue = getCookieValue(cookieName);
            if (!isEmpty(cookieValue)) {
                store.add(cookieValue);
            } else {
                store.add(failsafeValue);
            }
        }
    }

    /**
     * returns the reference of interest
     * 
     * @param passageId the passage column to look up
     * @return the reference
     */
    public String getReference(final int passageId) {
        try {
            return this.references.get(passageId);
        } catch (final Exception e) {
            return "";
        }
    }

    /**
     * @param passageId the passageId of interest
     * @return the next reference
     */
    public String getNextReference(final int passageId) {
        try {
            return this.injector.getInstance(BibleController.class)
                    .getNextChapter(getReference(passageId), getVersion(0)).getOsisKeyId();
        } catch (final Exception e) {
            return "";
        }
    }

    /**
     * @param passageId the passageId of interest
     * @return the previous reference
     */
    public String getPreviousReference(final int passageId) {
        try {
            return this.injector.getInstance(BibleController.class)
                    .getPreviousChapter(getReference(passageId), getVersion(0)).getOsisKeyId();
        } catch (final Exception e) {
            return "";
        }
    }

    /**
     * returns the version of interest
     * 
     * @param passageId the passage column to look up
     * @return the reference
     */
    public String getVersion(final int passageId) {
        try {
            return this.versions.get(passageId);
        } catch (final Exception e) {
            return "";
        }
    }

    /**
     * gets the passage for the page load
     * 
     * @param passageId the passage id
     * @return the html to put into the page
     */
    public String getPassage(final int passageId) {
        final String reference = getReference(passageId);
        final String version = getVersion(passageId);

        try {
            return this.injector.getInstance(BibleController.class)
                    .getBibleText(version, reference, "VERSE_NUMBERS,NOTES").getValue();
        } catch (final StepInternalException e) {
            // silently ignore and log as debug
            LOG.trace("Unable to restore state", e);
            return "";
        } catch (final Exception e) {
            return "";
        }
    }

    /**
     * returns the value of the cookie
     * 
     * @param cookieName the key to the cookies from the page
     * @return the value requested
     */
    private String getCookieValue(final String cookieName) {
        if (this.cookieMap == null) {
            this.cookieMap = new HashMap<String, String>();

            final Cookie[] cookies = this.request.getCookies();
            if (cookies != null) {
                for (final Cookie c : cookies) {
                    this.cookieMap.put(c.getName(), c.getValue());
                }
            }
        }

        try {
            String v = this.cookieMap.get(cookieName);
            if (isEmpty(v)) {
                return null;
            } else {
                v = URLDecoder.decode(v, "UTF-8");
            }

            return v;
        } catch (final UnsupportedEncodingException e) {
            throw new StepInternalException("An error occured while trying to parse the request", e);
        }
    }
}
