package com.tyndalehouse.step.core.data.analyzers;

import org.apache.lucene.analysis.KeywordAnalyzer;
import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.util.Version;

/**
 * Class to analyze various definition fields
 * 
 * @author chrisburrell
 * 
 */
public class DefinitionAnalyzer extends PerFieldAnalyzerWrapper {

    /**
     * Initialises the analyzer
     * 
     * @param matchVersion the lucene version
     */
    public DefinitionAnalyzer(final Version matchVersion) {
        super(new StandardAnalyzer(matchVersion));
        final TransliterationAnalyzer transliteration = new TransliterationAnalyzer();
        addAnalyzer("otherTransliteration", transliteration);
        addAnalyzer("simplifiedStepTransliteration", transliteration);
        addAnalyzer("betaAccented", new BetaAccentedAnalyzer());
        addAnalyzer("accentedUnicode", new AncientLanguageAnalyzer());
        addAnalyzer("strongNumber", new KeywordAnalyzer());
        addAnalyzer("relatedNumbers", new CommaDelimitedAnalyzer());
    }
}
