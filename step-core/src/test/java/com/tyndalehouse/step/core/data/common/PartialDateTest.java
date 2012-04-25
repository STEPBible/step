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

import static org.junit.Assert.assertEquals;

import java.util.GregorianCalendar;

import org.junit.Test;

import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Checks different types of parsing functionality for parsing dates
 * 
 * @author Chris
 * 
 */
public class PartialDateTest {
    /** tests null dates */
    @Test
    public void testParsingNullDate() {
        final PartialDate pd = PartialDate.parseDate(null);
        assertEquals(pd.getDate(), null);
        assertEquals(pd.getPrecision(), PrecisionType.NONE);
    }

    /** tests blank dates */
    @Test
    public void testBlankDate() {
        final PartialDate pd = PartialDate.parseDate("  ");
        assertEquals(pd.getDate(), null);
        assertEquals(pd.getPrecision(), PrecisionType.NONE);
    }

    /** tests year AD */
    @Test
    public void testYearAD() {
        final PartialDate pd = PartialDate.parseDate("1");
        assertEquals(pd.getDate().getYear(), 1);
        assertEquals(pd.getDate().getEra(), GregorianCalendar.AD);
        assertEquals(pd.getPrecision(), PrecisionType.YEAR);
    }

    /** tests year AD */
    @Test
    public void testYearBC() {
        final PartialDate pd = PartialDate.parseDate("-1");
        assertEquals(pd.getDate().getYear(), -1);
        assertEquals(pd.getDate().getEra(), GregorianCalendar.BC);
        assertEquals(pd.getPrecision(), PrecisionType.YEAR);
    }

    /** tests year AD */
    @Test
    public void testYearMonthBC() {
        final PartialDate pd = PartialDate.parseDate("-3-7");
        assertEquals(pd.getDate().getYear(), -3);
        assertEquals(pd.getDate().getMonthOfYear(), 7);
        assertEquals(pd.getDate().getEra(), GregorianCalendar.BC);
        assertEquals(pd.getPrecision(), PrecisionType.MONTH);
    }

    /** tests year AD */
    @Test
    public void testYearMonthDay() {
        final PartialDate pd = PartialDate.parseDate("3-07-25");
        assertEquals(pd.getDate().getYear(), 3);
        assertEquals(pd.getDate().getMonthOfYear(), 7);
        assertEquals(pd.getDate().getDayOfMonth(), 25);

        assertEquals(pd.getDate().getEra(), GregorianCalendar.AD);
        assertEquals(pd.getPrecision(), PrecisionType.DAY);
    }

    /**
     * tests an invalid short date
     */
    @Test(expected = StepInternalException.class)
    public void testNoParts() {
        PartialDate.parseDate("-");
    }

    /**
     * tests an invalid long date
     */
    @Test(expected = StepInternalException.class)
    public void testTooManyParts() {
        PartialDate.parseDate("1-1-1-1-1");
    }

    /**
     * tests an invalid date with alpha characters
     */
    @Test(expected = StepInternalException.class)
    public void testAlphaChars() {
        PartialDate.parseDate("1-a-2");
    }
}
