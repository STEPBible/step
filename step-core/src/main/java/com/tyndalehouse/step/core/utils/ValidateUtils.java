package com.tyndalehouse.step.core.utils;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;

import com.tyndalehouse.step.core.exceptions.UserExceptionType;
import com.tyndalehouse.step.core.exceptions.ValidationException;
import java.util.Locale;

/**
 * Checks various assertions and throws the exception: {@link ValidationException}
 * 
 * @author chrisburrell
 * 
 */
public final class ValidateUtils {
    /** can't instantiate */
    private ValidateUtils() {
        // no op
    }

    /**
     * @param o the parameter to test for null
     * @param exceptionMessage the message to be logged if the exception is caught later
     * @param type the type of error
     */
    public static void notNull(final Object o, final String exceptionMessage, final UserExceptionType type) {
        if (o == null) {
            throw new ValidationException(exceptionMessage, type);
        }
    }

    /**
     * @param s the parameter to test for null
     * @param exceptionMessage the exception message for use by a developer
     * @param type the type of exception
     */
    public static void notEmpty(final String s, final String exceptionMessage, final UserExceptionType type) {
        if (isEmpty(s)) {
            throw new ValidationException(exceptionMessage, type);
        }
    }

    /**
     * @param s the parameter to test for null
     * @param type the type of exception message
     * @param exceptionMessage the message to be logged if the exception is caught later
     */
    public static void notBlank(final String s, final String exceptionMessage, final UserExceptionType type) {
        if (isBlank(s)) {
            throw new ValidationException(exceptionMessage, type);
        }
    }

    /**
     * @param s the string to be tested
     * @param minCharacters the number of characters below which we reject the request
     * @param exceptionMessage the message
     * @param type the type of user exception
     */
    public static void atLeast(final String s, final int minCharacters, final String exceptionMessage,
            final UserExceptionType type) {
        if (s.length() < minCharacters) {
            throw new ValidationException(exceptionMessage, type);
        }
    }

    /**
     * @param inputLangCode the input Language Code that we need to check
     * @param locale passed in from the .jsp page
     * @return the validated Language Code
     */
    public static String checkLangCode(final String inputLangCode, final Locale locale)
    {
        String result = "en";
        if(inputLangCode == null) {
            if (locale.getLanguage().equalsIgnoreCase( "zh") && locale.getCountry().equalsIgnoreCase("tw")) {
                result = "zh_TW";
            }
            else {
                result = locale.getLanguage();
            }
        }
        else {
            if ((inputLangCode.length() >= 2) && (inputLangCode.length() <= 5)) {
                result = inputLangCode;
            }
        }
        return result;
    }

}
