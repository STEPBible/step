package com.tyndalehouse.step.core.models;

/**
 * An option that was removed because it was incompatible with how a passage was being looked up
 */
public class TrimmedLookupOption {
    private String explanation;
    private LookupOption option;

    /**
     * for serialisation
     */
    public TrimmedLookupOption() {
        // serialisation
    }

    /**
     * @param explanation the explanation of why something was removed
     * @param option the option that was removed
     */
    public TrimmedLookupOption(final String explanation, final LookupOption option) {
        this.explanation = explanation;
        this.option = option;
    }

    /**
     * @return the explanation
     */
    public String getExplanation() {
        return this.explanation;
    }

    /**
     * @param explanation the explanation to set
     */
    public void setExplanation(final String explanation) {
        this.explanation = explanation;
    }

    /**
     * @return the option
     */
    public LookupOption getOption() {
        return this.option;
    }

    /**
     * @param option the option to set
     */
    public void setOption(final LookupOption option) {
        this.option = option;
    }
}
