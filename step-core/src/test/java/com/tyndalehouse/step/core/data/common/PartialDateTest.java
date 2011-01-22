package com.tyndalehouse.step.core.data.common;

import static org.junit.Assert.assertEquals;

import java.util.Calendar;
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
        assertEquals(pd.getDate().get(Calendar.YEAR), 1);
        assertEquals(pd.getDate().get(Calendar.ERA), GregorianCalendar.AD);
        assertEquals(pd.getPrecision(), PrecisionType.YEAR);
    }

    /** tests year AD */
    @Test
    public void testYearBC() {
        final PartialDate pd = PartialDate.parseDate("-1");
        assertEquals(pd.getDate().get(Calendar.YEAR), 1);
        assertEquals(pd.getDate().get(Calendar.ERA), GregorianCalendar.BC);
        assertEquals(pd.getPrecision(), PrecisionType.YEAR);
    }

    /** tests year AD */
    @Test
    public void testYearMonthBC() {
        final PartialDate pd = PartialDate.parseDate("-3-7");
        assertEquals(pd.getDate().get(Calendar.YEAR), 3);
        assertEquals(pd.getDate().get(Calendar.MONTH), 7);
        assertEquals(pd.getDate().get(Calendar.ERA), GregorianCalendar.BC);
        assertEquals(pd.getPrecision(), PrecisionType.MONTH);
    }

    /** tests year AD */
    @Test
    public void testYearMonthDay() {
        final PartialDate pd = PartialDate.parseDate("3-07-25");
        assertEquals(pd.getDate().get(Calendar.YEAR), 3);
        assertEquals(pd.getDate().get(Calendar.MONTH), 7);
        assertEquals(pd.getDate().get(Calendar.DAY_OF_MONTH), 25);

        assertEquals(pd.getDate().get(Calendar.ERA), GregorianCalendar.AD);
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
