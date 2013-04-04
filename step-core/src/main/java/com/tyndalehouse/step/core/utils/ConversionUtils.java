package com.tyndalehouse.step.core.utils;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static java.lang.Long.parseLong;
import static org.joda.time.DateTime.parse;
import static org.joda.time.DateTimeUtils.getInstantMillis;

import org.joda.time.LocalDateTime;

/**
 * Utilities to convert from one form to another
 * 
 * @author chrisburrell
 */
public final class ConversionUtils {
    private static final long MILLISECONDS_IN_MINUTE = 60000;

    /** no op */
    private ConversionUtils() {
        // no op
    }

    /**
     * @param dateTime the date time
     * @return the number of minutes since epoch
     */
    public static long localDateTimeToEpochMinutes(final LocalDateTime dateTime) {
        return dateTime.toDateTime().getMillis() / MILLISECONDS_IN_MINUTE;
    }

    /**
     * @param value the date time
     * @return the number of minutes since epoch
     */
    public static long stringToEpochMinutes(final String value) {
        return getInstantMillis(parse(value)) / MILLISECONDS_IN_MINUTE;
    }

    /**
     * @param value the value of the date
     * @return the equivalent local date time
     */
    public static LocalDateTime epochMinutesStringToLocalDateTime(final String value) {
        if (isBlank(value)) {
            return null;
        }
        return new LocalDateTime(parseLong(value) * MILLISECONDS_IN_MINUTE);
    }
}
