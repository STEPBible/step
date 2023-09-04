//CHECKSTYLE:OFF
package com.tyndalehouse.step.tools.analysis;

import org.crosswire.jsword.book.*;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.jdom2.Element;
import org.jdom2.filter.AttributeFilter;
import org.jdom2.filter.ElementFilter;
import org.jdom2.filter.Filter;

import java.util.*;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SpecificForms {

    // Outputs all lexical forms TODO - move to a step-utils project
    public static void main(final String[] args) throws BookException, NoSuchKeyException {
        final Pattern m = Pattern.compile("([GH]+[0-9]+)[.,;·]?");
        final SortedMap<String, Set<String>> strongs = new TreeMap<String, Set<String>>();


        final Filter filter = new ElementFilter().and(new AttributeFilter(OSISUtil.ATTRIBUTE_W_LEMMA));

        for (final Book b : Books.installed().getBooks()) {
            if (!"grc".equalsIgnoreCase(b.getLanguage().getCode())
                    && !"he".equalsIgnoreCase(b.getLanguage().getCode())
                    && !"hbo".equalsIgnoreCase(b.getLanguage().getCode())) {
                continue;
            }
            System.err.println("Processing " + b.getInitials());

            final Key key = b.getKey("Gen-Rev");
            final BookData bookData = new BookData(b, key);
            final Element osis = bookData.getOsis();
            final Iterator<Element> descendants = osis.getDescendants(filter);

            while (descendants.hasNext()) {
                final Element el = descendants.next();
                final Matcher matcher = m.matcher(el.getAttributeValue(OSISUtil.ATTRIBUTE_W_LEMMA));

                final StringBuilder sb = new StringBuilder();
                while (matcher.find()) {
                    sb.append(matcher.group(1));
                    sb.append("|");
                }
                if (sb.length() == 0) {
                    // System.err.println(el.getAttributeValue(OSISUtil.ATTRIBUTE_W_LEMMA));
                    continue;
                }

                sb.deleteCharAt(sb.length() - 1);

                Set<String> set = strongs.get(sb.toString());
                if (set == null) {
                    set = new HashSet<String>(10);
                    strongs.put(sb.toString(), set);
                }
                set.add(el.getTextTrim());
            }
        }

        for (final Entry<String, Set<String>> entry : strongs.entrySet()) {
            final Set<String> s = entry.getValue();
            final String key = entry.getKey();
            for (final String v : s) {
                System.out.println(String.format("%s,%s", key, v));
            }
        }
    }
}
