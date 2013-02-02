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
package com.tyndalehouse.step.tools.versions;

import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

import java.io.FileInputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.usermodel.Range;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;

/**
 * The Class ParseVersionFile.
 */
public class ParseVersionFile {
    private static final Pattern LINES = Pattern.compile("[\r\n]");
    private static final Pattern REF = Pattern.compile("^\\d?\\s*[a-zA-Z]+\\s*\\d+(:\\d+)?");
    private static final Pattern CLEAN_UP = Pattern.compile("[\\r\\n<>]+");

    public static void main(final String[] args) throws Exception {

        POIFSFileSystem fs = null;
        boolean isHidden = false;

        fs = new POIFSFileSystem(new FileInputStream(
                "C:\\Users\\Chris\\Downloads\\Gen 1-10.prepared for reviewer.doc"));
        final HWPFDocument doc = new HWPFDocument(fs);

        // System.out.println("Word Document has " + paragraphs.length + " paragraphs");
        final Range range = doc.getRange();

        boolean prefix = false;
        boolean mainText = false;
        String currentRef = null;
        StringBuilder text = new StringBuilder(256);
        StringBuilder partialLine = new StringBuilder(256);

        int count = 0;
        for (int k = 0; k < range.numParagraphs(); k++) {

            final org.apache.poi.hwpf.usermodel.Paragraph paragraph = range.getParagraph(k);

            for (int j = 0; j < paragraph.numCharacterRuns(); j++) {

                final org.apache.poi.hwpf.usermodel.CharacterRun cr = paragraph.getCharacterRun(j);

                String docText = cr.text();
                if (cr.isVanished()) {
                    if (!isHidden) {

                        // we only print out the last line of full text and of partial line...
                        final String fullText = text.toString();
                        final String[] lines = LINES.split(fullText);

                        String lastLine = lines[lines.length - 1];
                        final Matcher matcher = REF.matcher(lastLine);
                        final boolean foundRef = matcher.find();

                        if (foundRef) {
                            currentRef = matcher.group();
                            lastLine = lastLine.replaceAll(currentRef, "").trim();
                        }

                        System.out.println("===============================");
                        System.out.println("@Reference=\t" + currentRef);
                        System.out.println("@FullText=\t" + lastLine);
                        System.out.println("@MatchingText=\t" + partialLine.toString());

                        count = 0;
                        text = new StringBuilder(256);
                        partialLine = new StringBuilder(128);
                        isHidden = true;
                    }

                    if (cr.isBold()) {
                        // if we're looking at bold text, we need to output the prefix
                        if (!prefix) {
                            System.out.println(String.format("@OptionsType%d=\t%s", count,
                                    clean(text.toString())));
                            prefix = true;
                            text = new StringBuilder(256);
                        }
                    } else if (!mainText && prefix) {
                        // no longer bold, but already have a prefix
                        mainText = true;
                        System.out.println(String.format("@OptionsAlternative%d=\t%s", count,
                                clean(text.toString())));

                        text = new StringBuilder(256);

                        // deal with carriage returns differently
                        final int splitChar = hasCarriageReturn(docText);
                        if (splitChar != -1) {
                            // we've split to a new line
                            final String postfix = docText.substring(0, splitChar);
                            text.append(postfix);
                            if (isNotBlank(postfix)) {
                                final String clean = clean(text.toString());
                                if (isNotBlank(clean)) {
                                    System.out.println(String
                                            .format("@OptionsQualifier%d=\t%s", count, clean));

                                }
                            }
                            prefix = false;
                            mainText = false;
                            count++;
                            text = new StringBuilder(256);
                            docText = docText.substring(splitChar);

                        }

                    } else if (prefix && mainText) {
                        // have a prefix and a main text, and we're not bold, then we're either the
                        // postfix or prefix of the next entry
                        final int splitChar = hasCarriageReturn(docText);
                        if (splitChar != -1) {
                            // we've split to a new line
                            final String postfix = docText.substring(0, splitChar);
                            text.append(postfix);
                            if (isNotBlank(postfix)) {
                                final String clean = clean(text.toString());
                                if (isNotBlank(clean)) {
                                    System.out.println(String
                                            .format("@OptionsQualifier%d=\t%s", count, clean));
                                }
                            }

                            prefix = false;
                            mainText = false;
                            count++;
                            text = new StringBuilder(256);
                            docText = docText.substring(splitChar);
                        }
                    } else {
                        // deal with carriage returns differently
                        final int splitChar = hasCarriageReturn(docText);
                        if (splitChar != -1) {
                            // we've split to a new line
                            final String postfix = docText.substring(0, splitChar);
                            text.append(postfix);
                            if (isNotBlank(postfix)) {
                                final String clean = clean(text.toString());
                                if (isNotBlank(clean)) {
                                    System.out.println(String
                                            .format("@OptionsQualifier%d=\t%s", count, clean));

                                }
                            }
                            prefix = false;
                            mainText = false;
                            count++;
                            text = new StringBuilder(256);
                            docText = docText.substring(splitChar);
                        }
                    }
                    text.append(docText);
                } else {

                    if (isHidden) {

                        text = new StringBuilder(256);
                        prefix = false;
                        mainText = false;
                        isHidden = false;
                    }

                    if (cr.getUnderlineCode() != 0) {
                        partialLine.append(docText);
                    }
                    text.append(docText);
                }
            }
        }
    }

    private static int hasCarriageReturn(final String docText) {
        return Math.max(docText.indexOf('\n'), docText.indexOf('\r'));
    }

    private static String clean(final String prefix) {
        return CLEAN_UP.matcher(prefix).replaceAll("");
    }
}
