package com.tyndalehouse.step.core.models.search;

import java.util.ArrayList;
import java.util.List;

/**
 * Wraps around all heading results kind of searches for Subjects
 */
public class KeyedSearchResultSearchEntry implements SearchEntry {
    private static final long serialVersionUID = -5226707320157394428L;
    // key, e.g. the verse reference
    private String key;
    private List<KeyedVerseContent> verseContent;

    /**
     * @return the key
     */
    public String getKey() {
        return this.key;
    }

    /**
     * @param key the key to set
     */
    public void setKey(final String key) {
        this.key = key;
    }

    /**
     * @return the verseContent
     */
    public List<KeyedVerseContent> getVerseContent() {
        return this.verseContent;
    }

    /**
     * @param verseContent the verseContent to set
     */
    public void setVerseContent(final List<KeyedVerseContent> verseContent) {
        this.verseContent = verseContent;
    }

    /**
     * adds an entry to the results
     * 
     * @param keyedVerseContent the content to be added
     */
    public void addEntry(final KeyedVerseContent keyedVerseContent) {
        if (this.verseContent == null) {
            this.verseContent = new ArrayList<KeyedVerseContent>();
        }

        this.verseContent.add(keyedVerseContent);
    }
}
