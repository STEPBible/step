package com.tyndalehouse.step.core.service.helpers;

import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.Books;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.*;
import java.util.Map.Entry;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

/**
 * The Version resolver resolved from a short initial version to the proper crosswire initials
 */
public class VersionResolver {
    static final String APP_VERSIONS_PREFIX = "app.versions.stepPrefix.";
    static final String APP_SHORT_NAMES_PREFIX = "app.versions.shortName.";
    static final String APP_SEPTUAGINT_VERSIONS = "app.septuagintVersions";

    private static final Logger LOGGER = LoggerFactory.getLogger(VersionResolver.class);
    private final Map<String, String> longToShort = new HashMap<String, String>(64);
    private final Map<String, String> shortToLong = new HashMap<String, String>(64);
    private final Set<String> septuagintVersions;

    /**
     * Instantiates a new version resolver, which helps with shortening abbreviations used on the server
     *
     * @param stepProperties the step properties which contain the mappings
     */
    @Inject
    public VersionResolver(@Named("StepCoreProperties") final Properties stepProperties) {
        // iterate through all properties of interest
        final Set<Entry<Object, Object>> entrySet = stepProperties.entrySet();
        for (final Entry<Object, Object> property : entrySet) {
            if (property.getKey() instanceof String && property.getValue() instanceof String) {
                final String key = (String) property.getKey();
                final String value = (String) property.getValue();

                if (StringUtils.isNotBlank(key)) {
                    if (key.startsWith(APP_VERSIONS_PREFIX)) {
                        addMapping(key.substring(APP_VERSIONS_PREFIX.length()), value);
                    } else if (key.startsWith(APP_SHORT_NAMES_PREFIX)) {
                        Book b = Books.installed().getBook(key.substring(APP_SHORT_NAMES_PREFIX.length()));
                        if(b != null) {       
                            b.putProperty("shortName", value);
                        }
                    }
                }
            }
        }

        this.septuagintVersions = new HashSet<>(Arrays.asList(toHigher(StringUtils.split(stepProperties.getProperty(APP_SEPTUAGINT_VERSIONS), ","))));
    }

    /**
     * Converts an array to upper case
     * @param split the string array
     * @return the upper case array. Note: this is the same as the input array, which is changed
     */
    private String[] toHigher(final String[] split) {
        for (int i = 0; i < split.length; i++) {
            split[i] = split[i].toUpperCase();

        }
        return split;
    }

    /**
     * It is assumed that if there is a clash of versions between the STEP prefixes (short names) and
     * the actual module names, then the STEP prefix will take precedence.
     * @param longName the long name corresponding to the CrossWire module name
     * @param shortName the prefix by which the Bible will be known in STEP
     */
    private void addMapping(final String longName, final String shortName) {
        final String normalisedShort = shortName.toLowerCase();
        final String normalisedLong = longName.toLowerCase();
        this.longToShort.put(normalisedLong, shortName);
        this.shortToLong.put(normalisedShort, longName);
    }

    /**
     * Gets the short name for a CrossWire module.
     *
     * @param longName the long name of the module
     * @return the short name
     */
    public String getShortName(final String longName) {
        final String shortName = this.longToShort.get(longName.toLowerCase());
        if (isBlank(shortName)) {
            return longName;
        }
        return shortName;
    }

    /**
     * Gets the long name.
     *
     * @param shortName the short name
     * @return the long name
     */
    public String getLongName(final String shortName) {
        final String longName = this.shortToLong.get(shortName.toLowerCase());
        if (isBlank(longName)) {
            return shortName;
        }
        return longName;
    }

    /**
     * @param initials the initials to look up the book.
     */
    public boolean isSeptuagintTagging(final String initials) {
        return this.septuagintVersions.contains(this.getLongName(initials).toUpperCase());
    }

    /**
     * @param b the book to identify the tagging from
     */
    public boolean isSeptuagintTagging(final Book b) {
        return isSeptuagintTagging(b.getInitials());
    }
}
