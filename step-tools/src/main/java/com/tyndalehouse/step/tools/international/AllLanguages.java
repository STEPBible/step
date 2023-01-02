package com.tyndalehouse.step.tools.international;

import java.util.Locale;

/**
 * The Class AllLanguages.
 */
public class AllLanguages {

    /**
     * The main method.
     * 
     * @param args the arguments
     */
    public static void main(final String[] args) {
        final String[] isoLanguages = Locale.getISOLanguages();
        for (final String lang : isoLanguages) {
            final Locale locale = new Locale(lang);
            System.out.println(locale.getLanguage() + "\t" + locale.getDisplayLanguage(locale) + "\t"
                    + locale.getDisplayLanguage(Locale.ENGLISH));
        }
    }
}
