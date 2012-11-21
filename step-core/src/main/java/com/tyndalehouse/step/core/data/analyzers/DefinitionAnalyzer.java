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
    public DefinitionAnalyzer() {
        super(new KeywordAnalyzer());
        final StandardAnalyzer standard = new StandardAnalyzer(Version.LUCENE_30);
        final KeywordAnalyzer keyword = new KeywordAnalyzer();
        final TransliterationAnalyzer transliteration = new TransliterationAnalyzer();
        addAnalyzer("accentedUnicode", new AncientLanguageAnalyzer());
        addAnalyzer("strongNumber", keyword);
        addAnalyzer("relatedNumbers", new CommaDelimitedAnalyzer());
        addAnalyzer("stepGloss", standard);
        addAnalyzer("betaAccented", new BetaAccentedAnalyzer());
        addAnalyzer("twoLetter", keyword);
        addAnalyzer("otherTransliteration", transliteration);
        addAnalyzer("simplifiedStepTransliteration", transliteration);
        addAnalyzer("translations", standard);
    }
}
