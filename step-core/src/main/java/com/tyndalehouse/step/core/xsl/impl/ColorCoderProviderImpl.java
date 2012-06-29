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

import static java.util.regex.Pattern.compile;

import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
 * 
 * @author chrisburrell
 */
public class ColorCoderProviderImpl {
    static final Pattern FEMININE_FORM = compile("SF|PF");
    static final Pattern MASCULINE_FORM = compile("SM|PM");
    static final Pattern SINGULAR_FORM = compile("S[MFN]$|S[MFN]-[A-Z]|[123]S|[CDFIKPQRSTX]-[123][A-Z]S");
    static final Pattern PLURAL_FORM = compile("P[MFN]$|P[MFN]-[A-Z]|[123]P|[CDFIKPQRSTX]-[123][A-Z]P");

    private static final Logger LOGGER = LoggerFactory.getLogger(ColorCoderProviderImpl.class);
    private static final String ROBINSON_PREFIX_LC = "robinson:";
    private static final String ROBINSON_PREFIX_UC = "ROBINSON:";
    private static final int MINIMUM_MORPH_LENGTH = ROBINSON_PREFIX_UC.length() + 2;

    // css classes
    private static final String NEITHER_PLURAL_NOR_SINGULAR = "";
    private static final String PLURAL_NEUTER = "plur neut";
    private static final String PLURAL_MASCULINE = "plur mas";
    private static final String PLURAL_FEMININE = "plur fem";
    private static final String SINGULAR_NEUTER = "sing neut";
    private static final String SINGULAR_MASCULINE = "sing mas";
    private static final String SINGULAR_FEMININE = "sing fem";

    /**
     * @param morph the robinson morphology
     * @return the classname
     */
    // TODO this doesn't work for multiple morphs - rework for colours? share a cache system...
    public String getColorClass(final String morph) {
        if (morph == null || morph.length() < MINIMUM_MORPH_LENGTH) {
            return "";
        }

        if (morph.startsWith(ROBINSON_PREFIX_LC) || morph.startsWith(ROBINSON_PREFIX_UC)) {
            // we're in business and we know we have at least 3 characters
            LOGGER.debug("Identifying grammar for [{}]", morph);

            // null - none, false = singular, true = plural
            Boolean plural = null;
            if (isSingular(morph)) {
                plural = Boolean.FALSE;
            } else if (isPlural(morph)) {
                plural = Boolean.TRUE;
            }

            // null - none, false = feminine, true = masculine
            Boolean masculine = null;
            if (isFeminine(morph)) {
                masculine = Boolean.FALSE;
            } else if (isMasculine(morph)) {
                masculine = Boolean.TRUE;
            }
            return getCssColor(plural, masculine);
        }
        return "";
    }

    /**
     * calculates the relevant css color
     * 
     * @param plural true if plural, false if singular, null otherwise
     * @param masculine true if masculine, false if feminine, null otherwise
     * @return the calculated css color
     */
    private String getCssColor(final Boolean plural, final Boolean masculine) {
        if (plural == null) {
            // neither singular, nor plural, so return normal black, not bold
            return NEITHER_PLURAL_NOR_SINGULAR;
        } else if (plural.booleanValue()) {
            // plural
            return masculine == null ? PLURAL_NEUTER : masculine.booleanValue() ? PLURAL_MASCULINE
                    : PLURAL_FEMININE;
        }

        // else singular
        return masculine == null ? SINGULAR_NEUTER : masculine.booleanValue() ? SINGULAR_MASCULINE
                : SINGULAR_FEMININE;
    }

    /**
     * @param morph the string to test
     * @return true if masculine
     */
    boolean isMasculine(final String morph) {
        return MASCULINE_FORM.matcher(morph).find(ROBINSON_PREFIX_UC.length());
    }

    /**
     * @param morph the string to test
     * @return true if feminine
     */
    boolean isFeminine(final String morph) {
        return FEMININE_FORM.matcher(morph).find(ROBINSON_PREFIX_UC.length());
    }

    /**
     * @param morph the string to test
     * @return true if plural
     */
    boolean isPlural(final String morph) {
        return PLURAL_FORM.matcher(morph).find(ROBINSON_PREFIX_UC.length());
    }

    /**
     * @param morph the string to test
     * @return true if singular
     */
    boolean isSingular(final String morph) {
        return SINGULAR_FORM.matcher(morph).find(ROBINSON_PREFIX_UC.length());
    }
}
