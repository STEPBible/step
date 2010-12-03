package com.tyndalehouse.step.core.utils;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.getAnyKey;
import static java.lang.String.format;
import static org.apache.commons.lang.StringUtils.split;

public final class XslHelper {
    private static final int APPROXIMATE_ANCHOR_LENGTH = 56;
    private static final int APPROXIMATE_SPAN_LENGTH = 46;
    private static final String START_ANCHOR = "<a href=\"";
    private static final String START_FUNCTION_WRAPPER = "('";
    private static final String END_FUNCTION_WRAPPER = "', this)";
    private static final String QUOTED_END_TAG = "\">";
    private static final String END_ANCHOR = "</a>";
    private static final String SEPARATORS = " |";
    private static final String BLANK_SPACE = "&nbsp;";

    /**
     * hiding implementation
     */
    private XslHelper() {
        // hiding implementation
    }

    /**
     * returns a "span" element for use in an HTML document
     * 
     * @param strongsText the key straight from the OSIS text
     * @return a span containing all the strongs, seperated by spaces
     */
    public static String getSpanFromAttributeName(final String strongsText, final String functionCall) {
        final String[] strongs = split(strongsText, SEPARATORS);
        if (strongs == null || strongs.length == 0) {
            return format(XslHelper.BLANK_SPACE);
        }

        // we transform each strong to something like: "<a href=\"%s\">%s</a>";
        final StringBuilder sb = new StringBuilder(APPROXIMATE_SPAN_LENGTH + strongs.length * APPROXIMATE_ANCHOR_LENGTH);

        String strongKey;
        for (int ii = 0; ii < strongs.length; ii++) {
            strongKey = getAnyKey(strongs[ii]);
            sb.append(START_ANCHOR);
            sb.append(functionCall);
            sb.append(START_FUNCTION_WRAPPER);
            sb.append(strongKey);
            sb.append(END_FUNCTION_WRAPPER);
            sb.append(QUOTED_END_TAG);
            sb.append(strongKey);
            sb.append(END_ANCHOR);

            if (ii + 1 != strongs.length) {
                sb.append(' ');
            }
        }
        return sb.toString();
    }
}
