package com.tyndalehouse.step.core.models;

import com.tyndalehouse.step.core.service.impl.SearchType;
import com.tyndalehouse.step.core.utils.HeadingsUtil;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.crosswire.jsword.passage.Key;
import org.crosswire.jsword.versification.Versification;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * A simple wrapper around a string for returning as a JSON-mapped object
 */
public class OsisWrapper extends AbstractComplexSearch implements Serializable {
    private static final long serialVersionUID = -5651330317995494895L;
    @JsonIgnore
    private final Key key;
    private KeyWrapper previousChapter;
    private KeyWrapper nextChapter;
    private String value;
    private String reference;
    private String osisId;
    private boolean fragment;
    private boolean multipleRanges;
    private int startRange;
    private int endRange;
    private final String[] languageCode;
    private final String longName;

    private Map<String, List<LexiconSuggestion>> strongNumbers;
    private String options;
    private String selectedOptions;
    private List<TrimmedLookupOption> removedOptions;

    /**
     * the value to be wrapped
     * 
     * @param value the value to be wrapped around
     * @param key the key that was used to lookup the text
     * @param languageCode the ISO language code
     * @param v11n the versification system used
     */
    public OsisWrapper(final String value, 
                       final Key key, final String[] languageCode, 
                       final Versification v11n,
                       final String masterVersion, 
                       final InterlinearMode interlinearMode, 
                       final String extraVersions) {
        this.value = value;
        this.key = key;
        super.setInterlinearMode(interlinearMode);
        this.reference = key.getName();
        this.longName = HeadingsUtil.getLongHeader(v11n, key);
        this.osisId = key.getOsisID();
        this.languageCode = languageCode;
        super.setMasterVersion(masterVersion);
        super.setExtraVersions(extraVersions);
        super.setSearchType(SearchType.PASSAGE);
    }

    /**
     * @return the value to be returned
     */
    public String getValue() {
        return this.value;
    }

    /**
     * @return the reference
     */
    public String getReference() {
        return this.reference;
    }

    /**
     * @param fragment the fragment to set
     */
    public void setFragment(final boolean fragment) {
        this.fragment = fragment;
    }

    /**
     * @return the fragment
     */
    public boolean isFragment() {
        return this.fragment;
    }

    /**
     * @param value the value to set
     */
    public void setValue(final String value) {
        this.value = value;
    }

    /**
     * @param reference the reference to set
     */
    public void setReference(final String reference) {
        this.reference = reference;
    }

    /**
     * @return the startRange
     */
    public int getStartRange() {
        return this.startRange;
    }

    /**
     * @param startRange the startRange to set
     */
    public void setStartRange(final int startRange) {
        this.startRange = startRange;
    }

    /**
     * @return the endRange
     */
    public int getEndRange() {
        return this.endRange;
    }

    /**
     * @param endRange the endRange to set
     */
    public void setEndRange(final int endRange) {
        this.endRange = endRange;
    }

    /**
     * @return the isMultipleRanges
     */
    public boolean isMultipleRanges() {
        return this.multipleRanges;
    }

    /**
     * @param hasMultipleRanges the isMultipleRanges to set
     */
    public void setMultipleRanges(final boolean hasMultipleRanges) {
        this.multipleRanges = hasMultipleRanges;
    }

    /**
     * @return the languageCode
     */
    public String[] getLanguageCode() {
        return this.languageCode;
    }

    /**
     * @return the osisId
     */
    public String getOsisId() {
        return this.osisId;
    }

    /**
     * @param osisId the osisId to set
     */
    public void setOsisId(final String osisId) {
        this.osisId = osisId;
    }

    /**
     * @return the longName
     */
    public String getLongName() {
        return this.longName;
    }

    /**
     * Sets the strong numbers.
     * 
     * @param strongNumbers the verse strongs
     */
    public void setStrongNumbers(final Map<String, List<LexiconSuggestion>> strongNumbers) {
        this.strongNumbers = strongNumbers;
    }

    /**
     * @return the strongNumbers
     */
    public Map<String, List<LexiconSuggestion>> getStrongNumbers() {
        return this.strongNumbers;
    }

    /**
     * @return the options available to this particular passage
     */
    public String getOptions() {
        return options;
    }

    /**
     * @param options options available for this passage.
     */
    public void setOptions(final String options) {
        this.options = options;
    }

    /**
     * @param selectedOptions the options used for this passage
     */
    public void setSelectedOptions(final String selectedOptions) {
        this.selectedOptions = selectedOptions;
    }

    /**
     * @return the selected options that were used for the passage
     */
    public String getSelectedOptions() {
        return selectedOptions;
    }

    /**
     * @return a JSword key
     */
    public Key getKey(){ 
        return this.key;
    }

    /**
     * @return the previous chapter
     */
    public KeyWrapper getPreviousChapter() {
        return previousChapter;
    }

    /**
     * @return the next chapter
     */
    public KeyWrapper getNextChapter() {
        return nextChapter;
    }

    /**
     * 
     * @param previousChapter previous  chapter for this passage
     */
    public void setPreviousChapter(final KeyWrapper previousChapter) {
        this.previousChapter = previousChapter;
    }

    /**
     * @param nextChapter next chapter for this passage
     */
    public void setNextChapter(final KeyWrapper nextChapter) {
        this.nextChapter = nextChapter;
    }

    public void setRemovedOptions(final List<TrimmedLookupOption> removedOptions) {
        this.removedOptions = removedOptions;
    }

    /**
     * @return a list of all trimmed options
     */
    public List<TrimmedLookupOption> getRemovedOptions() {
        return removedOptions;
    }

}
