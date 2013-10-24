package com.tyndalehouse.step.core.data.analyzers;

import static org.apache.lucene.util.Version.LUCENE_30;

import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.WhitespaceAnalyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;

import javax.inject.Inject;

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
    @Inject
    public NaveAnalyzer() {
        super(new StandardAnalyzer(LUCENE_30));
        final PorterStemmerAnalyzer portStemmerAnalyzer = new PorterStemmerAnalyzer();
        addAnalyzer("fullHeader", portStemmerAnalyzer);
        addAnalyzer("fullHeaderAnalyzed", portStemmerAnalyzer);
        addAnalyzer("rootStem", portStemmerAnalyzer);
        addAnalyzer("expandedReferences", new ReferenceAnalyzer());
        addAnalyzer("fullTerm", new WhitespaceAnalyzer());
    }
}
