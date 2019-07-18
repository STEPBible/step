<?xml version="1.0"?>
<!--
 * Distribution License:
 * JSword is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License, version 2.1 as published by
 * the Free Software Foundation. This program is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * The License is available on the internet at:
 *       http://www.gnu.org/copyleft/lgpl.html
 * or by writing to:
 *      Free Software Foundation, Inc.
 *      59 Temple Place - Suite 330
 *      Boston, MA 02111-1307, USA
 *
 * Copyright: 2005
 *     The copyright to this program is held by it's authors.
 *
 * ID: $Id: simple.xsl 2226 2012-02-02 19:25:21Z dmsmith $
 -->
<!--
* Transforms OSIS to HTML for viewing within JSword browsers.
* Note: There are custom protocols which the browser must handle.
*
* @see gnu.lgpl.License for license details.
*      The copyright to this program is held by it's authors.
* @author Joe Walker [joe at eireneh dot com]
* @author DM Smith [dmsmith555 at yahoo dot com]
* @author Chris Burrell [chris at burrell dot me dot uk]
-->
<xsl:stylesheet
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        version="1.0"
        xmlns:jsword="http://xml.apache.org/xalan/java"
        xmlns:interleaving="xalan://com.tyndalehouse.step.core.xsl.impl.InterleavingProviderImpl"
        xmlns:conversion="xalan://com.tyndalehouse.step.core.utils.StringConversionUtils"
        xmlns:jswordUtils="xalan://com.tyndalehouse.step.core.utils.JSwordUtils"
        xmlns:url="http://whatever/java/java.net.URLEncoder"
        xmlns:stringUtils="xalan://com.tyndalehouse.step.core.utils.StringUtils"
        xmlns:c="http://www.w3.org/1999/XSL/Transform"
        extension-element-prefixes="jsword interleaving conversion url stringUtils">

    <!--  Version 3.0 is necessary to get br to work correctly. -->
    <xsl:output method="html" version="3.0" omit-xml-declaration="yes" indent="no"/>

    <!-- Be very careful about introducing whitespace into the document.
         strip-space merely remove space between one tag and another tag.
         This may cause significant whitespace to be removed.

         It is easy to have apply-templates on a line to itself which if
         it encounters text before anything else will introduce whitespace.
         With the browser we are using, span will introduce whitespace
         but font does not. Therefore we use font as a span.
      -->
    <!-- gdef and hdef refer to hebrew and greek definitions keyed by strongs -->
    <!-- The absolute base for relative references. -->
    <xsl:param name="greek.def.protocol" select="'gdef:'"/>
    <xsl:param name="hebrew.def.protocol" select="'hdef:'"/>
    <xsl:param name="lex.def.protocol" select="'lex:'"/>
    <!-- currently these are not used, but they are for morphologic forms -->
    <xsl:param name="greek.morph.protocol" select="'gmorph:'"/>
    <xsl:param name="hebrew.morph.protocol" select="'hmorph:'"/>

    <!-- The absolute base for relative references. -->
    <xsl:param name="baseURL" select="''"/>

    <!-- Whether to display Jesus' words in red or not -->
    <xsl:param name="RedLetterText" select="'false'"/>

    <!-- Whether to start each verse on an new line or not -->
    <xsl:param name="VLine" select="'false'"/>

    <!-- Whether to show non-canonical "headings" or not -->
    <xsl:param name="Headings" select="'false'"/>
    <xsl:param name="DivideHebrew" select="'false'"/>

    <!--  This is set if we are interested in a preview only and the x-gen information is of no interest. -->
    <xsl:param name="Preview" select="'false'"/>

    <!-- Whether to show notes or not -->
    <xsl:param name="Notes" select="'false'"/>

    <!-- Whether to have linking cross references or not -->
    <xsl:param name="XRef" select="'false'"/>

    <!-- Whether to output Verse numbers or not -->
    <xsl:param name="VNum" select="'false'"/>

    <!-- Whether to output Chapter and Verse numbers or not -->
    <xsl:param name="CVNum" select="'false'"/>

    <!-- Whether to output Book, Chapter and Verse numbers or not -->
    <xsl:param name="BCVNum" select="'false'"/>

    <!-- Whether to output superscript verse numbers or normal size ones -->
    <xsl:param name="TinyVNum" select="'false'"/>

    <!-- The default versification -->
    <xsl:param name="v11n" select="'KJV'"/>

    <!-- The order of display. Hebrew is rtl (right to left) -->
    <xsl:param name="direction" select="'ltr'"/>

    <!--  true to display color coding information -->
    <xsl:param name="ColorCoding" select="'false'"/>
    <xsl:param name="RemovePointing" select="'true'"/>
    <xsl:param name="RemoveVowels" select="'true'"/>
    <xsl:param name="HideCompareHeaders" select="'false'"/>

    <xsl:param name="HideXGen" select="'false'"/>

    <xsl:param name="baseVersion" select="''"/>
    <xsl:param name="defaultVersion" select="'ESV'"/>
    <xsl:param name="Interleave" select="'false'"/>
    <xsl:param name="interleavingProvider"/>
    <xsl:param name="comparing" select="false()"/>
    <xsl:param name="colorCodingProvider"/>
    <xsl:param name="xrefProvider"/>


    <!-- Create a global key factory from which OSIS ids will be generated -->
    <xsl:variable name="keyf" select="jsword:org.crosswire.jsword.passage.PassageKeyFactory.instance()"/>
    <xsl:variable name="v11nf" select="jsword:org.crosswire.jsword.versification.system.Versifications.instance()"/>
    <xsl:variable name="versification" select="jsword:getVersification($v11nf, $v11n)"/>

    <!-- Create a global number shaper that can transform 0-9 into other number systems. -->
    <xsl:variable name="shaper" select="jsword:org.crosswire.common.icu.NumberShaper.new()"/>


    <!--=======================================================================-->
    <xsl:template match="/">
        <div class="passageContentHolder" tabindex="-1">
            <!-- If there are notes, output a table with notes in the 2nd column. -->
            <!-- There is a rendering bug which prevents the notes from adhering to the right edge. -->
            <xsl:choose>
                <xsl:when test="$Notes = 'true' and //note[not(@type = 'x-strongsMarkup')]">
                    <xsl:choose>
                        <xsl:when test="$direction != 'rtl'">
                            <div class="notesPane">
                                <xsl:apply-templates select="//verse|//title" mode="print-cross-references"/>
                            </div>
                        </xsl:when>
                        <xsl:otherwise>
                            <div class="notesPane">
                                <!-- In a right to left, the alignment should be reversed too -->
                                <p>&#160;</p>
                                <xsl:apply-templates select="//note" mode="print-cross-references"/>
                            </div>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
            </xsl:choose>
            <xsl:apply-templates/>
        </div>

    </xsl:template>

    <!--=======================================================================-->
    <!--
      == A proper OSIS document has osis as its root.
      == We dig deeper for its content.
      -->
    <xsl:template match="osis">
        <xsl:apply-templates/>
    </xsl:template>

    <!--=======================================================================-->
    <!--
      == An OSIS document may contain more that one work.
      == Each work is held in an osisCorpus element.
      == If there is only one work, then this element will (should) be absent.
      == Process each document in turn.
      == It might be reasonable to dig into the header element of each work
      == and get its title.
      == Otherwise, we ignore the header and work elements and just process
      == the osisText elements.
      -->
    <xsl:template match="osisCorpus">
        <xsl:apply-templates select="osisText"/>
    </xsl:template>

    <!--=======================================================================-->
    <!--
      == Each work has an osisText element.
      == We ignore the header and work elements and process its div elements.
      == While divs can be milestoned, the osisText element requires container
      == divs.
      -->
    <xsl:template match="osisText">
        <xsl:apply-templates select="div"/>
    </xsl:template>

    <!-- Ignore headers and its elements -->
    <xsl:template match="header"/>
    <xsl:template match="revisionDesc"/>
    <xsl:template match="work"/>
    <!-- <xsl:template match="title"/> who's parent is work -->
    <xsl:template match="contributor"/>
    <xsl:template match="creator"/>
    <xsl:template match="subject"/>
    <!-- <xsl:template match="date"/> who's parent is work -->
    <xsl:template match="description"/>
    <xsl:template match="publisher"/>
    <xsl:template match="type"/>
    <xsl:template match="format"/>
    <xsl:template match="identifier"/>
    <xsl:template match="source"/>
    <xsl:template match="language"/>
    <xsl:template match="relation"/>
    <xsl:template match="coverage"/>
    <xsl:template match="rights"/>
    <xsl:template match="scope"/>
    <xsl:template match="workPrefix"/>
    <xsl:template match="castList"/>
    <xsl:template match="castGroup"/>
    <xsl:template match="castItem"/>
    <xsl:template match="actor"/>
    <xsl:template match="role"/>
    <xsl:template match="roleDesc"/>
    <xsl:template match="teiHeader"/>
    <xsl:template match="refSystem"/>


    <!-- Ignore titlePage -->
    <xsl:template match="titlePage"/>

    <!--=======================================================================-->
    <!--
      == Div provides the major containers for a work.
      == Divs are milestoneable.
      -->
    <xsl:template match="div[@type='x-center']">
        <div align="center">
            <xsl:apply-templates/>
        </div>
    </xsl:template>


    <xsl:template match="div[@type='colophon']">
        <span class='colophon'>
            <xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="div[@type='introduction'][@sID]">
        &lt;span class='introduction'&gt;
    </xsl:template>

    <xsl:template match="div[@type='introduction'][@eID]">
        &lt;/span&gt;
    </xsl:template>
    <xsl:template match="div[@type='paragraph'][@sID]">
        <span class="paragraph"></span>
    </xsl:template>
    <xsl:template match="div[@type='paragraph'][@eID]">
        <br/>
    </xsl:template>
    <xsl:template match="div[@subType='x-duplicate']">
        <span class="duplicate">
            <span class="versification-notice duplicate-notice" international="duplicate_notice">*</span>
            <xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="div[@subType='x-omitted-verses']">
        <span class="versification-notice" international="omitted_notice">*</span>
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="div[@type='x-p']">
        <p/>
    </xsl:template>

    <xsl:template match="div">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="div" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>

    <!--=======================================================================-->
    <!-- Handle verses as containers and as a start verse.                     -->
    <xsl:template match="verse[not(@eID)]">
        <!-- output each preverse element in turn -->
        <xsl:for-each select=".//*[@subType = 'x-preverse' or @subtype = 'x-preverse']">
            <xsl:choose>
                <xsl:when test="local-name() = 'title'">
                    <!-- Always show canonical titles or if headings is turned on -->
                    <xsl:if test="@canonical = 'true' or $Headings = 'true'">
                        <h3 class="heading {@type}">
                            <xsl:apply-templates/>
                        </h3>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
        <!-- Handle the KJV and ESV paragraph marker. -->
        <xsl:if test="milestone[@type = 'x-p']">
            <p/>
        </xsl:if>
        <!-- If the verse doesn't start on its own line and -->
        <!-- the verse is not the first verse of a set of siblings, -->
        <!-- output an extra space. -->
        <!--<xsl:if test="$VLine = 'false' and preceding-sibling::*[local-name() = 'verse']">-->
        <!--<xsl:text>&#160;</xsl:text>-->
        <!--</xsl:if>-->

        <!--  set up the direction variable -->
        <xsl:variable name="cell-direction">
            <xsl:if test="./ancestor::cell/@xml:lang">
                <xsl:call-template name="getDirection">
                    <xsl:with-param name="lang">
                        <xsl:value-of select="./ancestor::cell/@xml:lang"/>
                    </xsl:with-param>
                </xsl:call-template>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="languageDirection">
            <xsl:choose>
                <xsl:when test="./ancestor::cell/@xml:lang">
                    <xsl:value-of select="$cell-direction"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$direction"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <!-- Always output the verse number -->
        <xsl:choose>
            <xsl:when test=".//cell">
                <div class="verse l {$languageDirection}Direction containsTable" dir="{$languageDirection}">
                    <a class="verseLink" name="{@osisID}">
                        <xsl:call-template name="versenum"/>
                    </a>
                    <xsl:apply-templates/>
                </div>
            </xsl:when>
            <xsl:when test="$VLine = 'true' or .//cell">
                <div class="verse l {$languageDirection}Direction" dir="{$languageDirection}">
                    <a class="verseLink" name="{@osisID}">
                        <xsl:call-template name="versenum"/>
                    </a>
                    <xsl:apply-templates/>
                </div>
            </xsl:when>
            <xsl:otherwise>
                <span class="verse {$languageDirection}Direction" dir="{$languageDirection}">
                    <xsl:call-template name="versenum"/>
                    <xsl:apply-templates/>
                </span>
                <!-- Follow the verse with an extra space -->
                <!-- when they don't start on lines to themselves -->
                <xsl:text> </xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="verse[not(@eID)]" mode="jesus">
        <!-- If the verse doesn't start on its own line and -->
        <!-- the verse is not the first verse of a set of siblings, -->
        <!-- output an extra space. -->
        <xsl:if test="$VLine = 'false' and preceding-sibling::*[local-name() = 'verse']">
            <xsl:text>&#160;</xsl:text>
        </xsl:if>
        <xsl:variable name="title" select=".//title"/>
        <xsl:if test="string-length($title) > 0">
            <h3 class="heading {@type}">
                <xsl:value-of select="$title"/>
            </h3>
        </xsl:if>
        <!-- Handle the KJV paragraph marker. -->
        <xsl:if test="milestone[@type = 'x-p']">
            <p/>
        </xsl:if>
        <!-- Always output the verse -->
        <xsl:choose>
            <xsl:when test="$VLine = 'true'">
                <div class="l">
                    <a class="verseLink" name="{@osisID}">
                        <xsl:call-template name="versenum"/>
                    </a>
                    <xsl:apply-templates mode="jesus"/>
                </div>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="versenum"/>
                <xsl:apply-templates mode="jesus"/>
                <!-- Follow the verse with an extra space -->
                <!-- when they don't start on lines to themselves -->
                <xsl:text> </xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- print the textRef+crossRefs+space in the notesPane -->
    <xsl:template match="verse" mode="print-cross-references">
        <xsl:if test=".//note[@type = 'crossReference']">
            <xsl:variable name="passage" select="jswordUtils:getSafeKey($versification, @osisID)"/>
            <!--<a href="#{substring-before(concat(@osisID, ' '), ' ')}">-->
            <!--<xsl:value-of select="jsword:getName($passage)"/>-->
            <!--</a>-->
            <xsl:apply-templates select=".//note[@type = 'crossReference']" mode="print-cross-references"/>
            <!--<div><xsl:text>&#160;</xsl:text></div>-->
        </xsl:if>
    </xsl:template>

    <xsl:template match="verse" mode="print-notes">
        <xsl:if test=".//note[not(@type) or not(@type = 'x-strongsMarkup')]">
            <xsl:variable name="passage" select="jswordUtils:getSafeKey($versification, @osisID)"/>
            <a href="#{substring-before(concat(@osisID, ' '), ' ')}">
                <xsl:value-of select="jsword:getName($passage)"/>
            </a>
            <xsl:apply-templates select=".//note" mode="print-notes"/>
            <div>
                <xsl:text>&#160;</xsl:text>
            </div>
        </xsl:if>
    </xsl:template>


    <xsl:template name="interleavedVerseNum">
        <xsl:param name="verse"/>
        <xsl:if test="$VNum = 'true'">
            <h4 class='heading'>
                <xsl:call-template name="intertwinedVerseNum">
                    <xsl:with-param name="verse" select="$verse"/>
                    <xsl:with-param name="includeBook" select="true()"/>
                </xsl:call-template>
            </h4>
        </xsl:if>
    </xsl:template>

    <xsl:template name="columnVerseNumber">
        <xsl:param name="verse"/>
        <th class='headingVerseNumber'>
            <xsl:if test="$VNum = 'true'">
                <xsl:call-template name="intertwinedVerseNum">
                    <xsl:with-param name="verse" select="$verse"/>
                    <xsl:with-param name="includeBook" select="true()"/>
                </xsl:call-template>
            </xsl:if>
        </th>
    </xsl:template>


    <xsl:template name="intertwinedVerseNum">
        <xsl:param name="verse"/>
        <xsl:param name="includeBook"/>

        <xsl:variable name="firstOsisID" select="substring-before(concat($verse/@osisID, ' '), ' ')"/>
        <a class="verseLink" name="{$firstOsisID}">
            <xsl:if test="normalize-space($firstOsisID) != ''">
                <xsl:variable name="book" select="substring-before($firstOsisID, '.')"/>
                <xsl:variable name="chapter"
                              select="jsword:shape($shaper, substring-before(substring-after($firstOsisID, '.'), '.'))"/>
                <xsl:variable name="verse">
                    <xsl:choose>
                        <xsl:when test="@n">
                            <xsl:value-of select="jsword:shape($shaper, string(@n))"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of
                                    select="jsword:shape($shaper, substring-after(substring-after($firstOsisID, '.'), '.'))"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>

                <xsl:choose>
                    <xsl:when test="$includeBook = true()">
                        <span class="verseNumber">
                            <xsl:value-of select="concat($book, ' ', $chapter, ':', $verse)"/>
                        </span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span class="verseNumber">
                            <xsl:value-of select="concat($chapter, ':', $verse)"/>
                        </span>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
        </a>
    </xsl:template>

    <xsl:template name="interleavedVersion">
        <xsl:if test="$Interleave = 'true'">
            <xsl:variable name="version" select="interleaving:getNextVersion($interleavingProvider)"/>
            <span class="smallResultKey" data-version="{$version}">(<xsl:value-of select="$version"/>)
            </span>
        </xsl:if>
    </xsl:template>

    <xsl:template name="versenum">
        <xsl:if test="not(./ancestor::row)">
            <!-- we output version names not verse numbers for interleaved translations -->
            <!-- Are verse numbers wanted? -->
            <xsl:if test="$VNum = 'true'">
                <!-- An osisID can be a space separated list of them -->
                <xsl:variable name="firstOsisID" select="substring-before(concat(@osisID, ' '), ' ')"/>
                <xsl:variable name="book" select="substring-before($firstOsisID, '.')"/>
                <xsl:variable name="chapter"
                              select="jsword:shape($shaper, substring-before(substring-after($firstOsisID, '.'), '.'))"/>
                <!-- If n is present use it for the number -->
                <xsl:variable name="verse">
                    <xsl:choose>
                        <xsl:when test="@n">
                            <xsl:value-of select="jsword:shape($shaper, string(@n))"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of
                                    select="jsword:shape($shaper, substring-after(substring-after($firstOsisID, '.'), '.'))"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="versenum">
                    <xsl:choose>
                        <xsl:when test="$BCVNum = 'true'">
                            <xsl:variable name="passage" select="jswordUtils:getSafeKey($versification, @osisID)"/>
                            <xsl:value-of select="jsword:getName($passage)"/>
                        </xsl:when>
                        <xsl:when test="$CVNum = 'true'">
                            <xsl:value-of select="concat($chapter, ' : ', $verse)"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$verse"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <!--
                  == Surround versenum with dup
                  -->
                <xsl:choose>
                    <xsl:when test="$TinyVNum = 'true' and $Notes = 'true'">
                        <a class="verseLink" name="{@osisID}">
                            <span class="verseNumber"><xsl:value-of select="$versenum"/>
                            </span>
                        </a>
                    </xsl:when>
                    <xsl:when test="$TinyVNum = 'true' and $Notes = 'false'">
                        <a class="verseLink" name="{@osisID}">
                            <span class="verseNumber"><xsl:value-of select="$versenum"/>
                            </span>
                        </a>
                    </xsl:when>
                    <xsl:when test="$TinyVNum = 'false' and $Notes = 'true'">
                        <a class="verseLink" name="{@osisID}">(<xsl:value-of select="$versenum"/>)
                        </a>
                        <xsl:text> </xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <a class="verseLink" name="{@osisID}">
                            <span class="verseNumber">
                                <xsl:value-of select="$versenum"/>
                            </span>
                        </a>
                        <xsl:text> </xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
            <xsl:if test="$VNum = 'false' and $Notes = 'true'">
                <a class="verseLink" name="{@osisID}"></a>
            </xsl:if>
        </xsl:if>
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="a">
        <a href="{@href}">
            <xsl:apply-templates/>
        </a>
    </xsl:template>

    <xsl:template match="a" mode="jesus">
        <a href="{@href}">
            <xsl:apply-templates mode="jesus"/>
        </a>
    </xsl:template>

    <!--=======================================================================-->
    <!-- When we encounter a note, we merely output a link to the note. -->
    <xsl:template match="note[@type = 'x-strongsMarkup']"/>
    <xsl:template match="note[@type = 'x-strongsMarkup']" mode="jesus"/>
    <xsl:template match="note[@type = 'x-strongsMarkup']" mode="print-notes"/>

    <xsl:template match="note">
        <xsl:text> </xsl:text>
        <xsl:if test="$Notes = 'true'">
            <!-- If there is a following sibling that is a note, emit a separator -->
            <xsl:variable name="siblings" select="../child::node()"/>
            <xsl:variable name="next-position">
                <xsl:choose>
                    <xsl:when test="normalize-space(./following-sibling::node()) = ','">
                        <xsl:value-of select="position() + 2"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="position() + 1"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:choose>
                <xsl:when test="name($siblings[number($next-position)]) = 'note'">
                    <xsl:choose>
                        <xsl:when test="@type = 'crossReference'">
                            <sup class="note">
                                <a noteType='{@type}' xref="{@osisID}" ref="{@osisRef}">
                                    <xsl:call-template name="generateNoteLetter"/>
                                </a>
                                ,
                            </sup>
                        </xsl:when>
                        <xsl:otherwise>
                            <sup class="note">
                                <a noteType='{@type}' xref="{@osisID}" ref="{@osisRef}">
                                    <xsl:call-template name="generateNoteMarker"/>
                                </a>
                                <span class="inlineNote">
                                    <xsl:apply-templates select="." mode="print-notes"/>
                                </span>
                                ,
                            </sup>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:choose>
                        <xsl:when test="@type = 'crossReference'">
                            <sup class="note">
                                <a noteType='{@type}' xref="{@osisID}" ref="{@osisRef}">
                                    <xsl:call-template name="generateNoteLetter"/>
                                </a>&amp;nbsp;
                            </sup>
                        </xsl:when>
                        <xsl:otherwise>
                            <sup class="note">
                                <a noteType='{@type}' xref="{@osisID}" ref="{@osisRef}">
                                    <xsl:call-template name="generateNoteMarker"/>
                                </a>
                                <span class="inlineNote">
                                    <xsl:apply-templates select="." mode="print-notes"/>
                                </span>
                            </sup>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

    <xsl:template match="note" mode="jesus">
        <xsl:if test="$Notes = 'true'">
            <!-- If there is a following sibling that is a note, emit a separator -->
            <xsl:variable name="siblings" select="../child::node()"/>
            <xsl:variable name="next-position">
                <xsl:choose>
                    <xsl:when test="normalize-space(./following-sibling::node()) = ','">
                        <xsl:value-of select="position() + 2"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="position() + 1"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:choose>
                <xsl:when test="name($siblings[$next-position]) = 'note'">
                    <xsl:choose>
                        <xsl:when test="@type = 'crossReference'">
                            <sup class="note">
                                <a noteType='{@type}' xref="{@osisID}" ref="{@osisRef}">
                                    <xsl:call-template name="generateNoteLetter"/>
                                </a>
                                ,
                            </sup>
                        </xsl:when>
                        <xsl:otherwise>
                            <sup class="note">
                                <a noteType='{@type}' xref="{@osisID}" ref="{@osisRef}">
                                    <xsl:call-template name="generateNoteMarker"/>
                                </a>
                                <span class="inlineNote">
                                    <xsl:apply-templates select="." mode="print-notes"/>
                                </span>
                                ,
                            </sup>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:choose>
                        <xsl:when test="@type = 'crossReference'">
                            <sup class="note">
                                <a noteType='{@type}' xref="{@osisID}" ref="{@osisRef}">
                                    <xsl:call-template name="generateNoteLetter"/>
                                </a>
                            </sup>
                        </xsl:when>
                        <xsl:otherwise>
                            <sup class="note">
                                <a noteType='{@type}' xref="{@osisID}" ref="{@osisRef}">
                                    <xsl:call-template name="generateNoteMarker"/>
                                </a>
                                <span class="inlineNote">
                                    <xsl:apply-templates select="." mode="print-notes"/>
                                </span>
                            </sup>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="note" mode="print-notes">
        <div>
            <a name="note-{generate-id(.)}" class="sideNote">
                <strong>
                    <xsl:call-template name="generateNoteMarker"/>
                </strong>
            </a>
            <xsl:choose>
                <xsl:when test=".//rdg[@type='x-qere']">
                    <div dir="{$direction}" class="qereDisplay">
                        <xsl:apply-templates/>
                    </div>
                </xsl:when>
                <xsl:when test=".//rdg[@type='x-accent']">
                    <div dir="{$direction}" class="accentDisplay">
                        <xsl:apply-templates/>
                    </div>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
        </div>
    </xsl:template>

    <xsl:template match="note" mode="print-cross-references">
        <xsl:if test="@type = 'crossReference'">
            <div class="margin">
                <a name="note-{generate-id(.)}" class="sideNote">
                    <strong>
                        <xsl:call-template name="generateNoteLetter"/>
                    </strong>
                </a>
                <xsl:apply-templates/>
            </div>
        </xsl:if>
    </xsl:template>


    <!--
      == If the n attribute is present then use that for the cross ref otherwise create a letter.
      == Note: numbering restarts with each verse.  [is this right? The sequence doesn't restart even if 2 chapters are displayed]
      -->
    <xsl:template name="generateNoteXref">
        <xsl:choose>
            <xsl:when test="@n and @n != ''">
                <xsl:value-of select="@n"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:number level="any" from="/osis//verse" format="1"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Generate a unique letter or pair of letters for notes -->
    <xsl:template name="generateNoteLetter">
        <xsl:number level="any" from="/osis//verse" format="a"/>
    </xsl:template>

    <!-- Generate a unique number for notes -->
    <xsl:template name="generateNoteMarker">
        <xsl:choose>
            <xsl:when test="@type and @type = 'x-verse-numbering'">
                (<xsl:value-of select="@n"/>)
            </xsl:when>
            <xsl:otherwise>▼</xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="p">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>

    <xsl:template match="p" mode="jesus">
        <p>
            <xsl:apply-templates mode="jesus"/>
        </p>
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="p" mode="print-notes">
        <!-- FIXME: This ignores text in the note. -->
        <!-- don't put para's in notes -->
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="w" name="processW">
        <!-- Output the content followed by all the lemmas and then all the morphs. -->
        <xsl:choose>
            <xsl:when test="normalize-space(@lemma) != '' or normalize-space(@morph) != ''">
                <xsl:choose>
                    <xsl:when test="$ColorCoding = 'true'">
                        <xsl:variable name="colorClass" select="jsword:getColorClass($colorCodingProvider, @morph)"/>
                        <xsl:variable name="lemma" select="conversion:getStrongPaddedKey(@lemma)"/>
                        <xsl:choose>
                            <xsl:when test="@morph">
                                <span class="{$colorClass}" strong="{$lemma}" morph="{@morph}">
                                    <xsl:apply-templates/>
                                </span>
                            </xsl:when>
                            <xsl:otherwise>
                                <span class="{$colorClass}" strong="{$lemma}">
                                    <xsl:apply-templates/>
                                </span>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:variable name="lemma" select="conversion:getStrongPaddedKey(@lemma)"/>
                        <xsl:choose>
                            <xsl:when test="@morph">
                                <span strong="{$lemma}" morph="{@morph}">
                                    <xsl:apply-templates/>
                                </span>
                            </xsl:when>
                            <xsl:otherwise>
                                <span strong="{$lemma}">
                                    <xsl:apply-templates/>
                                </span>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
        <!--
                except when followed by a text node or non-printing node.
                This is true whether the href is output or not.
            -->
        <xsl:variable name="siblings" select="../child::node()"/>
        <xsl:variable name="next-position" select="position() + 1"/>
        <xsl:if test="$siblings[$next-position] and (name($siblings[$next-position]) != '' and (name($siblings[$next-position]) != 'seg' or $siblings[$next-position]/@type != 'x-punct'))">
            <xsl:if test="$siblings[$next-position]/@type != 'x-maqqef'">
                <xsl:if test="$siblings[$next-position]/@type != 'x-sof-pasuq'">
                    <xsl:if test="conversion:startsWithPunctuation($siblings[$next-position]/text()) =  false()">
                        <xsl:text> </xsl:text>
                    </xsl:if>
                </xsl:if>
            </xsl:if>
        </xsl:if>
    </xsl:template>

    <xsl:template name="addExtraSpaceBeforeNonPunctuation">
        <xsl:variable name="siblings" select="../child::node()"/>
        <xsl:variable name="next-position" select="position() + 1"/>
        <xsl:variable name="text">
            <xsl:value-of select="$siblings[$next-position]"/>
        </xsl:variable>

        <xsl:if test="$siblings[$next-position]">
            <xsl:if test="conversion:startsWithPunctuation($text) =  false()">
                <xsl:text> </xsl:text>
            </xsl:if>
        </xsl:if>
    </xsl:template>

    <xsl:template match="w" mode="jesus">
        <!-- Output the content followed by all the lemmas and then all the morphs. -->
        <xsl:apply-templates mode="jesus"/>
        <!--
            except when followed by a text node or non-printing node.
            This is true whether the href is output or not.
        -->
        <xsl:variable name="siblings" select="../child::node()"/>
        <xsl:variable name="next-position" select="position() + 1"/>
        <xsl:if test="$siblings[$next-position] and (name($siblings[$next-position]) != '' and (name($siblings[$next-position]) != 'seg' or $siblings[$next-position]/@type != 'x-punct'))">
            <xsl:text> </xsl:text>
        </xsl:if>
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="seg">
        <xsl:choose>
            <xsl:when test="starts-with(@type, 'color:')">
                <font color="{substring-before(substring-after(@type, 'color: '), ';')}">
                    <xsl:apply-templates/>
                </font>
            </xsl:when>
            <xsl:when test="starts-with(@type, 'font-size:')">
                <font size="{substring-before(substring-after(@type, 'font-size: '), ';')}">
                    <xsl:apply-templates/>
                </font>
            </xsl:when>
            <xsl:when test="starts-with(@type, 'font-face:')">
                <font face="{substring-before(substring-after(@type, 'font-face: '), ';')}">
                    <xsl:apply-templates/>
                </font>
            </xsl:when>
            <xsl:when test="@type = 'x-variant'">
                <xsl:choose>
                    <xsl:when test="@subType = 'x-class-1' or @subType ='x-1'">
                        <xsl:apply-templates/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:variable name="variantText">
                            <xsl:value-of select="."/>
                        </xsl:variable>
                        <xsl:choose>
                            <xsl:when test="normalize-space($variantText) = '' ">
                                <sup class="note variant" title="[{$variantText}]">va</sup>
                            </xsl:when>
                            <xsl:otherwise>
                                <sup class="note variant" title="{$variantText}">va</sup>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:when test="$DivideHebrew = 'true'">
                <xsl:variable name="cssClass" select="concat('segC', position() mod 2)"/>
                <span class='{$cssClass}'>
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="seg" mode="jesus">
        <xsl:choose>
            <xsl:when test="starts-with(@type, 'color:')">
                <font color="{substring-before(substring-after(@type, 'color: '), ';')}">
                    <xsl:apply-templates mode="jesus"/>
                </font>
            </xsl:when>
            <xsl:when test="starts-with(@type, 'font-size:')">
                <font size="{substring-before(substring-after(@type, 'font-size: '), ';')}">
                    <xsl:apply-templates mode="jesus"/>
                </font>
            </xsl:when>
            <xsl:when test="@type = 'x-variant'">
                <xsl:if test="@subType = 'x-class:1' or @subType ='x-1'">
                    <xsl:apply-templates mode="jesus"/>
                </xsl:if>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates mode="jesus"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!--=======================================================================-->
    <!-- expansion is OSIS, expan is TEI -->
    <xsl:template match="abbr">
        <font class="abbr">
            <xsl:if test="@expansion">
                <xsl:attribute name="title">
                    <xsl:value-of select="@expansion"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@expan">
                <xsl:attribute name="title">
                    <xsl:value-of select="@expan"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </font>
    </xsl:template>

    <xsl:template match="abbr" mode="jesus">
        <font class="abbr">
            <xsl:if test="@expansion">
                <xsl:attribute name="title">
                    <xsl:value-of select="@expansion"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@expan">
                <xsl:attribute name="title">
                    <xsl:value-of select="@expan"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates mode="jesus"/>
        </font>
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="speaker[@who = 'Jesus']">
        <xsl:choose>
            <xsl:when test="$RedLetterText = 'true'">
                <span class="jesus">&#160;<xsl:apply-templates mode="jesus"/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="speech">
                    <xsl:apply-templates/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="speaker">
        <span class="speech">
            <xsl:apply-templates/>
        </span>
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="title[@subType ='x-preverse' or @subtype = 'x-preverse']">
        <!-- Verses handle most titles, however, if they are not in a verse, then we handle them here. -->
        <xsl:if test="not(./ancestor::verse)">
            <xsl:choose>
                <xsl:when test="@canonical = 'true' and @type='psalm'">
                    <h3 class="psalmHeading">
                        <xsl:apply-templates/>
                    </h3>
                </xsl:when>
                <xsl:when test="@canonical = 'true'">
                    <h3 class="canonicalHeading">
                        <xsl:apply-templates/>
                    </h3>
                </xsl:when>
                <xsl:otherwise>
                    <h3 class="heading {@type}">
                        <xsl:apply-templates/>
                    </h3>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

    <xsl:template match="title[@subType ='x-preverse' or @subtype = 'x-preverse']" mode="jesus">
        <!-- Done by a line in [verse]
          <h3 class="heading">
            <xsl:apply-templates/>
          </h3>
        -->
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="title[@level]">
        <!-- Always show canonical titles or if headings is turned on -->
        <xsl:if test="@canonical = 'true' or $Headings = 'true'">
            <xsl:choose>
                <xsl:when test="@level = '1'">
                    <h1 class="level">
                        <xsl:apply-templates/>
                    </h1>
                </xsl:when>
                <xsl:when test="@level = '2'">
                    <h2 class="level">
                        <xsl:apply-templates/>
                    </h2>
                </xsl:when>
                <xsl:when test="@level = '3'">
                    <h3 class="level">
                        <xsl:apply-templates/>
                    </h3>
                </xsl:when>
                <xsl:when test="@level = '4'">
                    <h4 class="level">
                        <xsl:apply-templates/>
                    </h4>
                </xsl:when>
                <xsl:when test="@level = '5'">
                    <h5 class="level">
                        <xsl:apply-templates/>
                    </h5>
                </xsl:when>
                <xsl:otherwise>
                    <h6 class="level">
                        <xsl:apply-templates/>
                    </h6>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

    <xsl:template match="title[@level]" mode="jesus">
        <!-- Always show canonical titles or if headings is turned on -->
        <xsl:if test="@canonical = 'true' or $Headings = 'true'">
            <xsl:choose>
                <xsl:when test="@level = '1'">
                    <h1 class="level">
                        <xsl:apply-templates/>
                    </h1>
                </xsl:when>
                <xsl:when test="@level = '2'">
                    <h2 class="level">
                        <xsl:apply-templates/>
                    </h2>
                </xsl:when>
                <xsl:when test="@level = '3'">
                    <h3 class="level">
                        <xsl:apply-templates/>
                    </h3>
                </xsl:when>
                <xsl:when test="@level = '4'">
                    <h4 class="level">
                        <xsl:apply-templates/>
                    </h4>
                </xsl:when>
                <xsl:when test="@level = '5'">
                    <h5 class="level">
                        <xsl:apply-templates/>
                    </h5>
                </xsl:when>
                <xsl:otherwise>
                    <h6 class="level">
                        <xsl:apply-templates/>
                    </h6>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

    <!--=======================================================================-->

    <!-- We will always show a x-gen title -->


    <xsl:template match="title" name="normalTile">
        <!-- Always show canonical titles or if headings is turned on -->
        <xsl:if test="@canonical = 'true' or $Headings = 'true' or @type = 'x-gen'">
            <xsl:choose>
                <xsl:when test="@type = 'x-gen'">
                    <xsl:if test="$HideXGen != 'true'">
                        <h2 class="xgen">
                            <xsl:variable name="headerText">
                                <xsl:apply-templates/>
                            </xsl:variable>
                            <xsl:variable name="longHeaderText"
                                          select="jsword:com.tyndalehouse.step.core.utils.HeadingsUtil.getLongHeader($versification, $headerText)"/>
                            <xsl:value-of select="$longHeaderText"/>
                        </h2>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:choose>
                        <!-- most parallel references only have the localised key, so can't use it -->
                        <xsl:when test="@type='psalm'">
                            <h3 class="psalmHeading {@type}">
                                <xsl:apply-templates/>
                            </h3>
                        </xsl:when>
                        <xsl:when test="@canonical = 'true'">
                            <h3 class="canonicalHeading {@type}">
                                <xsl:apply-templates/>
                            </h3>
                        </xsl:when>
                        <xsl:otherwise>
                            <h2 class="heading {@type}">
                                <xsl:apply-templates/>
                            </h2>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

    <xsl:template match="title" mode="jesus">
        <xsl:call-template name="normalTile"/>
    </xsl:template>

    <xsl:template match="title" mode="print-cross-references">
        <xsl:variable name="crossRef" select=".//note[@type = 'crossReference']"/>
        <xsl:if test="$crossRef">
            <xsl:variable name="osisID"
                          select="concat(substring-before(.//note[@type = 'crossReference'][1]/@osisID, '.'), '.', substring-before(substring-after($crossRef[1]/@osisID, '.'), '.'))"/>
            <xsl:variable name="passage" select="jswordUtils:getSafeKey($versification, $osisID)"/>
            <a href="#{substring-before(concat($osisID, ' '), ' ')}">
                <xsl:value-of select="jsword:getName($passage)"/>
            </a>
            <xsl:apply-templates select=".//note[@type = 'crossReference']" mode="print-cross-references"/>
            <div>
                <xsl:text>&#160;</xsl:text>
            </div>
        </xsl:if>
    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="reference">
        <xsl:variable name="passage" select="jswordUtils:getSafeKey($versification, @osisRef)"/>
        <xsl:variable name="passageKey" select="jsword:getName($passage)"/>
        <xsl:variable name="encodedPassageKey" select="url:encode($passageKey)"/>

        <xsl:choose>
            <xsl:when test="string-length($encodedPassageKey) = 0">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
                <a href="?version={$defaultVersion}&amp;reference={$encodedPassageKey}" title="{$passageKey}"
                   class="linkRef" xref="{$passageKey}">
                    <xsl:apply-templates/>
                </a>
            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>

    <xsl:template match="reference" mode="jesus">
        <xsl:variable name="passage" select="jswordUtils:getSafeKey($versification, @osisRef)"/>
        <xsl:variable name="passageKey" select="jsword:getName($passage)"/>
        <xsl:variable name="encodedPassageKey" select="url:encode($passageKey)"/>

        <xsl:choose>
            <xsl:when test="string-length($encodedPassageKey) = 0">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
                <a href="?version={$defaultVersion}&amp;reference={$encodedPassageKey}" title="{$passageKey}"
                   xref="{$passageKey}">
                    <xsl:apply-templates/>
                </a>
            </xsl:otherwise>
        </xsl:choose>


    </xsl:template>

    <!--=======================================================================-->
    <xsl:template match="caption">
        <div class="caption">
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="caption" mode="jesus">
        <div class="caption">
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="catchWord">
        <!-- If the parent has got a rd of type qere or accent, then we output Hebrew fonts for now -->
        <xsl:choose>
            <xsl:when test="count(..//rdg[@type='x-qere']) > 0">
                <div class="hbFontSmall">
                    <xsl:apply-templates/>
                    (Ketiv)
                </div>
            </xsl:when>
            <xsl:when test="count(..//rdg) > 0">
                <span class="hbFontSmall">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="catchWord" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>

    <!--
        <cell> is handled shortly after <table> below and thus does not appear
        here.
    -->

    <xsl:template match="closer">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="closer" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>

    <xsl:template match="date">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="date" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>

    <xsl:template match="catchWord">
        <span class="bold">&#160;<xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="doxology">
        <span class="italic">&#160;<xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="colophon">
        <span class="italic">&#160;<xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="refrain">
        <span class="italic">&#160;<xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="attribution">
        <span class="italic">&#160;<xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="divineName">
        <span class="small-caps">&#160;<xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="divineName" mode="jesus">
        <span class="small-caps">&#160;<xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="figure">
        <div class="figure">
            <xsl:choose>
                <xsl:when test="starts-with(@src, '/')">
                    <img src="{concat($baseURL, @src)}"/>   <!-- FIXME: Not necessarily an image... -->
                </xsl:when>
                <xsl:otherwise>
                    <img src="{concat($baseURL, '/',  @src)}"/>   <!-- FIXME: Not necessarily an image... -->
                </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="figure" mode="jesus">
        <div class="figure">
            <xsl:choose>
                <xsl:when test="starts-with(@src, '/')">
                    <img src="{concat($baseURL, @src)}"/>   <!-- FIXME: Not necessarily an image... -->
                </xsl:when>
                <xsl:otherwise>
                    <img src="{concat($baseURL, '/',  @src)}"/>   <!-- FIXME: Not necessarily an image... -->
                </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates mode="jesus"/>
        </div>
    </xsl:template>

    <xsl:template match="foreign">
        <em class="foreign">&#160;<xsl:apply-templates/>
        </em>
        <xsl:call-template name="addExtraSpaceBeforeNonPunctuation"/>
    </xsl:template>

    <xsl:template match="foreign" mode="jesus">
        <em class="foreign">&#160;<xsl:apply-templates mode="jesus"/>
        </em>
        <xsl:call-template name="addExtraSpaceBeforeNonPunctuation"/>
    </xsl:template>

    <!-- This is a subheading. -->
    <xsl:template match="head//head">
        <h5 class="head">
            <xsl:apply-templates/>
        </h5>
    </xsl:template>

    <!-- This is a top-level heading. -->
    <xsl:template match="head">
        <h4 class="head">
            <xsl:apply-templates/>
        </h4>
    </xsl:template>

    <xsl:template match="index">
        <a name="index{@id}" class="index"/>
    </xsl:template>

    <xsl:template match="inscription">
        <xsl:choose>
            <xsl:when test="@type = 'x-p-inscription'">
                <span class="x-p-inscription">&#160;<xsl:apply-templates/>
                </span>
                <xsl:call-template name="addExtraSpaceBeforeNonPunctuation"/>
            </xsl:when>
            <xsl:otherwise>
                <span class="small-caps">&#160;<xsl:apply-templates/>
                </span>
                <xsl:call-template name="addExtraSpaceBeforeNonPunctuation"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="inscription" mode="jesus">
        <span class="small-caps">&#160;<xsl:apply-templates/>
        </span>
        <xsl:call-template name="addExtraSpaceBeforeNonPunctuation"/>
    </xsl:template>

    <xsl:template match="item">
        <li class="item">
            <xsl:apply-templates/>
        </li>
    </xsl:template>

    <xsl:template match="item" mode="jesus">
        <li class="item">
            <xsl:apply-templates mode="jesus"/>
        </li>
    </xsl:template>

    <!--
        <item> and <label> are covered by <list> below and so do not appear here.
    -->

    <xsl:template match="lg">
        <div class="lg">
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="lg" mode="jesus">
        <div class="lg">
            <xsl:apply-templates mode="jesus"/>
        </div>
    </xsl:template>

    <xsl:template match="lg[@sID]">
        <!--<xsl:value-of select="'&lt;br /&gt;'" />-->
        <span class="startLineGroup"></span>
    </xsl:template>
    <xsl:template match="lg[@sID]" mode="jesus">
        <xsl:value-of select="'&lt;br /&gt;'"/>
        <!--<xsl:value-of select="'&lt;br /&gt;'" />-->
        <span class="startLineGroup"></span>
    </xsl:template>
    <xsl:template match="lg[@eID]">
        <span class="endLineGroup"></span>
    </xsl:template>
    <xsl:template match="lg[@eID]" mode="jesus">
        <span class="endLineGroup"></span>
    </xsl:template>

    <xsl:template match="l[@sID]">
        <xsl:if test="@type != 'x-no-break'">
            <xsl:value-of select="'&lt;br /&gt;'"/>
        </xsl:if>
        <span class='level{@level}'></span>
    </xsl:template>
    <xsl:template match="l[@sID]" mode="jesus">
        <xsl:if test="@type != 'x-no-break'">
            <xsl:value-of select="'&lt;br /&gt;'"/>
        </xsl:if>
        <span class='level{@level}'></span>
    </xsl:template>

    <xsl:template match="l[@eID]">
        <xsl:value-of select="'&lt;br /&gt;'"/>
    </xsl:template>
    <xsl:template match="l[@eID]" mode="jesus">
        <xsl:value-of select="'&lt;br /&gt;'"/>
    </xsl:template>


    <xsl:template match="l[@type='doxology' and @sID]">
        &lt;span class='x-doxology'&gt;
    </xsl:template>

    <xsl:template match="l[@type='doxology' and @eID]">
        &lt;/span&gt;
    </xsl:template>

    <xsl:template match="l">
        <xsl:if test="@type != 'x-no-break'">
            <xsl:value-of select="'&lt;br /&gt;'"/>
        </xsl:if>
        <span class='level{@level}'></span>
        <xsl:apply-templates/>
        <xsl:value-of select="'&lt;br /&gt;'"/>
    </xsl:template>

    <xsl:template match="l" mode="jesus">
        <xsl:if test="@type != 'x-no-break'">
            <xsl:value-of select="'&lt;br /&gt;'"/>
        </xsl:if>
        <span class='level{@level}'></span>
        <xsl:apply-templates mode="jesus"/>
        <xsl:value-of select="'&lt;br /&gt;'"/>
    </xsl:template>

    <!-- While a BR is a break, if it is immediately followed by punctuation,
         indenting this rule can introduce whitespace.
      -->
    <xsl:template match="lb[@type = 'x-continued']">
        <p class="x-continued"/>
    </xsl:template>
    <xsl:template match="lb[@type = 'x-end-paragraph']">
        <p/>
    </xsl:template>
    <xsl:template match="lb">
        <p/>
    </xsl:template>
    <xsl:template match="lb" mode="jesus">
        <p/>
    </xsl:template>

    <xsl:template match="list">
        <xsl:choose>
            <xsl:when test="label">
                <!-- If there are <label>s in the list, it's a <dl>. -->
                <dl class="list">
                    <xsl:for-each select="node()">
                        <xsl:choose>
                            <xsl:when test="self::label">
                                <dt class="label">
                                    <xsl:apply-templates/>
                                </dt>
                            </xsl:when>
                            <xsl:when test="self::item">
                                <dd class="item">
                                    <xsl:apply-templates/>
                                </dd>
                            </xsl:when>
                            <xsl:when test="self::list">
                                <dd class="list-wrapper">
                                    <xsl:apply-templates select="."/>
                                </dd>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:apply-templates/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:for-each>
                </dl>
            </xsl:when>

            <xsl:otherwise>
                <!-- If there are no <label>s in the list, it's a plain old <ul>. -->
                <ul class="list">
                    <xsl:for-each select="node()">
                        <xsl:choose>
                            <xsl:when test="self::item">
                                <li class="item">
                                    <xsl:apply-templates/>
                                </li>
                            </xsl:when>
                            <xsl:when test="self::list">
                                <li class="list-wrapper">
                                    <xsl:apply-templates select="."/>
                                </li>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:apply-templates/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:for-each>
                </ul>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <xsl:template match="list" mode="jesus">
        <xsl:choose>
            <xsl:when test="label">
                <!-- If there are <label>s in the list, it's a <dl>. -->
                <dl class="list">
                    <xsl:for-each select="node()">
                        <xsl:choose>
                            <xsl:when test="self::label">
                                <dt class="label">
                                    <xsl:apply-templates mode="jesus"/>
                                </dt>
                            </xsl:when>
                            <xsl:when test="self::item">
                                <dd class="item">
                                    <xsl:apply-templates mode="jesus"/>
                                </dd>
                            </xsl:when>
                            <xsl:when test="self::list">
                                <dd class="list-wrapper">
                                    <xsl:apply-templates select="." mode="jesus"/>
                                </dd>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:apply-templates mode="jesus"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:for-each>
                </dl>
            </xsl:when>

            <xsl:otherwise>
                <!-- If there are no <label>s in the list, it's a plain old <ul>. -->
                <ul class="list">
                    <xsl:for-each select="node()">
                        <xsl:choose>
                            <xsl:when test="self::item">
                                <li class="item">
                                    <xsl:apply-templates mode="jesus"/>
                                </li>
                            </xsl:when>
                            <xsl:when test="self::list">
                                <li class="list-wrapper">
                                    <xsl:apply-templates select="." mode="jesus"/>
                                </li>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:apply-templates mode="jesus"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:for-each>
                </ul>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="mentioned">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="mentioned" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>

    <!-- Milestones represent characteristics of the original manuscript.
      == that are being preserved. For this reason, most are ignored.
      ==
      == The defined types are:
      == column   Marks the end of a column where there is a multi-column display.
      == footer   Marks the footer region of a page.
      == halfLine Used to mark half-line units if not otherwise encoded.
      == header   Marks the header region of a page.
      == line     Marks line breaks, particularly important in recording appearance of an original text, such as a manuscript.
      == pb       Marks a page break in a text.
      == screen   Marks a preferred place for breaks in an on-screen rendering of the text.
      == cQuote   Marks the location of a continuation quote mark, with marker containing the publishers mark.
      -->
    <!--  This is used by the KJV for paragraph markers. -->
    <xsl:template
            match="milestone[@type = 'x-p']"> <!-- <xsl:text> </xsl:text><xsl:value-of select="@marker"/><xsl:text> </xsl:text> --></xsl:template>
    <xsl:template match="milestone[@type = 'x-p']"
                  mode="jesus"><!-- <xsl:text> </xsl:text><xsl:value-of select="@marker"/><xsl:text> </xsl:text> --></xsl:template>

    <xsl:template match="milestone[@type = 'cQuote']">
        <xsl:value-of select="@marker"/>
    </xsl:template>

    <xsl:template match="milestone[@type = 'cQuote']" mode="jesus">
        <xsl:value-of select="@marker"/>
    </xsl:template>

    <xsl:template match="milestone[@type = 'line']">
        <br/>
    </xsl:template>

    <xsl:template match="milestone[@type = 'line']" mode="jesus">
        <br/>
    </xsl:template>

    <!--
      == Milestone start and end are deprecated.
      == At this point we expect them to not be in the document.
      == These have been replace with milestoneable elements.
      -->
    <xsl:template match="milestoneStart"/>
    <xsl:template match="milestoneEnd"/>

    <xsl:template match="name">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="name" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>


    <!-- If there is a milestoned q then just output a quotation mark -->
    <xsl:template match="q[@sID or @eID]">
        <xsl:choose>
            <xsl:when test="@marker">
                <xsl:value-of select="@marker"/>
            </xsl:when>
            <!-- The chosen mark should be based on the work's author's locale. -->
            <!--<xsl:otherwise>"</xsl:otherwise>-->
        </xsl:choose>
    </xsl:template>

    <xsl:template match="q[@sID or @eID]" mode="jesus">
        <xsl:choose>
            <xsl:when test="@marker">
                <xsl:value-of select="@marker"/>
            </xsl:when>
            <!-- The chosen mark should be based on the work's author's locale. -->
            <!--<xsl:otherwise>"</xsl:otherwise>-->
        </xsl:choose>
    </xsl:template>

    <xsl:template match="q[@who = 'Jesus']">
        <xsl:choose>
            <xsl:when test="$RedLetterText = 'true'">
                <span class="jesus">&#160;<xsl:value-of select="@marker"/>
                    <xsl:apply-templates mode="jesus"/>
                    <xsl:value-of select="@marker"/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="q">
                    <xsl:value-of select="@marker"/>
                    <xsl:apply-templates/>
                    <xsl:value-of select="@marker"/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="q[@type = 'blockquote']">
        <span class="q">
            <xsl:value-of select="@marker"/>
            <xsl:apply-templates/>
            <xsl:value-of select="@marker"/>
        </span>
    </xsl:template>

    <xsl:template match="q[@type = 'blockquote']" mode="jesus">
        <span class="q">
            <xsl:value-of select="@marker"/>
            <xsl:apply-templates mode="jesus"/>
            <xsl:value-of select="@marker"/>
        </span>
    </xsl:template>

    <xsl:template match="q[@type = 'citation']">
        <span class="q">
            <xsl:value-of select="@marker"/>
            <xsl:apply-templates/>
            <xsl:value-of select="@marker"/>
        </span>
    </xsl:template>

    <xsl:template match="q[@type = 'citation']" mode="jesus">
        <span class="q">
            <xsl:value-of select="@marker"/>
            <xsl:apply-templates mode="jesus"/>
            <xsl:value-of select="@marker"/>
        </span>
    </xsl:template>

    <xsl:template match="q[@type = 'embedded']">
        <xsl:choose>
            <xsl:when test="@marker">
                <xsl:value-of select="@marker"/>
                <xsl:apply-templates/>
                <xsl:value-of select="@marker"/>
            </xsl:when>
            <xsl:otherwise>
                <quote class="q">
                    <xsl:apply-templates/>
                </quote>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="q[@type = 'embedded']" mode="jesus">
        <xsl:choose>
            <xsl:when test="@marker">
                <xsl:value-of select="@marker"/>
                <xsl:apply-templates mode="jesus"/>
                <xsl:value-of select="@marker"/>
            </xsl:when>
            <xsl:otherwise>
                <quote class="q">
                    <xsl:apply-templates/>
                </quote>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="rdg[@type='x-qere']">
        <div class='hbFontSmall'>
            <xsl:apply-templates/>
            (Qere)
        </div>
    </xsl:template>

    <xsl:template match="rdg[@type='x-accent']">
        <p>
            <span class='hbFontSmall'>
                <xsl:apply-templates/>
            </span>
        </p>
    </xsl:template>


    <!-- An alternate reading. -->
    <xsl:template match="rdg">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="rdg" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>

    <!--
        <row> is handled near <table> below and so does not appear here.
    -->

    <xsl:template match="salute">
        <xsl:apply-templates/>
    </xsl:template>

    <!-- Avoid adding whitespace -->
    <xsl:template match="salute" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>

    <xsl:template match="signed">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="signed" mode="jesus">
        <xsl:apply-templates mode="jesus"/>
    </xsl:template>

    <xsl:template match="speech">
        <div class="speech">
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="speech" mode="jesus">
        <div class="speech">
            <xsl:apply-templates mode="jesus"/>
        </div>
    </xsl:template>

    <!-- ====================================================================== -->
    <!-- AJ 05-Oct-14 Simple table -->
    <xsl:template match="table[@type='x-simpleTable']">
        <div>
            <table class='x-simpleTable'>
                <xsl:apply-templates/>
            </table>
        </div>
        <p/>
    </xsl:template>

    <xsl:template match="row[@type='x-simpleTable-row']">
        <tr class='x-simpleTable-row'>
            <xsl:apply-templates/>
        </tr>
    </xsl:template>

    <xsl:template match="cell[@type='x-simpleTable-cell-left']">
        <td class='x-simpleTable-td-left'>
            <xsl:apply-templates/>
        </td>
    </xsl:template>

    <xsl:template match="cell[@type='x-simpleTable-cell-right']">
        <td class='x-simpleTable-td-right'>
            <xsl:apply-templates/>
        </td>
    </xsl:template>
    <!-- End AJ 05-Oct-14 Simple table -->
    <!-- ====================================================================== -->


    <xsl:template match="table">
        <xsl:choose>
            <xsl:when test="$Interleave = 'true'">
                <xsl:apply-templates select="row"/>
            </xsl:when>
            <xsl:otherwise>
                <table class="table comparingTable">
                    <xsl:copy-of select="@rows|@cols"/>
                    <xsl:if test="head">
                        <thead class="head">
                            <xsl:apply-templates select="head"/>
                        </thead>
                    </xsl:if>
                    <tbody>
                        <xsl:apply-templates select="row"/>
                    </tbody>
                </table>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="row">
        <xsl:variable name="hasWorthyText">
            <xsl:value-of select=".//verse or .//title[@canonical='true']"/>
        </xsl:variable>
        <xsl:if test="$hasWorthyText = 'true' or cell[@role='label']">
            <xsl:choose>
                <xsl:when test="$Interleave = 'true'">
                    <xsl:choose>
                        <xsl:when test="cell[@role = 'label']"></xsl:when>
                        <xsl:otherwise>
                            <div class="verseGrouping">
                                <xsl:variable name="verse" select="cell/verse"/>
                                <xsl:call-template name="interleavedVerseNum">
                                    <xsl:with-param name="verse" select="$verse"/>
                                </xsl:call-template>
                                <xsl:apply-templates/>
                            </div>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:choose>
                        <xsl:when test="cell[@role = 'label']">
                            <xsl:if test="$HideCompareHeaders != 'true'">
                                <tr>
                                    <th class="headingVerseNumber"></th>
                                    <xsl:call-template name="outputComparingTableHeader"></xsl:call-template>
                                </tr>
                            </xsl:if>
                        </xsl:when>
                        <xsl:otherwise>
                            <tr class="row">
                                <xsl:variable name="verse" select="(cell/div[@osisID] | cell/verse)[1]"/>
                                <xsl:call-template name="columnVerseNumber">
                                    <xsl:with-param name="verse" select="$verse"/>
                                </xsl:call-template>
                                <xsl:apply-templates/>
                            </tr>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

    <xsl:template name="outputComparingTableHeader">
        <xsl:variable name="version" select="interleaving:getNextVersion($interleavingProvider)"/>
        <th class="comparingVersionName" data-version="{$version}">
            <xsl:value-of select="$version"/>
        </th>

        <xsl:if test="not(interleaving:isFirstVersion($interleavingProvider))">
            <xsl:call-template name="outputComparingTableHeader"/>
        </xsl:if>
    </xsl:template>

    <xsl:template name="interleaveVerse">
        <xsl:param name="cell-direction"/>
        <xsl:param name="classes" select="''"/>

        <xsl:element name="span">
            <xsl:attribute name="class">singleVerse
                <xsl:value-of select="$classes"/><xsl:value-of select="$cell-direction"/>
            </xsl:attribute>
            <xsl:call-template name="interleavedVersion"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>

    <xsl:template name="columnVerse">
        <xsl:param name="cell-direction"/>
        <xsl:param name="classes" select="''"/>

        <xsl:variable name="element-name">
            <xsl:choose>
                <xsl:when test="@role = 'label'">
                    <xsl:text>th</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>td</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:element name="{$element-name}">
            <xsl:attribute name="class">cell
                <xsl:value-of select="$classes"/>
            </xsl:attribute>
            <xsl:attribute name="valign">top</xsl:attribute>
            <xsl:if test="@xml:lang">
                <xsl:attribute name="dir">
                    <xsl:value-of select="$cell-direction"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="$cell-direction = 'rtl'">
                <xsl:attribute name="align">
                    <xsl:value-of select="'right'"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@rows">
                <xsl:attribute name="rowspan">
                    <xsl:value-of select="@rows"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@cols">
                <xsl:attribute name="colspan">
                    <xsl:value-of select="@cols"/>
                </xsl:attribute>
            </xsl:if>
            <!-- hack alert -->
            <xsl:choose>
                <xsl:when test="$cell-direction = 'rtl'">
                    <xsl:apply-templates/>
                </xsl:when>
                <xsl:when test="$cell-direction = 'ltr'">
                    <xsl:apply-templates/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:element>
    </xsl:template>


    <xsl:template match="cell[@type and not(contains(@type, 'x-simpleTable'))]">
        <xsl:variable name="extraClasses">
            <xsl:if test="contains(@type, 'x-indented')">x-indented</xsl:if>
        </xsl:variable>
        <div class="x-min-width {$extraClasses}">
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="cell">
        <xsl:variable name="cell-direction">

            <xsl:if test="@xml:lang">
                <xsl:call-template name="getDirection">
                    <xsl:with-param name="lang">
                        <xsl:value-of select="@xml:lang"/>
                    </xsl:with-param>
                </xsl:call-template>
            </xsl:if>
        </xsl:variable>


        <xsl:choose>
            <!-- interleaving or tabular column form -->
            <xsl:when test="$Interleave = 'true'">
                <xsl:if test="$comparing = false()">
                    <xsl:call-template name="interleaveVerse">
                        <xsl:with-param name="cell-direction" select="$cell-direction"/>
                    </xsl:call-template>
                </xsl:if>
                <!-- output twice the cell of those diffs we have found if we are comparing -->
                <xsl:if test="$comparing = true() and not(.//verse) and not(.//title)">
                    <!-- output twice, but with slightly different styles -->
                    <xsl:call-template name="interleaveVerse">
                        <xsl:with-param name="cell-direction" select="$cell-direction"/>
                        <xsl:with-param name="classes" select="'primary '"/>
                    </xsl:call-template>
                    <xsl:call-template name="interleaveVerse">
                        <xsl:with-param name="cell-direction" select="$cell-direction"/>
                        <xsl:with-param name="classes" select="'secondary '"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:when>
            <xsl:otherwise>
                <xsl:if test="$comparing = false()">
                    <xsl:call-template name="columnVerse">
                        <xsl:with-param name="cell-direction" select="$cell-direction"/>
                    </xsl:call-template>
                </xsl:if>


                <xsl:if test="$comparing = true()  and not(.//verse) and not(.//title)">
                    <xsl:call-template name="columnVerse">
                        <xsl:with-param name="cell-direction" select="$cell-direction"/>
                        <xsl:with-param name="classes" select="'primary '"/>
                    </xsl:call-template>
                    <xsl:call-template name="columnVerse">
                        <xsl:with-param name="cell-direction" select="$cell-direction"/>
                        <xsl:with-param name="classes" select="'secondary '"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>


    </xsl:template>

    <xsl:template match="transChange">
        <span>
            <em>
                <xsl:apply-templates/>
            </em>
        </span>
    </xsl:template>
    <xsl:template match="transChange" mode="jesus">
        <span class="w">
            <em>
                <xsl:apply-templates/>
            </em>
        </span>
    </xsl:template>

    <!-- @type is OSIS, @rend is TEI -->
    <xsl:template match="hi">
        <xsl:variable name="style">
            <xsl:choose>
                <xsl:when test="@type">
                    <xsl:value-of select="@type"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="@rend"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$style = 'acrostic'">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:when test="$style = 'bold'">
                <strong>
                    <xsl:apply-templates/>
                </strong>
            </xsl:when>
            <xsl:when test="$style = 'emphasis'">
                <em>
                    <xsl:apply-templates/>
                </em>
            </xsl:when>
            <xsl:when test="$style = 'illuminated'">
                <strong>
                    <em>
                        <xsl:apply-templates/>
                    </em>
                </strong>
            </xsl:when>
            <xsl:when test="$style = 'italic'">
                <em>
                    <xsl:apply-templates/>
                </em>
            </xsl:when>
            <xsl:when test="$style = 'line-through'">
                <span class="cmpStrike">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="$style = 'normal'">
                <span class="normal">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="$style = 'small-caps'">
                <span class="small-caps">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="$style = 'sub'">
                <sub>
                    <xsl:apply-templates/>
                </sub>
            </xsl:when>
            <xsl:when test="$style = 'super'">
                <sup>
                    <xsl:apply-templates/>
                </sup>
            </xsl:when>
            <xsl:when test="$style = 'underline'">
                <span class="cmpUnderline">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="$style = 'x-caps'">
                <span class="caps">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="hi" mode="jesus">
        <xsl:variable name="style">
            <xsl:choose>
                <xsl:when test="@type">
                    <xsl:value-of select="@type"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="@rend"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$style = 'acrostic'">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:when test="$style = 'bold'">
                <strong>
                    <xsl:apply-templates/>
                </strong>
            </xsl:when>
            <xsl:when test="$style = 'emphasis'">
                <em>
                    <xsl:apply-templates/>
                </em>
            </xsl:when>
            <xsl:when test="$style = 'illuminated'">
                <strong>
                    <em>
                        <xsl:apply-templates/>
                    </em>
                </strong>
            </xsl:when>
            <xsl:when test="$style = 'italic'">
                <em>
                    <xsl:apply-templates/>
                </em>
            </xsl:when>
            <xsl:when test="$style = 'line-through'">
                <span class="strike">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="$style = 'normal'">
                <span class="normal">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="$style = 'small-caps'">
                <span class="small-caps">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="$style = 'sub'">
                <sub>
                    <xsl:apply-templates/>
                </sub>
            </xsl:when>
            <xsl:when test="$style = 'super'">
                <sup>
                    <xsl:apply-templates/>
                </sup>
            </xsl:when>
            <xsl:when test="$style = 'underline'">
                <span class="underline">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="$style = 'x-caps'">
                <span class="caps">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!--
      The following elements are actually TEI and there is some expectation
      that these will make it into OSIS.
    -->
    <xsl:template match="superentry">
        <!-- output each preverse element in turn -->
        <xsl:for-each select="entry|entryFree">
            <xsl:apply-templates/>
            <br/>
            <br/>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="entry">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="entryFree">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="form">
        <xsl:apply-templates/>
        <br/>
    </xsl:template>

    <xsl:template match="orth">
        <font class="orth">
            <xsl:apply-templates/>
        </font>
    </xsl:template>

    <xsl:template match="pron">
        <font class="pron">
            <xsl:apply-templates/>
        </font>
    </xsl:template>

    <xsl:template match="etym">
        <font class="etym">
            <xsl:apply-templates/>
        </font>
    </xsl:template>

    <xsl:template match="def">
        <font class="def">
            <xsl:apply-templates/>
        </font>
    </xsl:template>

    <xsl:template match="usg">
        <font class="usg">
            <xsl:apply-templates/>
        </font>
    </xsl:template>

    <xsl:template match="@xml:lang">
        <xsl:variable name="dir">
            <xsl:if test="@xml:lang">
                <xsl:call-template name="getDirection">
                    <xsl:with-param name="lang">
                        <xsl:value-of select="@xml:lang"/>
                    </xsl:with-param>
                </xsl:call-template>
            </xsl:if>
        </xsl:variable>
        <xsl:if test="$dir">
            <xsl:attribute name="dir">
                <xsl:value-of select="$dir"/>
            </xsl:attribute>
        </xsl:if>
    </xsl:template>

    <xsl:template match="text()" mode="small-caps">
        <xsl:value-of select="translate(., 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
    </xsl:template>

    <xsl:template match="text()">
        <xsl:choose>
            <xsl:when
                    test="name(./preceding-sibling::node()) and name(./following-sibling::node()) = 'note' and normalize-space(.) = ','"></xsl:when>
            <xsl:when test="./ancestor::cell/@xml:lang != 'grc' and ./ancestor::cell/@xml:lang != 'he'">
                <xsl:value-of select="."/>
            </xsl:when>
            <xsl:when test="$RemoveVowels = 'true'">
                <xsl:value-of select="conversion:unAccent(string(.))"/>
            </xsl:when>
            <xsl:when test="$RemovePointing = 'true'">
                <xsl:value-of select="conversion:unAccentLeavingVowels(string(.))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <!--
      The direction is deduced from the xml:lang attribute and is assumed to be meaningful for those elements.
      Note: there is a bug that prevents dir=rtl from working.
      see: http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4296022 and 4866977
    -->
    <xsl:template name="getDirection">
        <xsl:param name="lang"/>
        <xsl:choose>
            <xsl:when test="$lang = 'he' or $lang = 'ar' or $lang = 'fa' or $lang = 'ur' or $lang = 'syr'">
                <xsl:value-of select="'rtl'"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="'ltr'"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="string-replace-all">
        <xsl:param name="text"/>
        <xsl:param name="replace"/>
        <xsl:param name="by"/>
        <xsl:choose>
            <xsl:when test="contains($text, $replace)">
                <xsl:value-of select="substring-before($text,$replace)"/>
                <xsl:value-of select="$by"/>
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="substring-after($text,$replace)"/>
                    <xsl:with-param name="replace" select="$replace"/>
                    <xsl:with-param name="by" select="$by"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$text"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
