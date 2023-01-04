package com.tyndalehouse.step.core.models.search;

import java.io.Serializable;

/**
 * Keyed content, e.g. by version
 */
public class KeyedVerseContent implements Serializable {
    private static final long serialVersionUID = -1522196279945422299L;
    // key to content, e.g. version
    private String contentKey;
    private String preview;

    /**
     * @return the contentKey
     */
    public String getContentKey() {
        return this.contentKey;
    }

    /**
     * @param contentKey the contentKey to set
     */
    public void setContentKey(final String contentKey) {
        this.contentKey = contentKey;
    }

    /**
     * @return the text
     */
    public String getPreview() {
        return this.preview;
    }

    /**
     * @param preview the text to set
     */
    public void setPreview(final String preview) {
        this.preview = preview;
    }

}
