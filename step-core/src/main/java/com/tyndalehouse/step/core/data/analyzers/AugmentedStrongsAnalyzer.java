package com.tyndalehouse.step.core.data.analyzers;

import org.apache.lucene.analysis.KeywordAnalyzer;
import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.WhitespaceAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.util.Version;

import javax.inject.Inject;

import static org.apache.lucene.util.Version.LUCENE_30;

/**
 * Provides basic analysis of fields used in augmented strongs
 * 
 * @author chrisburrell
 * 
 */
public class AugmentedStrongsAnalyzer extends PerFieldAnalyzerWrapper {

    /**
     * the augmented strongs analyser
     */
    @Inject
    public AugmentedStrongsAnalyzer() {
        super(new StandardAnalyzer(LUCENE_30));
        addAnalyzer("references", new ReferenceAnalyzer());
    }
}
