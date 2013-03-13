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
package com.tyndalehouse.step.core.service.jsword.impl;

import static com.tyndalehouse.step.core.utils.StringUtils.split;

import javax.inject.Inject;

import com.tyndalehouse.step.core.utils.StringConversionUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookData;
import org.crosswire.jsword.book.BookException;
import org.crosswire.jsword.book.OSISUtil;
import org.crosswire.jsword.passage.NoSuchKeyException;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.stats.CombinedPassageStats;
import com.tyndalehouse.step.core.models.stats.PassageStat;
import com.tyndalehouse.step.core.service.jsword.JSwordAnalysisService;

/**
 * The Class JSwordAnalysisServiceImpl.
 * 
 * @author chrisburrell
 */
public class JSwordAnalysisServiceImpl implements JSwordAnalysisService {
    static final String WORD_SPLIT = "[,./<>?!;:'\\[\\]\\{\\}!\"\\-\u2013 ]+";
    private static final String STRONG_VERSION = "KJV";
    private final JSwordVersificationServiceImpl versification;

    /**
     * Instantiates a new jsword analysis service impl.
     * 
     * @param versification the versification
     */
    @Inject
    public JSwordAnalysisServiceImpl(final JSwordVersificationServiceImpl versification) {
        this.versification = versification;
    }

    @Override
    public CombinedPassageStats getStatsForPassage(final String version, final String reference) {
        final CombinedPassageStats stats = new CombinedPassageStats();
        stats.setWordStat(getWordStats(version, reference));
        stats.setStrongsStat(getStrongStats(reference));
        return stats;
    }

    /**
     * Strong stats, counts by strong number.
     * 
     * @param reference the reference
     * @return the passage stat
     */
    private PassageStat getStrongStats(final String reference) {
        try {
            final Book bookFromVersion = this.versification.getBookFromVersion(STRONG_VERSION);
            final BookData data = new BookData(bookFromVersion, bookFromVersion.getKey(reference));

            final String strongsNumbers = OSISUtil.getStrongsNumbers(data.getOsisFragment());
            return getStatsFromStrongArray(split(strongsNumbers));

        } catch (final BookException e) {
            throw new StepInternalException("Unable to read passage text", e);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Unable to read passage text", e);
        }
    }

    /**
     * Gets the word stats.
     * 
     * @param version the version
     * @param reference the reference
     * @return the word stats
     */
    private PassageStat getWordStats(final String version, final String reference) {
        try {
            final Book bookFromVersion = this.versification.getBookFromVersion(version);
            final BookData data = new BookData(bookFromVersion, bookFromVersion.getKey(reference));

            final String canonicalText = OSISUtil.getCanonicalText(data.getOsisFragment());
            final String[] words = split(canonicalText, WORD_SPLIT);

            final PassageStat stat = new PassageStat();
            for (final String word : words) {
                stat.addWord(word);
            }
            return stat;

        } catch (final BookException e) {
            throw new StepInternalException("Unable to read passage text", e);
        } catch (final NoSuchKeyException e) {
            throw new StepInternalException("Unable to read passage text", e);
        }
    }

    /**
     * Gets the stats from word array, counting words one by one and using the {@link PassageStat} to do the
     * incrementing word by word
     * 
     * @param words the words
     * @return the stats from word array
     */
    private PassageStat getStatsFromStrongArray(final String[] words) {
        final PassageStat stat = new PassageStat();
        for (final String word : words) {
            stat.addWord(StringConversionUtils.getStrongPaddedKey(word));
        }
        return stat;
    }
}
