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

import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.tyndalehouse.step.core.models.KeyWrapper;
import com.tyndalehouse.step.core.models.OsisWrapper;
import com.tyndalehouse.step.core.models.stats.ScopeType;
import com.tyndalehouse.step.core.models.stats.StatType;
import com.tyndalehouse.step.core.models.stats.CombinedPassageStats;
import com.tyndalehouse.step.core.service.AnalysisService;
import com.tyndalehouse.step.core.service.BibleInformationService;
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
 */
// CHECKSTYLE:OFF
public class WebStepRequest {
    private static final Logger LOG = LoggerFactory.getLogger(WebStepRequest.class);
    private static final String REF_0_PARAM = "reference";
    private static final String VERSION_0_PARAM = "version";
    public static final int RECOMMENDED_TITLE_LENGTH = 70;
    private static UiDefaults defaults;
    private final HttpServletRequest request;
    private final AnalysisService analysis;
    private final Injector injector;
    private final String reference;
    private final String version;
    private final OsisWrapper osisWrapper;
    private KeyWrapper nextChapter;
    private KeyWrapper previousChapter;
    private CombinedPassageStats stats;
    private final BibleInformationService bible;
    private String description;

    /**
     * wraps around the servlet request for easy access
     *
     * @param request  the servlet request
     * @param injector the injector for the application
     */
    public WebStepRequest(final Injector injector, final HttpServletRequest request) {
        final Object passage = request.getAttribute("passage");
        if(passage instanceof OsisWrapper) {
            this.osisWrapper = (OsisWrapper) passage;
        } else {
            this.osisWrapper = null;
        }
    
        if(osisWrapper == null) {
            final UiDefaults defaults = getDefaults(injector);
            this.reference = defaults.getDefaultReference1();
            this.version = defaults.getDefaultVersion1();
        } else {
            this.reference = osisWrapper.getReference();
            this.version = osisWrapper.getMasterVersion();
        }
        
        this.bible = injector.getInstance(BibleInformationService.class);
        this.injector = injector;
        this.request = request;
        this.analysis = injector.getInstance(AnalysisService.class);
        try {
            this.description =  ""; 
            stats = this.analysis.getStatsForPassage(this.version, this.reference, StatType.TEXT, ScopeType.PASSAGE, false, "en", true);
        } catch (Exception ex) {
            LOG.error(ex.getMessage(), ex);
            this.description = "";
        }
    }

    /**
     * Lazily obtain the defaults, only once
     * @param injector the guice injector
     * @return the default values
     */
    private static UiDefaults getDefaults(final Injector injector) {
        if (defaults == null) {
            defaults = injector.getInstance(UiDefaults.class);
        }
        return defaults;
    }


    /**
     * Initialises the state of the web request, with either the request parameter, the cookie, or the
     * failsafe-default value
     *
     * @param servletRequest   the request object
     * @param requestParamName the name of the request parameter in the url
     * @param failsafeValue    the default value
     */
    private static String init(final HttpServletRequest servletRequest, final String requestParamName, final String failsafeValue) {
        final String passageReference = servletRequest.getParameter(requestParamName);
        if (!isEmpty(passageReference)) {
            return passageReference;
        } else {
            return failsafeValue;
        }
    }

    /**
     * @return the reference for passage id 0
     */
    public String getThisReference() {
        return this.reference;
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
        return this.reference;
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
            return getNextChapter().getOsisKeyId();
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
            return getNextChapter().getName();
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }


    /**
     * @return the key wrapper representing the previous chapter
     */
    private KeyWrapper getNextChapter() {
        if (this.nextChapter == null) {
            this.nextChapter = this.bible.getSiblingChapter(this.reference, this.version, false);
        }
        return this.nextChapter;
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
            return getPreviousChapter().getOsisKeyId();
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
            return getPreviousChapter().getName();
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }

    /**
     * @return the keywrapper for the correct passage
     */
    private KeyWrapper getPreviousChapter() {
        if (this.previousChapter == null) {
            this.previousChapter = this.bible.getSiblingChapter(this.reference, this.version, true);
        }
        return this.previousChapter;
    }

    /**
     * We will never be displaying other than 0 to people without javascript
     *
     * @return the version for passage id 0
     */
    public String getThisVersion() {
        return this.version;
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
        return this.version;
    }

    public String getTitle() {
        try {
            //shareable parameter
            if ("true".equals(this.request.getParameter("sh"))) {
                return "STEP | Scripture Tools for Every Person";
            }

            String keyName = this.osisWrapper != null ? this.osisWrapper.getReference() + " | " : "";

            final String currentTitle = keyName + this.getThisVersion() + " | STEP | ";
            int currentLength = currentTitle.length();
            String shortDescription = "";
            if (currentLength < 70 && this.description.length() > 0) {
                int leftOverLength = RECOMMENDED_TITLE_LENGTH - currentLength;
                if (leftOverLength > 0) {
                    int lastSpace = this.description.lastIndexOf(' ', leftOverLength);
                    if (lastSpace != -1) {
                        shortDescription = this.description.substring(0, lastSpace);
                    }
                }
            }
            return currentTitle + shortDescription;
        } catch (final Exception e) {
            LOG.debug(e.getMessage(), e);
            return "";
        }
    }

    /**
     * @return the list of keywords
     */
    public String getKeywords() {
        if (stats == null) {
            return "";
        }

        Map<String, Integer[]> passageStats = stats.getPassageStat().getStats();
        int max = 0;
        TreeMap<Integer, List<String>> orderedStats = new TreeMap<Integer, List<String>>(new Comparator<Integer>() {

            @Override
            public int compare(final Integer o1, final Integer o2) {
                return o2.compareTo(o1);
            }
        });

        for (Map.Entry<String, Integer[]> stat : passageStats.entrySet()) {
            Integer curValue = stat.getValue()[0];
            List<String> words = orderedStats.get(curValue);
            if (words == null) {
                words = new ArrayList<String>();
                orderedStats.put(curValue, words);
            }
            words.add(stat.getKey());
        }

        StringBuilder keywords = new StringBuilder(128);
        for (List<String> value : orderedStats.values()) {
            for (String word : value) {
                keywords.append(word);
                keywords.append(' ');

                if (keywords.length() > 150) {
                    return keywords.toString();
                }
            }
        }
        return "";
    }

    /**
     * @return the description of the page
     */
    public String getDescription() {
        return description;
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
}
