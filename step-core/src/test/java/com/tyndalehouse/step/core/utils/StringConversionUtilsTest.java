/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.utils;

import static com.tyndalehouse.step.core.utils.StringConversionUtils.adaptTransliterationForQuerying;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.getAnyKey;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.getStrongLanguageSpecificKey;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.getStrongPaddedKey;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.transliterate;
import static com.tyndalehouse.step.core.utils.StringConversionUtils.unAccent;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.*;
import java.util.List;
import java.util.regex.Pattern;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.utils.language.transliteration.TransliterationOption;

/**
 * Tests the utility method for converting strings
 * 
 * @author chrisburrell
 * 
 */
public class StringConversionUtilsTest {
    private static final Logger LOG = LoggerFactory.getLogger(StringConversionUtilsTest.class);

    /**
     * testing the hebrew rules for searching a transliteration
     */
    @Test
    public void testHebrewConversionToQuerying() {
        assertListIs(new String[] { "hesed", "heshed", "hetsed" },
                adaptTransliterationForQuerying("hesed", false));

        assertListIs(new String[] { "achab", "ahab" }, adaptTransliterationForQuerying("achab", false));
        assertListIs(new String[] { "a+a", "ata" }, adaptTransliterationForQuerying("a+a", false));
        assertListIs(new String[] { "atsad", "atzad" }, adaptTransliterationForQuerying("atzad", false));
    }

    /**
     * testing the hebrew rules for searching a transliteration
     */
    @Test
    public void testGreekConversionToQuerying() {
        assertListIs(new String[] { "arhop", "arop", "arhowp", "arowp" },
                adaptTransliterationForQuerying("arhop", true));

        assertListIs(new String[] { "aggphab", "angphab", "angfab", "aggfab" },
                adaptTransliterationForQuerying("aggphab", true));

    }

    /**
     * asserts that options are in translits
     * 
     * @param options some words
     * @param translits the results from the test
     */
    private void assertListIs(final String[] options, final List<TransliterationOption> translits) {
        for (final String o : options) {
            assertTrue("Options do not contain " + o,
                    translits.contains(new TransliterationOption(0, new StringBuilder(o))));
        }
        assertEquals(options.length, translits.size());
    }

    /**
     * tests that getAnyKey returns the right portion of the string for different keys
     */
    @Test
    public void testGetAnyKey() {
        assertEquals(getAnyKey("strong:H1"), "1");
        assertEquals(getAnyKey("strong:H123"), "123");
        assertEquals(getAnyKey("strong:G1"), "1");
        assertEquals(getAnyKey("strong:G123"), "123");
        assertEquals(getAnyKey("G123"), "123");
        assertEquals(getAnyKey("H123"), "123");
        assertEquals(getAnyKey("123"), "123");
        assertEquals(getAnyKey("strong:G00123"), "123");
    }

    /**
     * Tests that strong: is stripped off
     */
    @Test
    public void testGetStrongSpecificKey() {
        assertEquals("G1020", getStrongLanguageSpecificKey("STRONG:G1020"));
    }

    /**
     * Tests that strong numbers are returned padded
     */
    @Test
    public void testGetStrongPaddedKey() {
        assertEquals("", getStrongPaddedKey(null));
        assertEquals("", getStrongPaddedKey(""));
        assertEquals("G", getStrongPaddedKey("G"));
        assertEquals("H", getStrongPaddedKey("H"));
        assertEquals("000A", getStrongPaddedKey("A"));
        assertEquals("G1020", getStrongPaddedKey("strong:G1020"));
        assertEquals("G0001", getStrongPaddedKey("strong:G1"));
        assertEquals("G0012", getStrongPaddedKey("strong:G12"));
        assertEquals("G0123", getStrongPaddedKey("strong:G123"));
        assertEquals("G1234", getStrongPaddedKey("strong:G1234"));
        assertEquals("H0123", getStrongPaddedKey("strong:H123"));
        assertEquals("0001", getStrongPaddedKey("strong:1"));
        assertEquals("0012", getStrongPaddedKey("strong:12"));
        assertEquals("0123", getStrongPaddedKey("strong:123"));
        assertEquals("1234", getStrongPaddedKey("strong:1234"));
        assertEquals("H1234 H5678", getStrongPaddedKey("H01234 H5678"));
    }

    /**
     * Testing transliteration of the greek
     */
    @Test
    public void testTransliterateGreek() {
        final String transliterate = StringConversionUtils.transliterate("");
        LOG.debug(transliterate);
        assertEquals("hēn", outputAndTestTransliterate("ἣν"));
        assertEquals("hōde", outputAndTestTransliterate("ὧδε"));
        assertEquals("salpingos", outputAndTestTransliterate("σάλπιγγος"));
        assertEquals("lalousēs", outputAndTestTransliterate("λαλούσης"));
        assertEquals("adikēsēs", outputAndTestTransliterate("ἀδικήσῃς"));
        assertEquals("hote", outputAndTestTransliterate("ὅτε"));
        assertEquals("heote", outputAndTestTransliterate("εὅτε"));

        assertEquals("angelon", outputAndTestTransliterate("ἄγγελον"));
        assertEquals("prosenenke", outputAndTestTransliterate("προσένεγκε"));
        assertEquals("splanchnistheis", outputAndTestTransliterate("σπλαγχνισθεὶς"));

        assertEquals("psuchēn", outputAndTestTransliterate("ψυχὴν"));
        assertEquals("farisaioi", outputAndTestTransliterate("Φαρισαῖοι"));
        assertEquals("hērōdianōn", outputAndTestTransliterate("Ἡρῳδιανῶν"));

        assertEquals("ioudaias", outputAndTestTransliterate("Ἰουδαίας"));
        assertEquals("hierosolumōn", outputAndTestTransliterate("Ἱεροσολύμων"));
        assertEquals("mastigas", outputAndTestTransliterate("μάστιγας"));

        assertEquals("exērammenēn", outputAndTestTransliterate("ἐξηραμμένην"));
    }

//    @Test
//    public void testTransliterateHebrewFromFile() throws IOException {
//    final Pattern p = Pattern.compile("[*.]*");
//
//    final FileReader reader = new FileReader(new File("c:\\temp\\sample.txt"));
//    final BufferedReader br = new BufferedReader(reader);
//    final FileWriter writer = new FileWriter(new File("c:\\temp\\hebrew-out.txt"));
//    final BufferedWriter bw = new BufferedWriter(writer, 4 * 1024 * 1024);
//
//    final long start = System.currentTimeMillis();
//    int lineNumber = 0;
//    String line;
//
//    while ((line = br.readLine()) != null) {
//    final String[] split = line.split(",");
//    bw.write(Integer.toString(lineNumber));
//    bw.write('\t');
//    // bw.write(split[0]);
//    // bw.write('\t');
//    bw.write(split[1]);
//    bw.write('\t');
//
//    try {
//    final String translit = transliterate(split[1]);
//    bw.write(p.matcher(translit).replaceAll(""));
//    bw.write('\t');
//    bw.write(translit);
//
//    } catch (final Exception e) {
//    // error
//    bw.write("ERROR: ");
//    bw.write(e.toString());
//    }
//
//    bw.newLine();
//    lineNumber++;
//
//    if ((lineNumber % 2000) == 0) {
//    reportProgress(start, lineNumber);
//    }
//    }
//
//    br.close();
//    bw.close();
//
//    reportProgress(start, lineNumber);
//    }
//
//    /**
//    * outputs the time taken so far and the number of items processed
//    *
//    * @param start the time at which we started
//    * @param lineNumber the number of items processed
//    */
//    private void reportProgress(final long start, final int lineNumber) {
//    System.out.println(String.format("Took %dms to do %d transliterations", System.currentTimeMillis()
//    - start, lineNumber));
//    }

    /**
     * Tests the hebrew transliterations does not throw exceptions
     */
    @Test
    public void testTransliterateHebrew1() {

        outputAndTestTransliterate("וְ֝יָב֗וֹא");
        outputAndTestTransliterate("בָּרָ֣א");
        outputAndTestTransliterate("אֱלֹהִ֑ים");
        outputAndTestTransliterate("אֵ֥ת");
        outputAndTestTransliterate("הַשָּׁמַ֖יִם");
        outputAndTestTransliterate("וְאֵ֥ת");
        outputAndTestTransliterate("הָאָֽרֶץ");
        outputAndTestTransliterate("בִּרְקִ֣יעַ");
        outputAndTestTransliterate("הַשָּׁמַ֔יִם");
        outputAndTestTransliterate("לְהַבְדִּ֕יל");
        outputAndTestTransliterate("בֵּ֥ין");
        outputAndTestTransliterate("הַיּ֖וֹם");
        outputAndTestTransliterate("וּבֵ֣ין");
        outputAndTestTransliterate("הַלָּ֑יְלָה");

        outputAndTestTransliterate("חַבַהַ");
        outputAndTestTransliterate("עַבַעַ");
        outputAndTestTransliterate("הַבַהַ");
        outputAndTestTransliterate("הַהַהַ");
        outputAndTestTransliterate("שׁוַּהַ");
        outputAndTestTransliterate("שׂוָּהַ");
        outputAndTestTransliterate("שַּׁוְּטֶה");
        outputAndTestTransliterate("בֵוֶּי");
        outputAndTestTransliterate("דֹוֵּת");
        outputAndTestTransliterate("דֹוִּע");
        outputAndTestTransliterate("פּוִּךְ");
        outputAndTestTransliterate("גֶּוִּי");
        outputAndTestTransliterate("כֻּוּוֹ");
        outputAndTestTransliterate("דּוֻּן");
        outputAndTestTransliterate("תּוָֹף");
    }

    /**
     * Transliterates some hebrew
     */
    @Test
    public void testTransliterateHebrew() {
        assertEquals("has.sha.ma.yim", outputAndTestTransliterate("הַשָּׁמַ֔יִם"));
        assertEquals("le.hav.dil", outputAndTestTransliterate("לְהַבְדִּ֕יל"));
        assertEquals("ben", outputAndTestTransliterate("בֵּ֥ין"));
        assertEquals("hay.yom", outputAndTestTransliterate("הַיּ֖וֹם"));
        assertEquals("u.ven", outputAndTestTransliterate("וּבֵ֣ין"));
        assertEquals("hal.la.ye.lah", outputAndTestTransliterate("הַלָּ֑יְלָה"));
        assertEquals("cha.va.ah", outputAndTestTransliterate("חַבַהַ"));
        assertEquals("a.va.a", outputAndTestTransliterate("עַבַעַ"));
        assertEquals("ha.va.ah", outputAndTestTransliterate("הַבַהַ"));
        assertEquals("ha.ha.ah", outputAndTestTransliterate("הַהַהַ"));
        assertEquals("shv.va.ah", outputAndTestTransliterate("שׁוַּהַ"));
        assertEquals("sv.va.ah", outputAndTestTransliterate("שׂוָּהַ"));
        assertEquals("shav.v.teh", outputAndTestTransliterate("שַּׁוְּטֶה"));
        assertEquals("be.v.vey", outputAndTestTransliterate("בֵוֶּי"));
        assertEquals("do.v.vet", outputAndTestTransliterate("דֹוֵּת"));
        assertEquals("do.v.vi", outputAndTestTransliterate("דֹוִּע"));
        assertEquals("pv.vikh", outputAndTestTransliterate("פּוִּךְ"));
        assertEquals("gev.vi", outputAndTestTransliterate("גֶּוִּי"));
        assertEquals("kuuo", outputAndTestTransliterate("כֻּוּוֹ"));
        assertEquals("dv.vun", outputAndTestTransliterate("דּוֻּן"));
        assertEquals("t.voaph", outputAndTestTransliterate("תּוָֹף"));
        assertEquals("ben-am.mi", outputAndTestTransliterate("בֶּן־עַמִּי"));
        assertEquals("ru.ach", outputAndTestTransliterate("רוּחַ"));
        assertEquals("mal.ki", outputAndTestTransliterate("מַלְכִּ֥י"));
        assertEquals("mish.pe.chot", outputAndTestTransliterate("מִשְׁפְּחֹת"));
        assertEquals("re.shit", outputAndTestTransliterate("רֵאשִׁית"));
//        assertEquals("en.mish.pat", outputAndTestTransliterate("עֵין מִשְׁפָּט"));
    }

    /**
     * A helper method that logs the transliterations
     * 
     * @param s the string to transliterate
     * @return the transliteration
     */
    private String outputAndTestTransliterate(final String s) {
        final String transliterate = transliterate(s);
        LOG.debug("[{}] \t transliterates to\t [{}]", s, transliterate);
        return transliterate;
    }

    /**
     * tests hebrew pointing being removed
     */
    @Test
    public void testUnaccentedHebrewPointingForms() {
        final String source = " ֑֖֛֚֒֓֔֕֗֘֙֜֝֞֟    ֢֣֤֥֦֧֪֭֮֠֡֨֩֫֬֯    ְֱֲֳִֵֶַָֹֺֻּֽ־ֿ    ׀ׁׂ׃ׅׄ׆ׇ";
        final String expected = "";

        assertEquals(expected.trim(), StringConversionUtils.unAccent(source, false).trim());
    }

    /**
     * tests hebrew vowels being removed
     */
    @Test
    public void testUnaccentedHebrewOtherForms() {
        final String sourceWord = "בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃";
        final String unAccent = unAccent(sourceWord, false);
        assertEquals("בראשית ברא אלהים את השמים ואת הארץ".trim(), unAccent.trim());

        final String s = "1בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃  2וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ וְחֹ֖שֶׁךְ עַל־פְּנֵ֣י תְהֹ֑ום וְר֣וּחַ אֱלֹהִ֔ים מְרַחֶ֖פֶת עַל־פְּנֵ֥י הַמָּֽיִם׃  3וַיֹּ֥אמֶר אֱלֹהִ֖ים יְהִ֣י אֹ֑ור וַֽיְהִי־אֹֽור׃  4וַיַּ֧רְא אֱלֹהִ֛ים אֶת־הָאֹ֖ור כִּי־טֹ֑וב וַיַּבְדֵּ֣ל אֱלֹהִ֔ים בֵּ֥ין הָאֹ֖ור וּבֵ֥ין הַחֹֽשֶׁךְ׃  5וַיִּקְרָ֨א אֱלֹהִ֤ים ׀ לָאֹור֙ יֹ֔ום וְלַחֹ֖שֶׁךְ קָ֣רָא לָ֑יְלָה וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר יֹ֥ום אֶחָֽד׃ פ  6וַיֹּ֣אמֶר אֱלֹהִ֔ים יְהִ֥י רָקִ֖יעַ בְּתֹ֣וךְ הַמָּ֑יִם וִיהִ֣י מַבְדִּ֔יל בֵּ֥ין מַ֖יִם לָמָֽיִם׃  7וַיַּ֣עַשׂ אֱלֹהִים֮ אֶת־הָרָקִיעַ֒ וַיַּבְדֵּ֗ל בֵּ֤ין הַמַּ֙יִם֙ אֲשֶׁר֙ מִתַּ֣חַת לָרָקִ֔יעַ וּבֵ֣ין הַמַּ֔יִם אֲשֶׁ֖ר מֵעַ֣ל לָרָקִ֑יעַ וַֽיְהִי־כֵֽן׃  8וַיִּקְרָ֧א אֱלֹהִ֛ים לָֽרָקִ֖יעַ שָׁמָ֑יִם וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר יֹ֥ום שֵׁנִֽי׃ פ  9וַיֹּ֣אמֶר אֱלֹהִ֗ים יִקָּו֨וּ הַמַּ֜יִם מִתַּ֤חַת הַשָּׁמַ֙יִם֙ אֶל־מָקֹ֣ום אֶחָ֔ד וְתֵרָאֶ֖ה הַיַּבָּשָׁ֑ה וַֽיְהִי־כֵֽן׃  10וַיִּקְרָ֨א אֱלֹהִ֤ים ׀ לַיַּבָּשָׁה֙ אֶ֔רֶץ וּלְמִקְוֵ֥ה הַמַּ֖יִם קָרָ֣א יַמִּ֑ים וַיַּ֥רְא אֱלֹהִ֖ים כִּי־טֹֽוב׃  11וַיֹּ֣אמֶר אֱלֹהִ֗ים תַּֽדְשֵׁ֤א הָאָ֙רֶץ֙ דֶּ֔שֶׁא עֵ֚שֶׂב מַזְרִ֣יעַ זֶ֔רַע עֵ֣ץ פְּרִ֞י עֹ֤שֶׂה פְּרִי֙ לְמִינֹ֔ו אֲשֶׁ֥ר זַרְעֹו־בֹ֖ו עַל־הָאָ֑רֶץ וַֽיְהִי־כֵֽן׃  12וַתֹּוצֵ֨א הָאָ֜רֶץ דֶּ֠שֶׁא עֵ֣שֶׂב מַזְרִ֤יעַ זֶ֙רַע֙ לְמִינֵ֔הוּ וְעֵ֧ץ עֹֽשֶׂה־פְּרִ֛יa אֲשֶׁ֥ר זַרְעֹו־בֹ֖ו לְמִינֵ֑הוּ וַיַּ֥רְא אֱלֹהִ֖ים כִּי־טֹֽוב׃  13וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר יֹ֥ום שְׁלִישִֽׁי׃ פ  14וַיֹּ֣אמֶר אֱלֹהִ֗ים יְהִ֤י מְאֹרֹת֙ בִּרְקִ֣יעַ הַשָּׁמַ֔יִם לְהַבְדִּ֕יל בֵּ֥ין הַיֹּ֖ום וּבֵ֣ין הַלָּ֑יְלָה וְהָי֤וּ לְאֹתֹת֙ וּלְמֹ֣ועֲדִ֔ים וּלְיָמִ֖ים וְשָׁנִֽים׃  15וְהָי֤וּ לִמְאֹורֹת֙ בִּרְקִ֣יעַ הַשָּׁמַ֔יִם לְהָאִ֖יר עַל־הָאָ֑רֶץ וַֽיְהִי־כֵֽן׃  16וַיַּ֣עַשׂ אֱלֹהִ֔ים אֶת־שְׁנֵ֥י הַמְּאֹרֹ֖ת הַגְּדֹלִ֑ים אֶת־הַמָּאֹ֤ור הַגָּדֹל֙ לְמֶמְשֶׁ֣לֶת הַיֹּ֔ום וְאֶת־הַמָּאֹ֤ור הַקָּטֹן֙ לְמֶמְשֶׁ֣לֶת הַלַּ֔יְלָה וְאֵ֖ת הַכֹּוכָבִֽים׃  17וַיִּתֵּ֥ן אֹתָ֛ם אֱלֹהִ֖ים בִּרְקִ֣יעַ הַשָּׁמָ֑יִם לְהָאִ֖יר עַל־הָאָֽרֶץ׃  18וְלִמְשֹׁל֙ בַּיֹּ֣ום וּבַלַּ֔יְלָה וּֽלֲהַבְדִּ֔יל בֵּ֥ין הָאֹ֖ור וּבֵ֣ין הַחֹ֑שֶׁךְ וַיַּ֥רְא אֱלֹהִ֖ים כִּי־טֹֽוב׃  19וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר יֹ֥ום רְבִיעִֽי׃ פ  20וַיֹּ֣אמֶר אֱלֹהִ֔ים יִשְׁרְצ֣וּ הַמַּ֔יִם שֶׁ֖רֶץ נֶ֣פֶשׁ חַיָּ֑ה וְעֹוף֙ יְעֹופֵ֣ף עַל־הָאָ֔רֶץ עַל־פְּנֵ֖י רְקִ֥יעַ הַשָּׁמָֽיִם׃  21וַיִּבְרָ֣א אֱלֹהִ֔ים אֶת־הַתַּנִּינִ֖ם הַגְּדֹלִ֑ים וְאֵ֣ת כָּל־נֶ֣פֶשׁ הַֽחַיָּ֣ה ׀ הָֽרֹמֶ֡שֶׂת אֲשֶׁר֩ שָׁרְצ֨וּ הַמַּ֜יִם לְמִֽינֵהֶ֗ם וְאֵ֨ת כָּל־עֹ֤וף כָּנָף֙ לְמִינֵ֔הוּ וַיַּ֥רְא אֱלֹהִ֖ים כִּי־טֹֽוב׃  22וַיְבָ֧רֶךְ אֹתָ֛ם אֱלֹהִ֖ים לֵאמֹ֑ר פְּר֣וּ וּרְב֗וּ וּמִלְא֤וּ אֶת־הַמַּ֙יִם֙ בַּיַּמִּ֔ים וְהָעֹ֖וף יִ֥רֶב בָּאָֽרֶץ׃  23וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר יֹ֥ום חֲמִישִֽׁי׃ פ  24וַיֹּ֣אמֶר אֱלֹהִ֗ים תֹּוצֵ֨א הָאָ֜רֶץ נֶ֤פֶשׁ חַיָּה֙ לְמִינָ֔הּ בְּהֵמָ֥ה וָרֶ֛מֶשׂ וְחַֽיְתֹו־אֶ֖רֶץ לְמִינָ֑הּ וַֽיְהִי־כֵֽן׃  25וַיַּ֣עַשׂ אֱלֹהִים֩ אֶת־חַיַּ֨ת הָאָ֜רֶץ לְמִינָ֗הּ וְאֶת־הַבְּהֵמָה֙ לְמִינָ֔הּ וְאֵ֛ת כָּל־רֶ֥מֶשׂ הָֽאֲדָמָ֖ה לְמִינֵ֑הוּ וַיַּ֥רְא אֱלֹהִ֖ים כִּי־טֹֽוב׃  26וַיֹּ֣אמֶר אֱלֹהִ֔ים נַֽעֲשֶׂ֥ה אָדָ֛ם בְּצַלְמֵ֖נוּ כִּדְמוּתֵ֑נוּ וְיִרְדּוּ֩ בִדְגַ֨ת הַיָּ֜ם וּבְעֹ֣וף הַשָּׁמַ֗יִם וּבַבְּהֵמָה֙ וּבְכָל־הָאָ֔רֶץ וּבְכָל־הָרֶ֖מֶשׂ הָֽרֹמֵ֥שׂ עַל־הָאָֽרֶץ׃  27וַיִּבְרָ֨א אֱלֹהִ֤ים ׀ אֶת־הָֽאָדָם֙ בְּצַלְמֹ֔ו בְּצֶ֥לֶם אֱלֹהִ֖ים בָּרָ֣א אֹתֹ֑ו זָכָ֥ר וּנְקֵבָ֖ה בָּרָ֥א אֹתָֽם׃  28וַיְבָ֣רֶךְ אֹתָם֮ אֱלֹהִים֒ וַיֹּ֨אמֶר לָהֶ֜ם אֱלֹהִ֗ים פְּר֥וּ וּרְב֛וּ וּמִלְא֥וּ אֶת־הָאָ֖רֶץ וְכִבְשֻׁ֑הָ וּרְד֞וּ בִּדְגַ֤ת הַיָּם֙ וּבְעֹ֣וף הַשָּׁמַ֔יִם וּבְכָל־חַיָּ֖ה הָֽרֹמֶ֥שֶׂת עַל־הָאָֽרֶץ׃  29וַיֹּ֣אמֶר אֱלֹהִ֗ים הִנֵּה֩ נָתַ֨תִּי לָכֶ֜ם אֶת־כָּל־עֵ֣שֶׂב ׀ זֹרֵ֣עַ זֶ֗רַע אֲשֶׁר֙ עַל־פְּנֵ֣י כָל־הָאָ֔רֶץ וְאֶת־כָּל־הָעֵ֛ץ אֲשֶׁר־בֹּ֥ו פְרִי־עֵ֖ץ זֹרֵ֣עַ זָ֑רַע לָכֶ֥ם יִֽהְיֶ֖ה לְאָכְלָֽה׃  30וּֽלְכָל־חַיַּ֣ת הָ֠אָרֶץ וּלְכָל־עֹ֨וף הַשָּׁמַ֜יִם וּלְכֹ֣ל ׀ רֹומֵ֣שׂ עַל־הָאָ֗רֶץ אֲשֶׁר־בֹּו֙ נֶ֣פֶשׁ חַיָּ֔ה אֶת־כָּל־יֶ֥רֶק עֵ֖שֶׂב לְאָכְלָ֑ה וַֽיְהִי־כֵֽן׃  31וַיַּ֤רְא אֱלֹהִים֙ אֶת־כָּל־אֲשֶׁ֣ר עָשָׂ֔ה וְהִנֵּה־טֹ֖וב מְאֹ֑ד וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר יֹ֥ום הַשִּׁשִּֽׁי׃ פ";
        LOG.trace(unAccent(s, false));
    }

}
