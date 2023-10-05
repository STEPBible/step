package com.tyndalehouse.step.models.info;

import java.util.List;

/**
 * A set of information from various sources
 */
public class Info {
    private List<MorphInfo> morphInfos;
    private List<VocabInfo> vocabInfos;

    /**
     * @return the morphInfos
     */
    public List<MorphInfo> getMorphInfos() {
        return this.morphInfos;
    }

    /**
     * @param morphInfos the morphInfos to set
     */
    public void setMorphInfos(final List<MorphInfo> morphInfos) {
        this.morphInfos = morphInfos;
    }

    /**
     * @return the vocabInfos
     */
    public List<VocabInfo> getVocabInfos() {
        return this.vocabInfos;
    }

    /**
     * @param vocabInfos the vocabInfos to set
     */
    public void setVocabInfos(final List<VocabInfo> vocabInfos) {
        this.vocabInfos = vocabInfos;
    }
}
