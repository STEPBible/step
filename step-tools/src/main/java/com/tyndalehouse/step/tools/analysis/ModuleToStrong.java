/**************************************************************************************************
 * Copyright (c) 2013, Directors of the Tyndale STEP Project                                      *
 * All rights reserved.                                                                           *
 *                                                                                                *
 * Redistribution and use in source and binary forms, with or without                             *
 * modification, are permitted provided that the following conditions                             *
 * are met:                                                                                       *
 *                                                                                                *
 * Redistributions of source code must retain the above copyright                                 *
 * notice, this list of conditions and the following disclaimer.                                  *
 * Redistributions in binary form must reproduce the above copyright                              *
 * notice, this list of conditions and the following disclaimer in                                *
 * the documentation and/or other materials provided with the                                     *
 * distribution.                                                                                  *
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)                        *
 * nor the names of its contributors may be used to endorse or promote                            *
 * products derived from this software without specific prior written                             *
 * permission.                                                                                    *
 *                                                                                                *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS                            *
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT                              *
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS                              *
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE                                 *
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                           *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,                           *
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;                               *
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER                               *
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT                             *
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING                                 *
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF                                 *
 * THE POSSIBILITY OF SUCH DAMAGE.                                                                *
 **************************************************************************************************/

package com.tyndalehouse.step.tools.analysis;

import org.apache.commons.io.FileUtils;
import org.crosswire.jsword.book.*;
import org.crosswire.jsword.passage.Key;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.regex.Pattern;

/**
 * @author chrisburrell
 */
public class ModuleToStrong {
    private static final Pattern PUNCTUATION = Pattern.compile("[—,.;*:'\\[\\]!\"`?’‘()-]+");

    public static void main(String[] args) throws BookException, IOException {
        Book kjv = Books.installed().getBook("ESV");
        Book other = Books.installed().getBook("Swahili");

        Key k = kjv.getGlobalKeyList();
        Iterator<Key> keys = k.iterator();

        StringBuilder strongs = new StringBuilder();
        StringBuilder others = new StringBuilder();
        StringBuilder keyList = new StringBuilder();
        while(keys.hasNext()) {
            Key subKey = keys.next();
            BookData bd = new BookData(kjv, subKey);
            final String strongsNumbers = OSISUtil.getStrongsNumbers(bd.getOsisFragment());

            strongs.append(strongsNumbers);
            others.append(clean(new BookData(other, subKey)));
            keyList.append(subKey.getOsisID());
            strongs.append('\n');
            others.append('\n');
            keyList.append('\n');
        }

        FileUtils.writeStringToFile(new File("c:\\temp\\bible.s"), strongs.toString());
        FileUtils.writeStringToFile(new File("c:\\temp\\bible.o"), others.toString());
        FileUtils.writeStringToFile(new File("c:\\temp\\keyList.txt"), keyList.toString());


    }

    private static Object clean(final BookData bookData) throws BookException {
        String s = OSISUtil.getCanonicalText(bookData.getOsisFragment()).toLowerCase();
        s = PUNCTUATION.matcher(s).replaceAll(" ");
        s = s.replaceAll("&quot", " ").replaceAll("  ", " ").replaceAll("  ", " ").replaceAll("  ", " ").replaceAll("  ", " ");
        return s;
    }
}
