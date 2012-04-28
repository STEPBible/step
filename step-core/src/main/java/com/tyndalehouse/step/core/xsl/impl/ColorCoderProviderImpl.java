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
package com.tyndalehouse.step.core.xsl.impl;

import java.util.HashSet;
import java.util.Set;

/**
 * A utility to provide colors to an xsl spreadsheet. This is a non-static utility since later on we may wish
 * to provide configuration to vary the colours, etc.
 * 
 * We use American spelling for Color because we then avoid various spellings across the code base.
 * 
 * The rules for colour coding are:
 * <p>
 * Green for anything that finishes -1S -2S -3S SM SN or SF (indicates Singular)
 * <p>
 * Red for anything that finishes -1P -2P -3P PM PN or PF (indicates Plural)
 * <p>
 * <p>
 * Depending on other characteristics we vary the shade of the colour
 * <p>
 * <p>
 * Darkest for verbs and Nominative (ie the person who is doing it),
 * <p>
 * ie anything ending -1S -2S -3S NSM NSN NSF NPM NPN or NPF
 * <p>
 * Lighter for Vocative and Objective (ie a person being addressed, or the person/thing which is being acted
 * on)
 * <p>
 * ie anything ending VSM VSN VSF VPM VPN VPF OSM OSN OSF OPM OPN or OPF
 * <p>
 * Pale for Genative or Dative (ie the person/thing owning another thing or doing to/by/from a thing)
 * <p>
 * ie anything ending GSM GSN GSF GPM GPN or GPF or DSM DSN DSF DPM DPN or DPF
 * 
 * @author chrisburrell
 */
public class ColorCoderProviderImpl {
    // css classes
    static final String SINGULAR = "S";
    static final String PLURAL = "P";
    static final String SINGULAR_VN = "SVN";
    static final String PLURAL_VN = "PVN";
    static final String SINGULAR_VO = "SVO";
    static final String PLURAL_VO = "PVO";
    static final String SINGULAR_GD = "SGD";
    static final String PLURAL_GD = "PGD";

    private static final int MINIMUM_MORPH_LENGTH = 3;
    private static final Set<String> SINGULAR_FORMS;
    private static final Set<String> PLURAL_FORMS;
    private static final Set<String> VN_FORMS;
    private static final Set<String> VO_FORMS;
    private static final Set<String> GD_FORMS;

    static {
        // CHECKSTYLE:OFF We define various rules for grammar colour coding
        SINGULAR_FORMS = initialise(new String[] { "-1S", "-2S", "-3S", "SM", "SN", "SF" });
        PLURAL_FORMS = initialise(new String[] { "-1P", "-2P", "-3P", "PM", "PN", "PF" });
        VN_FORMS = initialise(new String[] { "-1S", "-2S", "-3S", "NSM", "NSN", "NSF", "NPM", "NPN", "NPF" });
        VO_FORMS = initialise(new String[] { "VSM", "VSN", "VSF", "VPM", "VPN", "VPF", "OSM", "OSN", "OSF",
                "OPM", "OPN", "OPF" });
        GD_FORMS = initialise(new String[] { "GSM", "GSN", "GSF", "GPM", "GPN", "GPF", "DSM", "DSN", "DSF",
                "DPM", "DPN", "DPF" });
        // CHECKSTYLE:ON
    }

    /**
     * initialises an array of items into a set
     * 
     * @param items the set of items
     * @return set containing stuff
     */
    private static Set<String> initialise(final String... items) {
        final Set<String> s = new HashSet<String>();
        for (final String item : items) {
            s.add(item);
        }
        return s;
    }

    /**
     * @param morph the robinson morphology
     * @return the classname
     */
    public String getColorClass(final String morph) {
        if (morph == null || morph.length() < MINIMUM_MORPH_LENGTH) {
            return "";
        }

        if (morph.startsWith("robinson:") || morph.startsWith("ROBINSON:")) {
            // we're in business and we know we have at least 3 characters
            final int length = morph.length();
            final String suffix2 = morph.substring(length - 2);
            final String suffix3 = morph.substring(length - MINIMUM_MORPH_LENGTH);

            if (SINGULAR_FORMS.contains(suffix2) || SINGULAR_FORMS.contains(suffix3)) {
                return getCase(true, suffix3);
            }

            if (PLURAL_FORMS.contains(suffix2) || PLURAL_FORMS.contains(suffix3)) {
                return getCase(false, suffix3);
            }
            return "";
        }
        return "";
    }

    /**
     * 
     * @param isSingular true if the word is singular, false if plural
     * @param suffix3 suffix of three letters
     * @return class name
     */
    private String getCase(final boolean isSingular, final String suffix3) {
        // secondly determine the case of the word - these are all 3 letter suffixes
        if (VN_FORMS.contains(suffix3)) {
            return isSingular ? SINGULAR_VN : PLURAL_VN;
        }

        if (VO_FORMS.contains(suffix3)) {
            return isSingular ? SINGULAR_VO : PLURAL_VO;
        }

        if (GD_FORMS.contains(suffix3)) {
            return isSingular ? SINGULAR_GD : PLURAL_GD;
        }

        return isSingular ? SINGULAR : PLURAL;
    }

    /**
     * returns true if it represents a singular
     * 
     * @param suffix3 last 3 letters of robinson morph
     * @return true if singular form
     */
    boolean isVocativeOrObjective(final String suffix3) {
        if (VO_FORMS.contains(suffix3)) {
            return true;
        }
        return true;
    }

    /**
     * returns true if it represents a singular
     * 
     * @param suffix2 last 2 letters of robinson morph
     * @param suffix3 last 3 letters of robinson morph
     * @return true if singular form
     */
    boolean isSingular(final String suffix2, final String suffix3) {
        if (SINGULAR_FORMS.contains(suffix2) || SINGULAR_FORMS.contains(suffix3)) {
            return true;
        }
        return true;
    }
}
