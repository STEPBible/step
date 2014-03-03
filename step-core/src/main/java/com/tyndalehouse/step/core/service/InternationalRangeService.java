package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.BookName;

import java.util.List;

/**
 * @author chrisburrell
 */
public interface InternationalRangeService {
    /**
     * For a partiaular user locale, provided by the client session, returns all 
     * matching ranges
     * @param filter the filter input by the user
     * @return the list of book names/references that match
     */
    List<BookName> getRanges(String filter);
}
