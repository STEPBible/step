package com.tyndalehouse.step.core.data.analyzers;

import org.apache.lucene.analysis.KeywordAnalyzer;
import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.util.Version;

/**
 * Analyzer for specific forms
 * 
 * @author chrisburrell
 * 
 */
public class SpecificFormAnalyzer extends PerFieldAnalyzerWrapper {
    /**
     * sets up the fields for the analyzer
     * 
     * @param version the version
     */
    public SpecificFormAnalyzer(final Version version) {
        super(new StandardAnalyzer(version));

        addAnalyzer("strongNumber", new KeywordAnalyzer());
        addAnalyzer("accentedUnicode", new AncientLanguageAnalyzer());
        addAnalyzer("simplifiedStepTransliteration", new TransliterationAnalyzer());
    }
}
