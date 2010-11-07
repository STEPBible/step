package com.tyndalehouse.step.core.service;

import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;

import com.tyndalehouse.step.core.models.LookupOption;

public interface JSwordService {
    /**
     * returns the biblical text as xml dom
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @param options the list of options for the lookup operation
     * @return the OSIS text in an HTML form
     */
    String getOsisText(String version, String reference, List<LookupOption> options);

    /**
     * returns the language of the version specified
     * 
     * @param version the version to lookup
     * @return the language code
     */
    String getLanguage(String version);

    /**
     * retrieves the short form of the key that is a human readable form
     * 
     * @param version the version to be retrieved from
     * @param reference the reference to be converted
     * @return a human readable version of the key
     */
    String getReadableKey(String version, String reference);

    /**
     * returns the actual reference, removing the strong pattern + first initial. For e.g. removes strong:H from
     * "strong:H00002"
     * 
     * @param reference reference to parse
     * @return the key in the dictionary to be used for lookup purposes
     * @throws ActionException the action exception
     */
    String getLookupKeyFromReference(String reference);

    /**
     * dependant on the reference, we return a different module to lookup the definition. For e.g. we use a Greek
     * dictionary to lookup a reference starting strong:Gxxxxx
     * 
     * @param reference reference to be looked up
     * @return the module initials to use for the dictionary lookup
     */
    String getInitialsFromReference(String reference);

    /**
     * Looks up a definition given a reference in the default JSword module
     * 
     * @param reference reference, for e.g. a Strong number
     * @return the definition
     */
    String lookupStrongDefinition(String reference);

    /**
     * looks up any installed module
     * 
     * @param bibleCategory the category of the bible to lookup
     * @return a list of bible books
     */
    List<Book> getModules(BookCategory bibleCategory);

    /**
     * Gets the features for a module
     * 
     * @param version the initials of the book to look up
     * @return the list of supported features
     */
    List<LookupOption> getFeatures(String version);
}
