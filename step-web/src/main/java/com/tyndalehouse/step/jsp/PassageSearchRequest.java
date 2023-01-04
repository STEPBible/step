package com.tyndalehouse.step.jsp;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.models.search.*;
import com.tyndalehouse.step.rest.controllers.SearchController;

import java.util.List;

/**
 * A helper utils for outputting search entries
 */
public class PassageSearchRequest {
    private final SearchController search;

    public PassageSearchRequest(final Injector injector) {
        search = injector.getInstance(SearchController.class);
    }

    public String getOutput(String querySyntax, String context, String pageNumber, String pageSize) {
        StringBuilder output = new StringBuilder(32000);
//        final SearchResult results = search.search(querySyntax, "false", context, pageNumber, pageSize);
//        final List<SearchEntry> searchEntries = results.getResults();
//        for (SearchEntry entry : searchEntries) {
//            appendSearchEntry(output, entry);
//        }
        return output.toString();
    }

    private void appendSearchEntry(final StringBuilder output, final SearchEntry entry) {
        if (entry instanceof SubjectHeadingSearchEntry) {
            final SubjectHeadingSearchEntry subjectHeadingSearchEntry = (SubjectHeadingSearchEntry) entry;
            final SearchResult headingsSearch = subjectHeadingSearchEntry.getHeadingsSearch();
            final List<SearchEntry> passageResults = headingsSearch.getResults();
            for (SearchEntry passageEntry : passageResults) {
                appendSearchEntry(output, passageEntry);
            }
        } else if (entry instanceof ExpandableSubjectHeadingEntry) {
            final ExpandableSubjectHeadingEntry expandableSubjectHeadingEntry = (ExpandableSubjectHeadingEntry) entry;
            output.append("<a href='#!__/0/subject/1/50/s++=");
            output.append(expandableSubjectHeadingEntry.getHeading());
            output.append(" ");
            output.append(expandableSubjectHeadingEntry.getRoot());
            output.append(" ");
            output.append(expandableSubjectHeadingEntry.getSeeAlso());

            output.append(" in (ESV)/0/ESV/NONE'");
            output.append(">");
            output.append(expandableSubjectHeadingEntry.getHeading());
            output.append(", ");
            output.append(expandableSubjectHeadingEntry.getRoot());
            output.append(", ");
            output.append(expandableSubjectHeadingEntry.getSeeAlso());
            output.append("</a>");
        } else if (entry instanceof VerseSearchEntry) {
            VerseSearchEntry vse = (VerseSearchEntry) entry;
            appendHeader(output, 5, vse.getKey(), vse.getPreview());
        } else if (entry instanceof KeyedSearchResultSearchEntry) {
            KeyedSearchResultSearchEntry ksrse = (KeyedSearchResultSearchEntry) entry;
            appendHeader(output, 5, ksrse.getKey());
            final List<KeyedVerseContent> verseContent = ksrse.getVerseContent();
            for (KeyedVerseContent kvc : verseContent) {
                appendHeader(output, 6, kvc.getContentKey(), kvc.getPreview());
            }
        }
    }

    /**
     * Appends a single header
     *
     * @param output     the output to be appended to
     * @param level      the level of the heading
     * @param headerText the text in the heading tag
     */
    private void appendHeader(final StringBuilder output, final int level, final String headerText) {
        appendHeader(output, level, headerText, "");
    }

    /**
     * Appends a single header with some content inside
     *
     * @param output     the output to be appended to
     * @param level      the level of the heading
     * @param headerText the text in the heading tag
     * @param content    the content to be appended after the header
     */
    private void appendHeader(final StringBuilder output, final int level, final String headerText, final String content) {
        output.append("<h");
        output.append(level);
        output.append('>');
        output.append(headerText);
        output.append("</h");
        output.append(level);
        output.append('>');
        output.append(content);
    }
}
