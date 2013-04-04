package com.tyndalehouse.step.core.models;

import java.util.List;

/**
 * Features that are available to a particular version/displayMode with explanations of why others aren't
 * 
 * @author chrisburrell
 * 
 */
public class AvailableFeatures {
    private List<LookupOption> options;
    private List<TrimmedLookupOption> removed;

    /**
     * serialisation
     */
    public AvailableFeatures() {
        // for serialisation
    }

    /**
     * @param options a list of available options
     * @param removed a list of options that were removed and the explanations of why
     */
    public AvailableFeatures(final List<LookupOption> options, final List<TrimmedLookupOption> removed) {
        this.options = options;
        this.removed = removed;
    }

    /**
     * @return the options
     */
    public List<LookupOption> getOptions() {
        return this.options;
    }

    /**
     * @return the removed
     */
    public List<TrimmedLookupOption> getRemoved() {
        return this.removed;
    }
}
