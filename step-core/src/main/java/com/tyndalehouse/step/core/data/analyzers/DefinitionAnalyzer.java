package com.tyndalehouse.step.core.data.analyzers;

import org.apache.lucene.analysis.KeywordAnalyzer;
import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.util.Version;

/**
 * Class to analyze various definition fields
 */
public class DefinitionAnalyzer extends PerFieldAnalyzerWrapper {

    /**
     * Initialises the analyzer.
     * It is an assumption of the code that stepGloss and translations use the same type of analyzer
     * relies on sharing the same analyzer for both stepGloss and translations
     */
    public DefinitionAnalyzer() {
        super(new KeywordAnalyzer());
        final StandardAnalyzer standard = new StandardAnalyzer(Version.LUCENE_30);
        final KeywordAnalyzer keyword = new KeywordAnalyzer();
        final TransliterationAnalyzer transliteration = new TransliterationAnalyzer();
        final PorterStemmerAnalyzer porterStemmerAnalyzer = new PorterStemmerAnalyzer();
        addAnalyzer("accentedUnicode", new AncientLanguageAnalyzer());
        addAnalyzer("strongNumber", keyword);
        addAnalyzer("relatedNumbers", new CommaDelimitedAnalyzer());
        
        //it is an assumption of the code that stepGloss and translations use the same type of analyzer - see above 
        //javadoc comment
        addAnalyzer("stepGloss", standard);
        addAnalyzer("translations", standard);
        addAnalyzer("translationsStem", porterStemmerAnalyzer);
        addAnalyzer("stepGlossStem", porterStemmerAnalyzer);
        addAnalyzer("betaAccented", new BetaAccentedAnalyzer());
        addAnalyzer("twoLetter", keyword);
        addAnalyzer("otherTransliteration", transliteration);
        addAnalyzer("simplifiedStepTransliteration", transliteration);
    }
}
