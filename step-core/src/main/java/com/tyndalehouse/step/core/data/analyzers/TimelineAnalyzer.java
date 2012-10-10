package com.tyndalehouse.step.core.data.analyzers;

import org.apache.lucene.analysis.KeywordAnalyzer;
import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.WhitespaceAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.util.Version;

/**
 * Geography analyzer
 * 
 * @author chrisburrell
 * 
 */
public class TimelineAnalyzer extends PerFieldAnalyzerWrapper {
    /**
     * The geography analyzer
     */
    public TimelineAnalyzer() {
        super(new StandardAnalyzer(Version.LUCENE_30));
        addAnalyzer("id", new KeywordAnalyzer());
        addAnalyzer("references", new WhitespaceAnalyzer());
    }
}
