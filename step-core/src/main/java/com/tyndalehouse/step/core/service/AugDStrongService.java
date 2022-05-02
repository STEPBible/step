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
package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.data.EntityDoc;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.versification.Versification;

public interface AugDStrongService {

    void readAndLoad(final String csvResource);

	short cnvrtOSIS2Ordinal(final String OSIS, final Versification curVersification);

    String getAugStrongWithStrongAndOrdinal(final String strong, final int ordinal, final boolean useNRSVVersification);

    void updatePassageKeyWithAugStrong(String strong, Key reference);

    AugmentedStrongsForSearchCount getRefIndexWithStrongAndVersification(final String strong, final Versification sourceVersification);

    boolean isVerseInAugStrong(final String reference, final AugmentedStrongsForSearchCount arg, final Versification sourceVersification);

    public class AugmentedStrongsForSearchCount {
        public final int startIndex;
        public final int endIndex;
        public final boolean defaultAugStrong;
        public final boolean convertVersification;
        public short[] refArray;

        public AugmentedStrongsForSearchCount(final int startIndex, final int endIndex, final boolean defaultAugStrong,
                                              final boolean convertVersification, short[] refArray) {
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this.defaultAugStrong = defaultAugStrong;
            this.convertVersification = convertVersification;
            this.refArray = refArray;
        }
    }

}
