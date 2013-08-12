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

import com.tyndalehouse.step.core.models.KeyWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.models.UiDefaults;
import com.tyndalehouse.step.rest.controllers.BibleController;

/**
 * A WebCookieRequest stores information from the request and the cookie for easy use in the jsp page
 *
 * @author chrisburrell
 */
// CHECKSTYLE:OFF
public class WebStepRequest {
    private static final Logger LOG = LoggerFactory.getLogger(WebStepRequest.class);
    private static final String REF_0_PARAM = "reference";
    private static final String VERSION_0_PARAM = "version";
    private final HttpServletRequest request;
    private Map<String, String> cookieMap;
    private final Injector injector;
    private final List<String> references;
    private final List<String> versions;

    /**
     * wraps around the servlet request for easy access
     *
     * @param request  the servlet request
     * @param injector the injector for the application
     */
    public WebStepRequest(final Injector injector, final HttpServletRequest request) {
        this.injector = injector;
        this.request = request;
        final UiDefaults defaults = injector.getInstance(UiDefaults.class);

        this.references = new ArrayList<String>();
        this.versions = new ArrayList<String>();

        init(request, this.references, REF_0_PARAM, defaults.getDefaultReference1());
        init(request, this.versions, VERSION_0_PARAM, defaults.getDefaultVersion1());
    }

    /**
     * Initialises the state of the web request, with either the request parameter, the cookie, or the
     * failsafe-default value
     *
     * @param servletRequest   the request object
     * @param store            the store in which to store the value we are calcualting
     * @param requestParamName the name of the request parameter in the url
     * @param failsafeValue    the default value
     */
    private void init(final HttpServletRequest servletRequest, final List<String> store,
                      final String requestParamName, final String failsafeValue) {
        final String passageReference = servletRequest.getParameter(requestParamName);
        if (!isEmpty(passageReference)) {
            store.add(passageReference);
        } else {
            store.add(failsafeValue);
        }
    }

    /**
     * returns the reference of interest
     *
     * @param passageId the passage column to look up
     * @return the reference
     */
    public String getReference(final int passageId) {
        if (passageId > 0) {
            return "";
        }

        try {
            return this.references.get(passageId);
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }

    /**
     * @param passageId the passageId of interest
     * @return the next reference
     */
    public String getNextReference(final int passageId) {
        if (passageId > 0) {
            return "";
        }

        try {
            return getNextChapter(passageId).getOsisKeyId();
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }

    /**
     * @param passageId the passageId of interest
     * @return the next reference
     */
    public String getNextReferenceDisplay(final int passageId) {
        if (passageId > 0) {
            return "";
        }

        try {
            return getNextChapter(passageId).getName();
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }


    /**
     * @param passageId the passage id
     * @return the key wrapper representing the previous chapter
     */
    private KeyWrapper getNextChapter(final int passageId) {
        return this.injector.getInstance(BibleController.class)
                .getNextChapter(getReference(passageId), getVersion(0));
    }

    /**
     * @param passageId the passageId of interest
     * @return the previous reference
     */
    public String getPreviousReference(final int passageId) {
        if (passageId > 0) {
            return "";
        }

        try {
            return getPreviousChapter(passageId).getOsisKeyId();
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }

    /**
     * @param passageId the passage id
     * @return the string to be displayed on the screen
     */
    public String getPreviousReferenceDisplay(final int passageId) {
        if (passageId > 0) {
            return "";
        }
        try {
            return getPreviousChapter(passageId).getName();
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }

    /**
     * @param passageId the passage id
     * @return the keywrapper for the correct passage
     */
    private KeyWrapper getPreviousChapter(final int passageId) {
        return this.injector.getInstance(BibleController.class)
                .getPreviousChapter(getReference(passageId), getVersion(passageId));
    }


    /**
     * returns the version of interest
     *
     * @param passageId the passage column to look up
     * @return the reference
     */
    public String getVersion(final int passageId) {
        if (passageId > 0) {
            return "";
        }

        try {
            return this.versions.get(passageId);
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }

    public String getTitle() {
        try {
            //shareable parameter
            if ("true".equals(this.request.getParameter("sh"))) {
                return "STEP : Scripture Tools for Every Person";
            }

            final JSwordPassageServiceImpl jsword = this.injector.getInstance(JSwordPassageServiceImpl.class);
            return this.getThisVersion() + " " + this.getThisReference() + ": " +
                    jsword.getPlainText(this.getVersion(0), this.getReference(0), true).replaceAll("[<>]", "");
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
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
        if (passageId > 0) {
            return "";
        }

        final String reference = getReference(passageId);
        final String version = getVersion(passageId);

        try {
            return this.injector.getInstance(BibleController.class)
                    .getBibleText(version, reference, "N").getValue();
        } catch (final StepInternalException e) {
            // silently ignore and log as debug
            LOG.debug("Unable to restore state", e);
            return "";
        } catch (final Exception e) {
            return "";
        }
    }

    /**
     * We will never be displaying other than 0 to people without javascript
     *
     * @return the version for passage id 0
     */
    public String getThisVersion() {
        try {
            return this.versions.get(0);
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }

    }

    /**
     * @return the reference for passage id 0
     */
    public String getThisReference() {
        try {
            return this.references.get(0);
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }

    }
}
