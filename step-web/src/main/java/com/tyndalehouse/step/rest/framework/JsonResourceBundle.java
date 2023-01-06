package com.tyndalehouse.step.rest.framework;

import org.codehaus.jackson.annotate.JsonAnyGetter;

import java.util.*;

/**
 * This wraps around a ResourceBundle, to be able to serialize as JSON
 */
public class JsonResourceBundle {
    private final List<ResourceBundle> bundle;

    /**
     * Instantiates a new json resource bundle.
     *
     * @param bundle the bundle
     */
    public JsonResourceBundle(final List<ResourceBundle> bundle) {
        this.bundle = bundle;
    }

    /**
     * Gets the messages.
     *
     * @return the messages
     */
    @JsonAnyGetter
    public Map<String, String> getMessages() {
        final Map<String, String> messages = new HashMap<String, String>();

        for (ResourceBundle rb : this.bundle) {
            final Enumeration<String> keys = rb.getKeys();
            while (keys.hasMoreElements()) {
                final String key = keys.nextElement();
                messages.put(key, rb.getString(key));
            }
        }
        return messages;
    }
}
