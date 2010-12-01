package com.tyndalehouse.step.core.service;

import java.util.List;

import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;

import com.tyndalehouse.step.core.models.LookupOption;

public interface JSwordService {
    /**
     * returns the Osis Text as a String
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @param options the list of options for the lookup operation
     * @param interlinearVersion the version to add if there is an interlinear request, or blank if not
     * @return the OSIS text in an HTML form
     */
    String getOsisText(String version, String reference, List<LookupOption> options, String interlinearVersion);

    /**
     * returns the biblical text as xml dom
     * 
     * @param version version to lookup
     * @param reference the reference to lookup
     * @return the OSIS text in an HTML form
     */
    String getOsisText(String version, String reference);

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
