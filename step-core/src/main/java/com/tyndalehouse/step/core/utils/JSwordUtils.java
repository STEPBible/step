package com.tyndalehouse.step.core.utils;

import static java.util.Collections.sort;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;

import org.crosswire.common.util.Language;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.FeatureType;

import com.tyndalehouse.step.core.models.BibleVersion;

/**
 * a set of utility methods to manipulate the JSword objects coming out
 * 
 * @author Chris
 * 
 */
public final class JSwordUtils {
    /**
     * hiding implementaiton
     */
    private JSwordUtils() {
        // no implementation
    }

    /**
     * returns a sorted list from another list, with only the required information
     * 
     * @param bibles a list of jsword bibles
     * @return the list of bibles
     */
    public static List<BibleVersion> getSortedSerialisableList(final Collection<Book> bibles) {
        final List<BibleVersion> versions = new ArrayList<BibleVersion>();

        // we only send back what we need
        for (final Book b : bibles) {
            final BibleVersion v = new BibleVersion();
            v.setName(b.getName());
            v.setInitials(b.getInitials());

            final Language language = b.getLanguage();
            if (language != null) {

                v.setLanguage(language.getName());
            }
            v.setHasStrongs(b.hasFeature(FeatureType.STRONGS_NUMBERS));
            versions.add(v);
        }

        // finally sort by initials
        sort(versions, new Comparator<BibleVersion>() {
            @Override
            public int compare(final BibleVersion o1, final BibleVersion o2) {
                return o1.getInitials().compareTo(o2.getInitials());
            }
        });

        return versions;
    }
}
