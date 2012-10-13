package com.tyndalehouse.step.core.data.analyzers;

import static org.apache.lucene.util.Version.LUCENE_30;

import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.standard.StandardAnalyzer;

/**
 * analyzes Nave modules
 * 
 * @author chrisburrell
 * 
 */
public class NaveAnalyzer extends PerFieldAnalyzerWrapper {
    /**
     * nave analyzer
     */
    public NaveAnalyzer() {
        super(new StandardAnalyzer(LUCENE_30));
        final PorterStemmerAnalyzer portStemmerAnalyzer = new PorterStemmerAnalyzer();
        addAnalyzer("fullHeader", portStemmerAnalyzer);
        addAnalyzer("rootStem", portStemmerAnalyzer);
    }
}
