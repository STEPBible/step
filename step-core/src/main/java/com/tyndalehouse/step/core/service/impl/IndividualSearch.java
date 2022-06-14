/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 *
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.utils.StringUtils;
import org.apache.lucene.queryParser.QueryParser;
import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;

/**
 * Represents an individual search
 *
 * @author chrisburrell
 */
public class IndividualSearch {
    public static final Pattern MAIN_RANGE = Pattern.compile("(\\+\\[([^\\]]+)\\])");
    private static final char RELATED_WORDS = '~';
    private static final Pattern OR_UPPERCASING = Pattern.compile("\\bor\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern AND_UPPERCASING = Pattern.compile("\\band\\b", Pattern.CASE_INSENSITIVE);

    private static final Pattern SUB_RANGE = Pattern.compile("\\{([^}]+)\\}");
    private static final Pattern ORIGINAL_FILTER = Pattern.compile(" where original is \\(([^)]+)\\)");

    private static final Logger LOGGER = LoggerFactory.getLogger(IndividualSearch.class);
    private static final String TEXT = "t=";
    private static final String SUBJECT = "s";
    private static final String ORIGINAL = "o";

    private static final String TIMELINE_DESCRIPTION = "d=";
    private static final String TIMELINE_REFERENCE = "dr=";
    private String secondaryRange = null;

    private SearchType type;
    private String query;
    private String[] versions;
    private boolean amendedQuery;
    private String subRange;
    private String mainRange;
    private String[] originalFilter;
    private String originalQuery;
    private String searchJoinType;

    /**
     * Instantiates a single search to be executed.
     *
     * @param type     the type of the search
     * @param versions the versions to be used to carry out the search
     * @param query    the query to be run
     */
    public IndividualSearch(final SearchType type, final List<String> versions,
                            final String query, final String range, final String[] filter,
                            final String searchJoinType) {
        this.type = type;
        this.mainRange = range;
        this.versions = versions.toArray(new String[versions.size()]);
        this.originalFilter = filter;
        this.searchJoinType = searchJoinType;

        if (this.type == SearchType.SUBJECT_SIMPLE) {
            this.originalQuery = query;
            this.query = (StringUtils.isNotBlank(this.mainRange) ? this.mainRange + " " : "") + LuceneIndex.FIELD_HEADING_STEM + ":" + QueryParser.escape(query);
        } else if (type == SearchType.TEXT) {
            //TODO: this is a hack because we need to revisit the parsing of searches
            this.secondaryRange = mainRange;
            this.originalQuery = this.query = transformToTextQuery(query);
        } else {
            this.originalQuery = this.query = query;
        }
    }


    /**
     * Initialises the search from the query string.
     *
     * @param query       the query that is being sent to the app to search for
     * @param restriction a restriction, other than the one specified in the syntax
     */
    public IndividualSearch(final String query, final String[] versions, final String restriction) {
        this(query, versions, restriction, "AND");
    }

    /**
     * Initialises the search from the query string.
     *
     * @param query       the query that is being sent to the app to search for
     * @param restriction a restriction, other than the one specified in the syntax
     */
    public IndividualSearch(final String query, final String[] versions, final String restriction, final String searchJoinType) {
        this.secondaryRange = restriction;
        this.versions = versions;
        this.searchJoinType = searchJoinType;
        if (query.startsWith(TEXT)) {
            this.query = transformToTextQuery(query.substring(TEXT.length()));
            this.type = SearchType.TEXT;
        } else if (query.startsWith(SUBJECT) && (query.length() > 1 && query.charAt(1) == '=' || query.length() > 2 && query.charAt(2) == '=' )) {
            parseSubjectSearch(query.substring(SUBJECT.length()));
        } else if (query.startsWith(ORIGINAL)) {
            parseOriginalSearch(query.substring(ORIGINAL.length()));
        } else if (query.startsWith(TIMELINE_DESCRIPTION)) {
            this.type = SearchType.TIMELINE_DESCRIPTION;
            this.query = query.substring(TIMELINE_DESCRIPTION.length());
        } else if (query.startsWith(TIMELINE_REFERENCE)) {
            this.type = SearchType.TIMELINE_REFERENCE;
            this.query = query.substring(TIMELINE_REFERENCE.length());
        } else {
            // default to JSword and hope for the best, but warn
            this.query = transformToTextQuery(query);
            this.type = SearchType.TEXT;
        }
        if (isBlank(this.query)) {
            // return straight away
            throw new TranslatedException("blank_search_provided");
        }
        LOGGER.debug(
                "The following search has been constructed: type [{}]\nquery [{}]\n subRange [{}], mainRange [{}]",
                this.type, query, this.subRange, this.mainRange);
    }

    /**
     * @param query the query itself
     * @return the text query that should be run
     */
    private String transformToTextQuery(final String query) {
        return AND_UPPERCASING.matcher(OR_UPPERCASING.matcher(query).replaceAll("OR")).replaceAll("AND");
    }

    /**
     * Parses the query to be the correct original search
     *
     * @param parseableQuery the query entered by the user, without the first character (o)
     */
    private void parseOriginalSearch(final String parseableQuery) {
        int length = 1;

        final char specifier = parseableQuery.charAt(length);
        switch (parseableQuery.charAt(0)) {
            case 't':
                this.type = SearchType.ORIGINAL_MEANING;
                break;
            case 'g':
                if (specifier == RELATED_WORDS) {
                    this.type = SearchType.ORIGINAL_GREEK_RELATED;
                    length++;
                } else {
                    this.type = SearchType.ORIGINAL_GREEK_FORMS;
                }
                break;
            case 'h':
                if (parseableQuery.charAt(length) == '~') {
                    this.type = SearchType.ORIGINAL_HEBREW_RELATED;
                    length++;
                } else {
                    this.type = SearchType.ORIGINAL_HEBREW_FORMS;
                }
                break;
            case 'f':
                break;
            default:
                throw new TranslatedException("The requested search is not yet supported o" + parseableQuery);
        }

        matchOriginalFilter(parseableQuery.substring(length + 1));

        // finally we can try and match our sub-range for the original word
        matchSubRange();
        matchMainRange();
    }

    /**
     * Matches the original filter, 'where original is' pattern
     *
     * @param parseableQuery query
     */
    private void matchOriginalFilter(final String parseableQuery) {
        this.query = parseableQuery;
        final String filter = matchFirstGroupAndRemove(ORIGINAL_FILTER);
        if (isNotBlank(filter)) {
            this.originalFilter = filter.split(",");
        }
    }

    /**
     * Matches a main range such as +[Gen-Rev]
     */
    private void matchMainRange() {
        this.mainRange = matchFirstGroupAndRemove(MAIN_RANGE);
    }

    /**
     * Matches a sub-range in the form of {range}
     */
    private void matchSubRange() {
        this.subRange = matchFirstGroupAndRemove(SUB_RANGE);
    }

    /**
     * Matches the first group and removes the entire match from the string
     *
     * @param pattern the pattern to use for matching the query
     * @return the string that was matched
     */
    private String matchFirstGroupAndRemove(final Pattern pattern) {
        final Matcher matcher = pattern.matcher(this.query);

        if (matcher.find()) {
            this.query = this.query.replace(matcher.group(), "").trim();
            return matcher.group(1).trim();
        }
        return null;
    }

    /**
     * Constructs the syntax for the subject search
     *
     * @param parsedSubject the parsed and well-formed search query, containing prefix, etc.
     */
    private void parseSubjectSearch(final String parsedSubject) {
        int index = 2;

        // how many pluses do we have
        switch (parsedSubject.charAt(0)) {
            case 'r':
                this.type = SearchType.SUBJECT_RELATED;
                break;
            case 'h':
                this.type = SearchType.SUBJECT_SIMPLE;
                break;
            case 'n':
                this.type = SearchType.SUBJECT_EXTENDED;
                break;
            case 'x':
                this.type = SearchType.SUBJECT_FULL;
                break;
            default:
                index--;
                this.type = SearchType.SUBJECT_FULL;
                break;
        }

        // fill in the query and versions
        this.query = parsedSubject.substring(index);

        if (this.type == SearchType.SUBJECT_SIMPLE) {
            // amend the query
            final StringBuilder subjectQuery = new StringBuilder(this.query.length() + 32);
            final String[] keys = split(this.query);

            for (int i = 0; i < keys.length; i++) {
                if (isBlank(keys[i])) {
                    continue;
                }
                subjectQuery.append(LuceneIndex.FIELD_HEADING);
                subjectQuery.append(':');
                subjectQuery.append(QueryParser.escape(keys[i]));

                if (i + 1 < keys.length) {
                    subjectQuery.append(" AND ");
                }

            }
            if (StringUtils.isNotBlank(this.mainRange)) {
                subjectQuery.append(' ');
                subjectQuery.append(this.mainRange);
            }

            this.query = subjectQuery.toString();
        }
    }

    /**
     * @return the searchJoinType
     */
    public String getSearchJoinType() {
        return this.searchJoinType;
    }

    /**
     * @return the type
     */
    public SearchType getType() {
        return this.type;
    }

    /**
     * sets the type of the search
     *
     * @param type the new type to override
     */
    public void setType(final SearchType type) {
        this.type = type;
    }

    /**
     * @return the query
     */
    public String getQuery() {
        return this.query;
    }

    /**
     * @param query the query to set
     */
    public void setQuery(final String query) {
        // record the fact the query has been amended
        this.amendedQuery = true;
        this.query = query;
    }

    /**
     * @return the versions
     */
    public String[] getVersions() {
        return this.versions;
    }

    /**
     * @param versions overwrites the versions
     */
    public void setVersions(final String[] versions) {
        this.versions = versions.clone();

    }

    public void setQuery(final String inputQuery, final boolean addRange) {
        String query = inputQuery;
        if (addRange) {
            //remove the current range from the query first...
            query = MAIN_RANGE.matcher(inputQuery).replaceAll("");
        }

        this.setQuery((addRange && StringUtils.isNotBlank(this.mainRange) ? this.mainRange + " " : "") + query);
    }

    /**
     * @return the subRange
     */
    public String getSubRange() {
        return this.subRange;
    }

    /**
     * @return the mainRange
     */
    public String getMainRange() {
        return this.mainRange;
    }

    /**
     * @return the originalFilter
     */
    public String[] getOriginalFilter() {
        return this.originalFilter;
    }

    /**
     * @return The untampered query
     */
    public String getOriginalQuery() {
        return originalQuery;
    }

    /**
     * A secondary range, usually submitted outside of the actual query
     *
     * @return the secondary range
     */
    public String getSecondaryRange() {
        return secondaryRange;
    }
}
