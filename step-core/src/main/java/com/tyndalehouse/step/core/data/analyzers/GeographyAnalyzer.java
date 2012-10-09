package com.tyndalehouse.step.core.data.analyzers;

import org.apache.lucene.analysis.KeywordAnalyzer;
import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.WhitespaceAnalyzer;

/**
 * Geography analyzer
 * 
 * @author chrisburrell
 * 
 */
public class GeographyAnalyzer extends PerFieldAnalyzerWrapper {
    /**
     * The geography analyzer
     */
    public GeographyAnalyzer() {
        super(new KeywordAnalyzer());
        addAnalyzer("references", new WhitespaceAnalyzer());
    }
}
