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
package com.tyndalehouse.step.core.data.common;

import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static java.lang.Integer.parseInt;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * This class is the way dates are represented in the databased and they should be parsed back into this
 * object on their way out!
 * 
 * The date field indicates when the event (or start of the event) took place, the precision type indicates
 * whether how much of the date can be trusted...
 * 
 * This means we can store dates such as (01/03/1900, MONTH), meaning March 1900 (and not 1st March 1900).
 * 
 * @author CJBurrell
 */
public class PartialDate {
    private static final String DATE_DELIMITER = "[ ]?-[ ]?";
    private static final int NO_PARTS = 0;
    private static final int YEAR = 1;
    private static final int YEAR_AND_MONTH = 2;
    private static final int YEAR_MONTH_AND_DAY = 3;

    /**
     * The date to be represented (whether fully accurate or not)
     */
    private final LocalDateTime localDateTime;

    /**
     * The precision specifier which tells us just quite how accurate the date is (year, month, day)
     * 
     * @see com.tyndalehouse.step.dataloader.common.PrecisionType
     */
    private final PrecisionType precision;

    /**
     * Public constructor to give us a partial date.
     * 
     * @param ldt date partial representation of a date
     * @param precision precision indicating how much of the date can be trusted day/month/year or month/year
     *            or just year
     */
    public PartialDate(final LocalDateTime ldt, final PrecisionType precision) {
        this.localDateTime = ldt;
        this.precision = precision;
    }

    /**
     * Date is specified in yy-mm-dd or yyyy-mm-dd and gets parsed in to a date. the mm and dd are optional
     * which is what determines the precision of the date.
     * 
     * @param date date to be parsed as a string
     * @return a PartialDate
     */
    public static PartialDate parseDate(final String date) {
        // check for null value
        if (date == null) {
            return new PartialDate(null, PrecisionType.NONE);
        }

        // if passed in empty, return null and be done with empty strings!
        final String trimmedDate = date.trim();
        if (isEmpty(trimmedDate)) {
            return new PartialDate(null, PrecisionType.NONE);
        }

        final boolean negativeDate = date.charAt(0) == '-';
        final String parseableDate = negativeDate ? trimmedDate.substring(1) : trimmedDate;

        return getPartialDateFromArray(split(parseableDate.trim(), DATE_DELIMITER), negativeDate);
    }

    /**
     * Depending on the number of parts, it creates a Partial date with year/month/day resolution
     * 
     * @param parts the array of parts each representing part of the date
     * @param negativeDate true if the date is BC
     * @return the newly created PartialDate
     */
    private static PartialDate getPartialDateFromArray(final String[] parts, final boolean negativeDate) {
        final LocalDateTime translatedTime;
        PrecisionType p;
        final int multiplier = negativeDate ? -1 : 1;

        try {
            // length of field determines how much of the date has been specified
            switch (parts.length) {
                case NO_PARTS:
                    throw new StepInternalException("There weren't enough parts to this date");
                case YEAR:
                    // only the year is specified, so use 1st of Jan Year
                    translatedTime = new LocalDateTime(multiplier * parseInt(parts[0]), 1, 1, 0, 0);
                    p = PrecisionType.YEAR;
                    break;
                case YEAR_AND_MONTH:
                    translatedTime = new LocalDateTime(multiplier * parseInt(parts[0]), parseInt(parts[1]),
                            1, 0, 0);
                    p = PrecisionType.MONTH;
                    break;
                case YEAR_MONTH_AND_DAY:
                    translatedTime = new LocalDateTime(multiplier * parseInt(parts[0]), parseInt(parts[1]),
                            parseInt(parts[2]), 0, 0);
                    p = PrecisionType.DAY;
                    break;
                default:
                    throw new StepInternalException("Too many parts to the date: ");
            }
        } catch (final NumberFormatException nfe) {
            throw new StepInternalException("Could not parse date into year, month or day.", nfe);
        }

        return new PartialDate(translatedTime, p);
    }

    /**
     * @return gets the internal date
     */
    public LocalDateTime getDate() {
        return this.localDateTime;
    }

    /**
     * @return the precision accuracy
     */
    public PrecisionType getPrecision() {
        return this.precision;
    }
}
