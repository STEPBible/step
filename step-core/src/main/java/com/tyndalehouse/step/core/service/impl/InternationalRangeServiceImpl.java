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
package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.models.BookName;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.InternationalRangeService;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.regex.Pattern;

/**
 * Looks up the app.bibleRanges property, and returns internationalised versions of the range name and range key, in the
 * form of a BookName
 *
 * @author CJBurrell
 */
@Singleton
public class InternationalRangeServiceImpl implements InternationalRangeService {
    private static final String RANGE_SUFFIX = "_range";
    private static final Logger LOGGER = LoggerFactory.getLogger(InternationalRangeServiceImpl.class);
    //stores the lang key for every list of book names
    private static final Map<Locale, List<BookName>> BOOK_NAMES = new HashMap<Locale, List<BookName>>(32);
    private final String[] ranges;
    private final Provider<ClientSession> clientSessionProvider;

    /**
     * The bible information service, retrieving content and meta data.
     */
    @Inject
    public InternationalRangeServiceImpl(@Named("app.bibleRanges") String rangeLanguages,
                                         Provider<ClientSession> clientSessionProvider) {
        this.clientSessionProvider = clientSessionProvider;
        this.ranges = StringUtils.split(rangeLanguages, ",");
    }

    @Override
    public List<BookName> getRanges(String filter, boolean exact) {
        final List<BookName> filteredBooks = new ArrayList<BookName>(1);
        try {
            if (StringUtils.isBlank(filter)) {
                return new ArrayList<BookName>(0);
            }

            final List<BookName> books = getBooks();
            if (exact) {
                for (BookName bookName : books) {
                    if (filter.equalsIgnoreCase(bookName.getFullName()))
                        filteredBooks.add(bookName);
                }
            } else {
                Pattern p = Pattern.compile("\\b" + filter, Pattern.CASE_INSENSITIVE);
                for (BookName bookName : books) {
                    if (p.matcher(bookName.getFullName()).find()) {
                        filteredBooks.add(addRangeAsBookName(bookName.getFullName()));
                    }
                }
            }
        } catch (Exception ex) {
            LOGGER.error("Ranges unavailable in locale: {}", this.clientSessionProvider.get().getLocale());
        }
        return filteredBooks;
    }

    private BookName addRangeAsBookName(final String s) {
        return new BookName(s, s, BookName.Section.BIBLE_SECTION, false, null, true);
    }

    public List<BookName> getBooks() {
        final Locale userLocale = clientSessionProvider.get().getLocale();
        List<BookName> bookNames = BOOK_NAMES.get(userLocale);
        if (bookNames == null) {
            bookNames = new ArrayList<BookName>();
            synchronized (BOOK_NAMES) {
                ResourceBundle bundle = ResourceBundle.getBundle("InteractiveBundle", userLocale);
                for (final String s : this.ranges) {
                    bookNames.add(new BookName(bundle.getString(s + RANGE_SUFFIX), bundle.getString(s), BookName.Section.BIBLE_SECTION, false));
                }
            }

            BOOK_NAMES.put(userLocale, bookNames);
        }

        return bookNames;
    }
}
