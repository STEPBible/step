package com.tyndalehouse.step.core.utils;

import com.tyndalehouse.step.core.exceptions.UserExceptionType;
import com.tyndalehouse.step.core.exceptions.ValidationException;
import com.tyndalehouse.step.core.models.SearchToken;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;

/**
 * Checks various assertions and throws the exception: {@link ValidationException}
 */
public final class ValidateUtils {

    private static final Pattern SPLIT_TOKENS = Pattern.compile("@");

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
    public static boolean validateInputParm(final String key, final String value) {
        final char lowerBoundLC = 'a';
        final char upperBoundLC = 'z';
        final char lowerBoundUC = 'A';
        final char upperBoundUC = 'Z';
        final char lowerBoundNum = '0';
        final char upperBoundNum = '9';
        if ((value == null) || value.equals("")) return true;
        if (key.equals("version") || key.equals("options")  || key.equals("display")) {
            if (value.length() > 20) {
                System.out.println("XSS kill unexpected length key: " + key + " value: " + value);
                return false;
            }
            for (int i = 0; i < value.length(); i++) {
                char c = value.charAt(i);
                if (!((c >= lowerBoundLC && c <= upperBoundLC) ||
                        (c >= lowerBoundUC && c <= upperBoundUC) ||
                        (c >= lowerBoundNum && c <= upperBoundNum) ||
                        (c == '_') || (c == '-'))) {
                    System.out.println("XSS kill unexpected char key: " + key + " value: " + value);
                    return false;
                }
            }
            return true;
        }
        else if (key.equals("reference") || key.equals("topicref") || key.equals("relatedrefs")) {
            if (value.length() > 1000) {
                System.out.println("XSS kill unexpected reference length: " + value);
                return false;
            }
            for (int i = 0; i < value.length(); i++) {
                char c = value.charAt(i);
                if (!((c >= lowerBoundLC && c <= upperBoundLC) ||
                        (c >= lowerBoundUC && c <= upperBoundUC) ||
                        (c >= lowerBoundNum && c <= upperBoundNum) ||
                        (c == '.') || (c == ':') || (c == '-')  || (c == ' ')  || (c == ',')  || (c == ';')  || (c == '+'))) {
                    System.out.println("XSS kill unexpected char key: " + key + " value: " + value);
                    return false;
                }
            }
            return true;
        }
        else if (key.equals("morphIdentifiers") || key.equals("strong")  || key.equals("examples")) {
            if (value.length() > 300) {
                System.out.println("XSS kill unexpected length key: " +key + " value: " + value);
                return false;
            }
            for (int i = 0; i < value.length(); i++) {
                char c = value.charAt(i);
                if (!((c >= lowerBoundLC && c <= upperBoundLC) ||
                        (c >= lowerBoundUC && c <= upperBoundUC) ||
                        (c >= lowerBoundNum && c <= upperBoundNum) ||
                        (c == '.') || (c == ':') || (c == '-')  || (c == ' ')  || (c == ',')  || (c == ';'))) {
                    System.out.println("XSS kill unexpected char in key: " + key + " value: " + value);
                    return false;
                }
            }
            return true;
        }
        else if (key.equals("srchJoin")) {
            if (value.length() > 300) {
                System.out.println("XSS kill unexpected length key: " +key + " value: " + value);
                return false;
            }
            for (int i = 0; i < value.length(); i++) {
                char c = value.charAt(i);
                if (!(  (c >= lowerBoundLC && c <= upperBoundLC) ||
                        (c >= lowerBoundNum && c <= upperBoundNum) ||
                        (c == '(') || (c == ')'))) {
                    System.out.println("XSS kill unexpected char in key: " + key + " value: " + value);
                    return false;
                }
            }
            return true;
        }
        else if (key.equals("text") || key.equals("meanings") || key.equals("subject")  || key.equals("limit") ||
                key.equals("vocabIdentifiers") || key.equals("nave") || key.equals("xnave") || key.equals("syntax")) {
            if (value.length() > 150) {
                System.out.println("XSS too long no kill , key: " + key + " value: " + value);
                return true;
            }
            return true;
        }
        else if (key.equals("lang")) {
            if (value.length() > 6)  {
                System.out.println("XSS kill lang too long, key: " + key + " value: " + value);
                return false;
            }
            for (int i = 0; i < value.length(); i++) {
                char c = value.charAt(i);
                if (!((c >= lowerBoundLC && c <= upperBoundLC) ||
                        (c >= lowerBoundUC && c <= upperBoundUC) ||
                        (c == '_') || (c == '-') )) {
                    System.out.println("XSS kill unexpected char key: " + key + " value: " + value);
                    return false;
                }
            }
            return true;
        }
        else if (key.equals("pos")) {
            if (value.length() > 2)  {
                System.out.println("XSS kill lang too long, key: " + key + " value: " + value);
                return false;
            }
            for (int i = 0; i < value.length(); i++) {
                char c = value.charAt(i);
                if (!(c >= lowerBoundNum && c <= upperBoundNum)  ) {
                    System.out.println("XSS kill unexpected char key: " + key + " value: " + value);
                    return false;
                }
            }
            return true;
        }
        else {
            String keyForCompare = " " + key + " ";
            if (" greekMeanings hebrewMeanings greek hebrew exactForm ".indexOf(keyForCompare) > -1) {
                System.out.println("XSS INFO, key: " + key + " value: " + value);
                return true;
            }
            System.out.println("XSS unknown key: " + key + " " + value);
            return true;
        }
    }
    /**
     * Parses a string in the form of a=2@c=1 into a list of search tokens
     *
     * @param items
     * @return
     */
    public static List<SearchToken> parseTokens(final String items) {
        String[] tokens;
//        System.out.println("parseTokens items: " + items);
        if (!StringUtils.isBlank(items))
            tokens = SPLIT_TOKENS.split(items.replaceAll("\\|", "@").replaceAll("@@", "@"));
        else
            tokens = new String[0];

        for (int i = 1; i < tokens.length; i++) { // Handle search parameter with @.  For example: text=morph:H2603A@*Vq*
            if ((tokens[i].indexOf("=") == -1) &&
                    ((tokens[i-1].indexOf("text=morph:") == 0) || (tokens[i-1].indexOf("syntax=t=morph:") == 0))) {
                tokens[i-1] += "@" + tokens[i]; // based on the above example, concatenate text=morph:H2603A with *Vq*
                tokens[i] = ""; // based on above example, empty out the element with *Vq*
            }
        }
        List<SearchToken> searchTokens = new ArrayList<SearchToken>();
        for (String t : tokens) {
            int indexOfPrefix = t.indexOf('=');
            if (indexOfPrefix == -1) {
                if (t.length() > 0)
                    System.out.println("Ignoring item: " + t);
                continue;
            }
            String key = t.substring(0, indexOfPrefix);
            String value = t.substring(indexOfPrefix + 1);
            if (ValidateUtils.validateInputParm(key, value)) {
                searchTokens.add(new SearchToken(key, value));
            }
        }
        return searchTokens;
    }
    public static boolean checkURLParms(final Map<String, String[]> inputParms, final String requestURI) {
        for (Map.Entry<String, String[]> entry : inputParms.entrySet()) {
            final String key = entry.getKey();
            final String[] value = entry.getValue();
            if (key.equals("debug") || key.equals("noredirect") || key.equals("skipwelcome")) {
                if ((value.length == 1) && value[0].equals("")) continue; // The debug and noredirect parameters do not have value so no additional checking is required.
                System.out.println("XSS kill unexpected value with key: " + key + " value: " + value[0] + " requestURI: " + requestURI);
                return false;
            }
            final String cmpKey = " " + key + " ";
            if (" q options display page qFilter sort context lang reference version pos ".indexOf(cmpKey) > -1) {
                for (int i = 0; i < value.length; i++) {
                    String checkValue = value[i];
                    if (checkValue.length() == 0) continue;
                    if ((key.equals("options") && !(validateInputParm("options", checkValue))) ||
                            (key.equals("display") && !(validateInputParm("display", checkValue))) ||
                            (key.equals("lang") && !(validateInputParm("lang", checkValue))) ||
                            (key.equals("version") && !(validateInputParm("version", checkValue))) ||
                            (key.equals("reference") && !(validateInputParm("reference", checkValue))) ||
                            (key.equals("pos") && !(validateInputParm("pos", checkValue)))) {
                        System.out.println("XSS kill checkURLParms 2 : " + key + "=" + checkValue + " uri: " + requestURI);
                        return false;
                    }
                    if (!checkForObviousXSS(key, checkValue, requestURI, true)) {
                        System.out.println("XSS kill checkURLParms 3 : " + key + "=" + checkValue + " uri: " + requestURI);
                        return false;
                    }
                }
            }
            else { // does not match " q options display page qFilter sort context lang "
                System.out.println("XSS kill checkURLParm: unknown key: " + key + " value: " + value[0] + " requestURI: " + requestURI);
                return false;
            }
        }
        return true;
    }

    public static boolean checkForObviousXSS(final String key, final String checkValue, final String requestURI,
                                             final boolean kill) {
        String checkValueLC = checkValue.toLowerCase();
        if (checkValueLC.contains("script")) {
            checkValueLC = checkValueLC.replaceAll("\\s+", "");
            if (checkValueLC.contains("<script>") || checkValueLC.contains("</script>")) {
                System.out.println("XSS kill checkForObviousXSS: " + key + "=" + checkValue + " uri: " + requestURI);
                return false;
            }
        }
        if (checkValueLC.contains("<") || checkValueLC.contains(">") || checkValueLC.contains("%3c") || checkValueLC.contains("%3e") ||
                checkValueLC.contains("&lt") || checkValueLC.contains("&gt") ||
                checkValueLC.contains("#6") || checkValueLC.contains("#0") || checkValueLC.contains("#x") ||
                checkValueLC.contains("\u003c")) {
            if (kill) {
                System.out.println("XSS kill checkForObviousXSS key: " + key + "=" + checkValue + " uri: " + requestURI);
                return false;
            }
            System.out.println("XSS no_kill checkForObviousXSS key: " + key + "=" + checkValue + " uri: " + requestURI);
        }
        return true;
    }
}
