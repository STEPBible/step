package com.tyndalehouse.step.core.service.impl;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.crosswire.jsword.index.lucene.LuceneIndex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.utils.StringUtils;

/**
 * Represents an individual search
 * 
 * @author chrisburrell
 */
public class IndividualSearch {
    private static final Pattern IN_VERSIONS = Pattern
            .compile("in ?\\(([^)]+)\\)$", Pattern.CASE_INSENSITIVE);
    private static final Logger LOGGER = LoggerFactory.getLogger(IndividualSearch.class);
    private static final String TEXT = "t=";
    private static final String SUBJECT = "s=";
    private static final String RELATED_STRONG = "o~=";
    private static final String EXACT_STRONG = "o=";
    private static final String TIMELINE_DESCRIPTION = "d=";
    private static final String TIMELINE_REFERENCE = "dr=";

    private SearchType type;
    private String query;
    private String[] versions;
    private boolean amendedQuery;

    /**
     * Initialises the search from the query string
     * 
     * @param query the query that is being sent to the app to search for
     */
    public IndividualSearch(final String query) {
        if (query.startsWith(TEXT)) {
            this.type = SearchType.TEXT;
            matchVersions(query.substring(TEXT.length()));
        } else if (query.startsWith(SUBJECT)) {
            parseSubjectSearch(query.substring(SUBJECT.length()));
        } else if (query.startsWith(EXACT_STRONG)) {
            this.type = SearchType.EXACT_STRONG;
            matchVersions(query.substring(EXACT_STRONG.length()));
        } else if (query.startsWith(RELATED_STRONG)) {
            this.type = SearchType.RELATED_STRONG;
            matchVersions(query.substring(RELATED_STRONG.length()));
        } else if (query.startsWith(TIMELINE_DESCRIPTION)) {
            this.type = SearchType.TIMELINE_DESCRIPTION;
            matchVersions(query.substring(TIMELINE_DESCRIPTION.length()));
        } else if (query.startsWith(TIMELINE_REFERENCE)) {
            this.type = SearchType.TIMELINE_REFERENCE;
            matchVersions(query.substring(TIMELINE_REFERENCE.length()));
        } else {
            LOGGER.warn("Unknown search type for query [{}]", query);

            // default to JSword and hope for the best, but warn
            matchVersions(query);
            this.type = SearchType.TEXT;
        }
    }

    /**
     * matches a version in the query of type "xyz in (KJV)"
     * 
     * @param textQuery the query without the prefix
     */
    private void matchVersions(final String textQuery) {
        final Matcher capturedVersions = IN_VERSIONS.matcher(textQuery);

        if (!capturedVersions.find()) {
            throw new StepInternalException("Unable to match query string to find versions " + textQuery);
        }

        final String versionGroup = capturedVersions.group(1);
        this.versions = versionGroup.split("[, ]+");
        for (int i = 0; i < this.versions.length; i++) {
            this.versions[i] = this.versions[i].trim();
        }

        this.query = textQuery.substring(0, capturedVersions.start() - 1).trim();
    }

    /**
     * Constructs the syntax for the subject search
     * 
     * @param parsedSubject the parsed and well-formed search query, containing prefix, etc.
     */
    private void parseSubjectSearch(final String parsedSubject) {
        // fill in the query and versions
        matchVersions(parsedSubject);

        // amend the query
        final StringBuilder subjectQuery = new StringBuilder(this.query.length() + 32);
        final String[] keys = StringUtils.split(this.query);

        for (int i = 0; i < keys.length; i++) {
            subjectQuery.append(LuceneIndex.FIELD_HEADING);
            subjectQuery.append(':');
            subjectQuery.append(keys[i]);

            if (i + 1 < keys.length) {
                subjectQuery.append(" AND ");
            }
        }
        this.type = SearchType.SUBJECT;

        this.query = subjectQuery.toString();
    }

    /**
     * @return the type
     */
    public SearchType getType() {
        return this.type;
    }

    /**
     * @return the query
     */
    public String getQuery() {
        return this.query;
    }

    /**
     * @return the versions
     */
    public String[] getVersions() {
        return this.versions;
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
     * @return the amendedQuery
     */
    public boolean isAmendedQuery() {
        return this.amendedQuery;
    }
}
