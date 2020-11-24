//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119package com.tyndalehouse.step.core.data.analyzers;
//pt20201119
//pt20201119import org.apache.lucene.analysis.KeywordAnalyzer;
//pt20201119import org.apache.lucene.analysis.PerFieldAnalyzerWrapper;
//pt20201119import org.apache.lucene.analysis.WhitespaceAnalyzer;
//pt20201119
//pt20201119/**
//pt20201119 * Geography analyzer
//pt20201119 *
//pt20201119 * @author chrisburrell
//pt20201119 *
//pt20201119 */
//pt20201119public class GeographyAnalyzer extends PerFieldAnalyzerWrapper {
//pt20201119    /**
//pt20201119     * The geography analyzer
//pt20201119     */
//pt20201119    public GeographyAnalyzer() {
//pt20201119        super(new KeywordAnalyzer());
//pt20201119        addAnalyzer("references", new WhitespaceAnalyzer());
//pt20201119    }
//pt20201119}
