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
 * Transforms OSIS to HTML for viewing within Web browsers.
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
  xmlns:morph="xalan://com.tyndalehouse.step.core.service.impl.MorphologyServiceImpl"
  xmlns:vocab="xalan://com.tyndalehouse.step.core.service.impl.VocabularyServiceImpl"
  xmlns:conversion="xalan://com.tyndalehouse.step.core.utils.StringConversionUtils"
  extension-element-prefixes="jsword morph vocab conversion">

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
  <xsl:param name="baseURL" select="''"/>

  <!-- Whether to show Strongs or not -->
  <xsl:param name="EnglishVocab" select="'false'"/>
  <xsl:param name="es_Vocab" select="'false'"/>
  <xsl:param name="zh_tw_Vocab" select="'false'"/>
  <xsl:param name="zh_Vocab" select="'false'"/>
  <xsl:param name="Transliteration" select="'false'"/>
  <xsl:param name="GreekVocab" select="'false'"/>
  <xsl:param name="OriginalTransliteration" select="'false'" />

  <!-- Whether to show morphologic forms or not -->
  <xsl:param name="Morph" select="'false'"/>

   <!-- Whether to display Jesus' words in red or not -->
  <xsl:param name="RedLetterText" select="'false'" />
 
  <!-- Whether to show non-canonical "headings" or not -->
  <xsl:param name="Headings" select="'false'"/>

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
  <xsl:param name="ColorCoding" select="'false'" />
  <xsl:param name="DivideHebrew" select="'false'" />
  <xsl:param name="RemovePointing" select="'true'" />
  <xsl:param name="RemoveVowels" select="'true'" />


  <xsl:param name="baseVersion" select="''" />
  <!--  a comma separated list of versions to display, if provided, then we display the interlinear -->
  <xsl:param name="interlinearVersion" select="''" />
  <xsl:param name="morphologyProvider" />
  <xsl:param name="vocabProvider" />
  <xsl:param name="colorCodingProvider" />
  <xsl:param name="isOT" select="'false'" />
 
  <!--  set up interlinear provider, if we have requested it -->
  <xsl:param name="interlinearProvider" />
 
  <!--  TODO: support alternate versification -->
  <xsl:variable name="v11nf" select="jsword:org.crosswire.jsword.versification.system.Versifications.instance()"/>

  <!-- Create a global key factory from which OSIS ids will be generated -->
  <xsl:variable name="keyf" select="jsword:org.crosswire.jsword.passage.PassageKeyFactory.instance()"/>
  <!-- Create a global number shaper that can transform 0-9 into other number systems. -->
  <xsl:variable name="shaper" select="jsword:org.crosswire.common.icu.NumberShaper.new()"/>
  

  <xsl:variable name="punctuation" select="'|\,./&lt;&gt;?;\#:@~[]{}-=_+`¬!£$%^&amp;*()&quot;'" />


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
                      <xsl:apply-templates select="//verse" mode="print-notes"/>
                </div>
              </xsl:when>
              <xsl:otherwise>
                <div class="notesPane">
                  <!-- In a right to left, the alignment should be reversed too -->
                      <p>&#160;</p>
                      <xsl:apply-templates select="//note" mode="print-notes"/>
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
    <!--  do nothing in interlinears -->
  </xsl:template>

    <xsl:template match="div[@type='introduction'][@sID]">
        &lt;span class='introduction'&gt;
    </xsl:template>

    <xsl:template match="div[@type='introduction'][@eID]">
        &lt;/span&gt;
    </xsl:template>


    <xsl:template match="div">
        <xsl:if test="@osisID">
            <xsl:if test="$interlinearVersion != ''"><xsl:value-of select="jsword:setLastSeenOsisId($interlinearProvider, @osisID)" /></xsl:if>
        </xsl:if>
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
            <h3 class="heading"><xsl:apply-templates /></h3>
          </xsl:if>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:for-each>
    <!-- Handle the KJV paragraph marker. -->
    <!-- If the verse doesn't start on its own line and -->
    <!-- the verse is not the first verse of a set of siblings, -->
    <!-- output an extra space. -->
    <xsl:if test="preceding-sibling::*[local-name() = 'verse']">
      <xsl:text>&#160;</xsl:text>
    </xsl:if>
    <!-- Always output the verse -->
        <span class="interlinear {$direction}"><xsl:call-template name="versenum"/><xsl:apply-templates/></span>
        <!-- Follow the verse with an extra space -->
        <!-- when they don't start on lines to themselves -->
        <xsl:text> </xsl:text>
  </xsl:template>

  <xsl:template match="verse[not(@eID)]" mode="jesus">
    <!-- If the verse doesn't start on its own line and -->
    <!-- the verse is not the first verse of a set of siblings, -->
    <!-- output an extra space. -->
    <xsl:if test="preceding-sibling::*[local-name() = 'verse']">
      <xsl:text>&#160;</xsl:text>
    </xsl:if>
    <xsl:variable name="title" select=".//title"/>
    <xsl:if test="string-length($title) > 0">
      <h3 class="heading"><xsl:value-of select="$title"/></h3>
    </xsl:if>
    <!-- Handle the KJV paragraph marker. -->
    <!-- Always output the verse -->
        <xsl:call-template name="versenum"/><xsl:apply-templates mode="jesus"/>
        <!-- Follow the verse with an extra space -->
        <!-- when they don't start on lines to themselves -->
        <xsl:text> </xsl:text>
  </xsl:template>

  <xsl:template match="verse" mode="print-notes">
    <xsl:if test=".//note[not(@type) or not(@type = 'x-strongsMarkup')]">
     <xsl:variable name="versification" select="jsword:getVersification($v11nf, $v11n)"/>
      <xsl:variable name="passage" select="jsword:getValidKey($keyf, $versification, @osisID)"/>
      <a href="#{substring-before(concat(@osisID, ' '), ' ')}">
        <xsl:value-of select="jsword:getName($passage)"/>
      </a>
      <xsl:apply-templates select=".//note" mode="print-notes" />
      <div><xsl:text>&#160;</xsl:text></div>
    </xsl:if>
  </xsl:template>

  <xsl:template name="versenum">
    <!-- Are verse numbers wanted? -->
    <xsl:if test="$VNum = 'true'">
      <!-- An osisID can be a space separated list of them -->
      <xsl:variable name="firstOsisID" select="substring-before(concat(@osisID, ' '), ' ')"/>
      <xsl:variable name="book" select="substring-before($firstOsisID, '.')"/>
      <xsl:variable name="chapter" select="jsword:shape($shaper, substring-before(substring-after($firstOsisID, '.'), '.'))"/>
      <!-- If n is present use it for the number -->
      <xsl:variable name="verse">
        <xsl:choose>
          <xsl:when test="@n">
            <xsl:value-of select="jsword:shape($shaper, string(@n))"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="jsword:shape($shaper, substring-after(substring-after($firstOsisID, '.'), '.'))"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="versenum">
        <xsl:choose>
          <xsl:when test="$BCVNum = 'true'">
            <xsl:variable name="versification" select="jsword:getVersification($v11nf, $v11n)"/>
      		<xsl:variable name="passage" select="jsword:getValidKey($keyf, $versification, @osisID)"/>
            <xsl:value-of select="jsword:getName($passage)"/>
          </xsl:when>
          <xsl:when test="$CVNum = 'true'">
            <xsl:value-of select="concat($chapter, ':', $verse)"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$verse"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <!--
        == Surround versenum with dup
        -->
	  <!-- If the following are updated, please update doFonts function in view_display.js
	       doFonts expects to find 'span.w.verseStart' and then "span.strongs" or "span.morphs"
		   doFonts also look for ["Text Trans", "Orig Vocab", "Vocab Trans", "Eng Vocab", "Esp Vocab", "中文詞", "中文词"] or "Grammar"
	    -->
      <xsl:choose>
        <xsl:when test="$TinyVNum = 'true' and $Notes = 'true'">
          <span class="w verseStart">
          	<!--  the verse number -->
          	<a name="{@osisID}" class="verseLink"><span class="interVerseNumbers verseNumber"><xsl:value-of select="concat($baseVersion, ' ', $versenum)"/></span></a>

            <!-- The order of these is important for rendering on the UI -->
			<!-- output a filling gap for strongs -->
            <xsl:if test="$OriginalTransliteration = 'true'">
                <span class="strongs">Text Trans</span>
            </xsl:if>
			<xsl:if test="$GreekVocab = 'true'">
				<span class="strongs">Orig Vocab</span>
			</xsl:if>
			<xsl:if test="$Transliteration = 'true'">
				<span class="strongs">Vocab Trans</span>
			</xsl:if>
			<xsl:if test="$EnglishVocab = 'true'">
				<span class="strongs">Eng Vocab</span>
			</xsl:if>
			<xsl:if test="$es_Vocab = 'true'">
				<span class="strongs">Esp Vocab</span>
			</xsl:if>
			<xsl:if test="$zh_tw_Vocab = 'true'">
				<span class="strongs">中文詞</span>
			</xsl:if>
			<xsl:if test="$zh_Vocab = 'true'">
				<span class="strongs">中文词</span>
			</xsl:if>

			<!-- output a filling gap for morphs -->
			<xsl:if test="$Morph = 'true'">
				<span class="morphs">Grammar</span>
			</xsl:if>
		
			<!--  fill up with spaces where we have extra versions shown -->
			<xsl:if test="normalize-space($interlinearVersion) != ''">
				<xsl:call-template name="outputVersionNames">
					<xsl:with-param name="versions" select="$interlinearVersion" />
					<xsl:with-param name="printVersions" select="'print'" />
				</xsl:call-template>
			</xsl:if>
		</span>
        </xsl:when>
	  <!-- If the following are updated, please update doFonts function in view_display.js
	       doFonts expects to find 'span.w.verseStart' and then "span.strongs" or "span.morphs"
		   doFonts also look for ["Text Trans", "Orig Vocab", "Vocab Trans", "Eng Vocab", "Esp Vocab", "中文詞", "中文词"] or "Grammar"
	    -->
        <xsl:when test="$TinyVNum = 'true' and $Notes = 'false'">
          <span class="w verseStart">
          	<!--  the verse number -->
          	<a name="{@osisID}" class="verseLink"><span class="text"><span class="smallHeaders interVerseNumbers verseNumber"><xsl:value-of select="concat($baseVersion, ' ', $versenum)"/></span></span></a>
          	
			<!-- output a filling gap for strongs -->
              <xsl:if test="$OriginalTransliteration = 'true'">
                  <span class="text"><span class="smallHeaders strongs">Text Trans</span></span>
              </xsl:if>
              <xsl:if test="$GreekVocab = 'true'">
                  <span class="text"><span class="smallHeaders strongs">Orig Vocab</span></span>
              </xsl:if>
			  <xsl:if test="$Transliteration = 'true'">
				  <span class="text"><span class="smallHeaders strongs">Vocab Trans</span></span>
			  </xsl:if>
              <xsl:if test="$EnglishVocab = 'true'">
                  <span class="text"><span class="smallHeaders strongs">Eng Vocab</span></span>
              </xsl:if>
              <xsl:if test="$es_Vocab = 'true'">
                  <span class="text"><span class="smallHeaders strongs">Esp Vocab</span></span>
              </xsl:if>
              <xsl:if test="$zh_tw_Vocab = 'true'">
                  <span class="text"><span class="smallHeaders strongs">中文詞</span></span>
              </xsl:if>
              <xsl:if test="$zh_Vocab = 'true'">
                  <span class="text"><span class="smallHeaders strongs">中文词</span></span>
              </xsl:if>

			<!-- output a filling gap for morphs -->
			<xsl:if test="$Morph = 'true'">
				<span class="text"><span class="smallHeaders morphs">Grammar</span></span>
			</xsl:if>
		
			<!--  fill up with spaces where we have extra versions shown -->
			<xsl:if test="normalize-space($interlinearVersion) != ''">
				<xsl:call-template name="outputVersionNames">
					<xsl:with-param name="versions" select="$interlinearVersion" />
					<xsl:with-param name="printVersions" select="'print'" />
				</xsl:call-template>
			</xsl:if>
		</span>
        </xsl:when>
        <xsl:when test="$TinyVNum = 'false' and $Notes = 'true'">
          <a name="{@osisID}" class="verseLink">(<xsl:value-of select="$versenum"/>)</a>
          <xsl:text> </xsl:text>
        </xsl:when>
        <xsl:otherwise>
          (<xsl:value-of select="$versenum"/>)
          <xsl:text> </xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
    <xsl:if test="$VNum = 'false' and $Notes = 'true'">
      <a name="{@osisID}" class="verseLink"></a>
    </xsl:if>
  </xsl:template>

  <!--=======================================================================-->
  <xsl:template match="a">
    <a href="{@href}"><xsl:apply-templates/></a>
  </xsl:template>

  <xsl:template match="a" mode="jesus">
    <a href="{@href}"><xsl:apply-templates mode="jesus"/></a>
  </xsl:template>

  <!--=======================================================================-->
  <!-- When we encounter a note, we merely output a link to the note. -->
  <xsl:template match="note[@type = 'x-strongsMarkup']"/>
  <xsl:template match="note[@type = 'x-strongsMarkup']" mode="jesus"/>
  <xsl:template match="note[@type = 'x-strongsMarkup']" mode="print-notes"/>

  <xsl:template match="note">
    <xsl:if test="$Notes = 'true'">
      <!-- If there is a following sibling that is a note, emit a separator -->
      <xsl:variable name="siblings" select="../child::node()"/>
      <xsl:variable name="next-position" select="position() + 1"/>
      <xsl:choose>
        <xsl:when test="name($siblings[$next-position]) = 'note'">
          <sup class="note"><a href="#note-{generate-id(.)}"><xsl:call-template name="generateNoteXref"/></a>, </sup>
        </xsl:when>
        <xsl:otherwise>
          <sup class="note"><a href="#note-{generate-id(.)}"><xsl:call-template name="generateNoteXref"/></a></sup>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <xsl:template match="note" mode="jesus">
    <xsl:if test="$Notes = 'true'">
     <!-- If there is a following sibling that is a note, emit a separator -->
      <xsl:variable name="siblings" select="../child::node()"/>
      <xsl:variable name="next-position" select="position() + 1"/>
      <xsl:choose>
        <xsl:when test="$siblings[$next-position] and name($siblings[$next-position]) = 'note'">
          <sup class="note"><a href="#note-{generate-id(.)}"><xsl:call-template name="generateNoteXref"/></a>, </sup>
        </xsl:when>
        <xsl:otherwise>
          <sup class="note"><a href="#note-{generate-id(.)}"><xsl:call-template name="generateNoteXref"/></a></sup>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <!--=======================================================================-->
  <xsl:template match="note" mode="print-notes">
    <div class="margin">
      <strong><xsl:call-template name="generateNoteXref"/></strong>
      <a name="note-{generate-id(.)}">
        <xsl:text> </xsl:text>
      </a>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <!--
    == If the n attribute is present then use that for the cross ref otherwise create a letter.
    == Note: numbering restarts with each verse.
    -->
  <xsl:template name="generateNoteXref">
    <xsl:choose>
      <xsl:when test="@n">
        <xsl:value-of select="@n"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:number level="any" from="/osis//verse" format="a"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!--=======================================================================-->
  <xsl:template match="p">
    <xsl:apply-templates/>
  </xsl:template>
  
  <xsl:template match="p" mode="jesus">
    <xsl:apply-templates mode="jesus"/>
  </xsl:template>
  
  <!--=======================================================================-->
  <xsl:template match="p" mode="print-notes">
    <!-- FIXME: This ignores text in the note. -->
    <!-- don't put para's in notes -->
  </xsl:template>

  <!--=======================================================================-->
  <!-- This section defines the interlinear word 							 -->
  <!--=======================================================================-->
	<xsl:template match="w">
		<xsl:call-template name="outputInterlinearWord">
			<xsl:with-param name="classes" select="'w'" />
		</xsl:call-template>
	</xsl:template>

	<xsl:template match="w" mode="jesus">
		<xsl:call-template name="outputInterlinearWord">
			<xsl:with-param name="classes" select="'w jesus'" />
		</xsl:call-template>
	</xsl:template>

	<xsl:template match="w" mode="small-caps">
		<xsl:call-template name="outputInterlinearWord">
			<xsl:with-param name="classes" select="'w smallcaps'" />
		</xsl:call-template>
	</xsl:template>


	<xsl:template name="outputInterlinearWord">
		<xsl:param name="classes" select="'w'" />
	
		<!-- Output the content followed by all the lemmas and then all the morphs. 
			So, we know we have a number of lines to create, therefore, we'll create 
			that many! -->
		<xsl:variable name="innerWordText"><xsl:apply-templates /></xsl:variable>

		<xsl:variable name="lookAhead" select="normalize-space(following-sibling::node()[1][self::text()])" />
<!-- 		<xsl:message>lookahead=<xsl:value-of select="$lookAhead"></xsl:value-of></xsl:message>         -->
		<xsl:variable name="nextText">
			<xsl:choose>
				<xsl:when test="jsword:com.tyndalehouse.step.core.utils.StringUtils.containsAlphaNumeric($lookAhead)"></xsl:when>
				<xsl:otherwise><xsl:value-of select="$lookAhead" /></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
<!-- 		<xsl:message>nextText=<xsl:value-of select="$nextText"></xsl:value-of></xsl:message>         -->
	
<!-- 		<xsl:if test="jsword:com.tyndalehouse.step.core.utils.StringUtils.containsAlphaNumeric($nextText)"> -->
<!-- 			<xsl:variable name="nextText" select="''"/> -->
<!-- 		</xsl:if> -->

		<!-- start the block only if we have english to show? -->
		<xsl:variable name="remainingText" select="$innerWordText" />				
		<xsl:if test="$remainingText != ''">
			<xsl:variable name="colorClass">
				<xsl:choose>
				<xsl:when test="$ColorCoding = 'true'">
					<xsl:variable name="className" select="jsword:getColorClass($colorCodingProvider, @morph)" />
					<xsl:value-of select="$className" />
				</xsl:when>
				<xsl:otherwise><xsl:value-of select="''" /></xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
    
    		<xsl:variable name="lemma" select="conversion:getStrongPaddedKey(@lemma)" />
			<span class="{$classes} {$colorClass}" strong="{$lemma}" morph="{@morph}">
				<xsl:if test="normalize-space($remainingText) != ''">
					<!-- 1st - Output first line or a blank if no text available. -->
					<xsl:variable name="outputText">
                            <xsl:call-template name="outputNonBlank">
                                <xsl:with-param name="string" select="$remainingText" />
                                <xsl:with-param name="nextText" select="$nextText" />
                            </xsl:call-template>
                    </xsl:variable>
                    <span class="text"><xsl:value-of select="$outputText" /></span>

					<!-- 2nd - Output strongs if turned on. If turned on and no Strong then 
						we need a blank. So always call template if turned on 
						There are three sets of strong possibilities
						-->
                    <xsl:if test="$OriginalTransliteration = 'true'">
                        <span class="strongs transliteration">
                            <xsl:value-of
                                    select="vocab:getTransliteration($vocabProvider, string($outputText))" />
                        </span>
                    </xsl:if>
                    <xsl:if test="$GreekVocab = 'true'">
                        <xsl:variable name="ancientClass">
                            <xsl:choose>
                                <xsl:when test="$isOT = 'true'">hbFont ancientVocab</xsl:when>
                                <xsl:otherwise>unicodeFont</xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>
						<span class="{$ancientClass}">
								<xsl:value-of
									select="vocab:getGreekVocab($vocabProvider,  $baseVersion, ./ancestor::*[@osisID]/@osisID , @lemma)" />
						</span>
					</xsl:if>
					<xsl:if test="$Transliteration = 'true'">
						<span class="strongs transliteration">
								<xsl:value-of
									select="vocab:getDefaultTransliteration($vocabProvider,  $baseVersion, ./ancestor::*[@osisID]/@osisID, @lemma)" />
						</span>
					</xsl:if>
					<xsl:if test="$EnglishVocab = 'true'">
						<span class="strongs">
								<xsl:value-of
									select="vocab:getEnglishVocab($vocabProvider, $baseVersion, ./ancestor::*[@osisID]/@osisID ,@lemma)" />
						</span>
					</xsl:if>
					<xsl:if test="$es_Vocab = 'true'">
						<span class="strongs">
								<xsl:value-of
									select="vocab:get_es_Vocab($vocabProvider, $baseVersion, ./ancestor::*[@osisID]/@osisID ,@lemma)" />
						</span>
					</xsl:if>
					<xsl:if test="$zh_tw_Vocab = 'true'">
						<span class="strongs">
								<xsl:value-of
									select="vocab:get_zh_tw_Vocab($vocabProvider, $baseVersion, ./ancestor::*[@osisID]/@osisID ,@lemma)" />
						</span>
					</xsl:if>
					<xsl:if test="$zh_Vocab = 'true'">
						<span class="strongs">
								<xsl:value-of
									select="vocab:get_zh_Vocab($vocabProvider, $baseVersion, ./ancestor::*[@osisID]/@osisID ,@lemma)" />
						</span>
					</xsl:if>

					<!-- 3rd - Output morphology if turned on. If turned on and no morphology,
						we need a blank. -->
					<xsl:if test="$Morph = 'true'">
						<span class="morphs">
							<xsl:value-of
								select="morph:getDisplayMorphology($morphologyProvider, @morph)" />
						</span>
					</xsl:if>
		
					<!-- 4th - We output the interlinears if provided and we do so recursively -->
					<xsl:if test="normalize-space($interlinearVersion) != ''">
						<xsl:call-template name="interlinear">
							<xsl:with-param name="versions" select="$interlinearVersion" />
						</xsl:call-template>
					</xsl:if>
	
			</xsl:if>
	
			<!-- end the block -->
			</span>
		</xsl:if>
	</xsl:template>
  
  <xsl:template name="interlinear">
  	<xsl:param name="versions" />  	

	<xsl:variable name="nextVersion" select="normalize-space(substring-before($versions, ','))" />
    <!-- <xsl:variable name="verseNumber" select="concat(../@osisID , ../../@osisID)" /> -->
    <xsl:variable name="verseNumber" select="./ancestor::*[@osisID]/@osisID" />
      
      <!--  if next version is not empty, then there was a comma, so we output this version and call template again -->
	<xsl:choose>
		<xsl:when test="normalize-space($nextVersion) != ''">
			<span class="interlinear">
				<xsl:variable name="interlinearWord">
					<xsl:call-template name="outputNonBlank">
						<xsl:with-param name="string">
							<xsl:value-of select="jsword:getWord($interlinearProvider, normalize-space($nextVersion), $verseNumber, @lemma, @morph)" />
						</xsl:with-param>
					</xsl:call-template>
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="starts-with($interlinearWord, '#')">
						<span class='interlinearChange'>[<xsl:value-of select="substring($interlinearWord, 2)" />]</span>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="$interlinearWord"></xsl:value-of>
					</xsl:otherwise>
				</xsl:choose>
			</span>
			<xsl:call-template name="interlinear">
				<xsl:with-param name="versions" select="substring-after($versions, ',')" />
			</xsl:call-template>
		</xsl:when>
		<!-- otherwise, then we can use the remainder as the version, as long as version not empty (for e.g. a trailing comma) -->
		<xsl:otherwise>
		    <xsl:if test="normalize-space($versions) != ''" >
				<span class="interlinear">
					<xsl:variable name="interlinearWord">
						<xsl:call-template name="outputNonBlank">
							<xsl:with-param name="string">
								<xsl:value-of select="jsword:getWord($interlinearProvider, normalize-space($versions), $verseNumber, @lemma, @morph)" />
							</xsl:with-param>
						</xsl:call-template>
					</xsl:variable>
					<xsl:choose>
						<xsl:when test="starts-with($interlinearWord, '#')">
							<span class='interlinearChange'>[<xsl:value-of select="substring($interlinearWord, 2)" />]</span>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$interlinearWord"></xsl:value-of>
						</xsl:otherwise>
					</xsl:choose>
				</span>
			</xsl:if>
		</xsl:otherwise>
	</xsl:choose>
  </xsl:template>
  
  <xsl:template name="outputNonBlank">
  	<xsl:param name="string" />
  	<xsl:param name="nextText" select="''" />
  	<xsl:choose>
  		<xsl:when test="normalize-space($string) != ''">
  			<xsl:value-of select="normalize-space($string)" />
  		</xsl:when>
        <xsl:otherwise><xsl:value-of select="$nextText"/><xsl:value-of select="'&#160;'" /></xsl:otherwise>
  	</xsl:choose>
  	
  </xsl:template>
  
  <!--=======================================================================-->
  <xsl:template match="seg">
    <xsl:choose>
      <xsl:when test="starts-with(@type, 'color:')">
        <font color="{substring-before(substring-after(@type, 'color: '), ';')}"><xsl:apply-templates/></font>
      </xsl:when>
      <xsl:when test="starts-with(@type, 'font-size:')">
        <font size="{substring-before(substring-after(@type, 'font-size: '), ';')}"><xsl:apply-templates/></font>
      </xsl:when>
      <xsl:when test="@type = 'x-variant'">
        <xsl:if test="@subType = 'x-class-1' or @subType ='x-1'">
          <xsl:apply-templates/>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise><xsl:apply-templates/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="seg" mode="jesus">
    <xsl:choose>
      <xsl:when test="starts-with(@type, 'color:')">
        <font color="{substring-before(substring-after(@type, 'color: '), ';')}"><xsl:apply-templates mode="jesus"/></font>
      </xsl:when>
      <xsl:when test="starts-with(@type, 'font-size:')">
        <font size="{substring-before(substring-after(@type, 'font-size: '), ';')}"><xsl:apply-templates mode="jesus"/></font>
      </xsl:when>
      <xsl:when test="@type = 'x-variant'">
        <xsl:if test="@subType = 'x-class-1' or @subType ='x-1'">
          <xsl:apply-templates mode="jesus"/>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise><xsl:apply-templates mode="jesus"/></xsl:otherwise>
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
	    	<font class="jesus"><xsl:apply-templates mode="jesus"/></font>
	    </xsl:when>
	    <xsl:otherwise>
	    	<font class="speech"><xsl:apply-templates /></font>
	    </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="speaker">
    <font class="speech"><xsl:apply-templates/></font>
  </xsl:template>

  <!--=======================================================================-->
  <xsl:template match="title[@subType ='x-preverse' or @subtype = 'x-preverse']" name="outputCanonicalTitlesOutsideVerse">
      <!-- Verses handle most titles, however, if they are not in a verse, then we handle them here. -->
      <xsl:if test="not(./ancestor::verse)">
          <span class="interlinear {$direction}"><xsl:apply-templates/></span>
      </xsl:if>
  </xsl:template>

  <xsl:template match="title[@subType ='x-preverse' or @subtype = 'x-preverse']" mode="jesus">
    <xsl:call-template name="outputCanonicalTitlesOutsideVerse" />
  </xsl:template>

  <!--=======================================================================-->
  <xsl:template match="title[@level]">
    <!-- Always show canonical titles or if headings is turned on -->
    <xsl:if test="@canonical = 'true' or $Headings = 'true'">
      <xsl:choose>
        <xsl:when test="@level = '1'">
          <h1 class="level"><xsl:apply-templates/></h1>
        </xsl:when>
        <xsl:when test="@level = '2'">
          <h2 class="level"><xsl:apply-templates/></h2>
        </xsl:when>
        <xsl:when test="@level = '3'">
          <h3 class="level"><xsl:apply-templates/></h3>
        </xsl:when>
        <xsl:when test="@level = '4'">
          <h4 class="level"><xsl:apply-templates/></h4>
        </xsl:when>
        <xsl:when test="@level = '5'">
          <h5 class="level"><xsl:apply-templates/></h5>
        </xsl:when>
        <xsl:otherwise>
          <h6 class="level"><xsl:apply-templates/></h6>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <xsl:template match="title[@level]" mode="jesus">
    <!-- Always show canonical titles or if headings is turned on -->
    <xsl:if test="@canonical = 'true' or $Headings = 'true'">
      <xsl:choose>
        <xsl:when test="@level = '1'">
          <h1 class="level"><xsl:apply-templates/></h1>
        </xsl:when>
        <xsl:when test="@level = '2'">
          <h2 class="level"><xsl:apply-templates/></h2>
        </xsl:when>
        <xsl:when test="@level = '3'">
          <h3 class="level"><xsl:apply-templates/></h3>
        </xsl:when>
        <xsl:when test="@level = '4'">
          <h4 class="level"><xsl:apply-templates/></h4>
        </xsl:when>
        <xsl:when test="@level = '5'">
          <h5 class="level"><xsl:apply-templates/></h5>
        </xsl:when>
        <xsl:otherwise>
          <h6 class="level"><xsl:apply-templates/></h6>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <!--=======================================================================-->
  <xsl:template match="title">
    <!-- Always show canonical titles or if headings is turned on -->
    <xsl:if test="(@canonical = 'true' or $Headings = 'true') and @type != 'x-gen'">
      <h2 class="heading"><xsl:apply-templates/></h2>
    </xsl:if>
  </xsl:template>

  <xsl:template match="title" mode="jesus">
    <!-- Always show canonical titles or if headings is turned on -->
    <xsl:if test="(@canonical = 'true' or $Headings = 'true') and @type != 'x-gen'">
      <h2 class="heading"><xsl:apply-templates/></h2>
    </xsl:if>
  </xsl:template>

  <!--=======================================================================-->
  <xsl:template match="reference">
        <xsl:variable name="versification" select="jsword:getVersification($v11nf, $v11n)"/>
        <xsl:variable name="passage" select="jsword:getValidKey($keyf, $versification, @osisRef)"/>
        <xsl:variable name="passageKey" select="jsword:getName($passage)"/>
        <a href="javascript:void(0)" title="Click for more options" class="linkRef" xref="{$passageKey}" onclick="javascript:showOptions();"><xsl:apply-templates/></a>
  </xsl:template>
  
  <xsl:template match="reference" mode="jesus">
        <xsl:variable name="versification" select="jsword:getVersification($v11nf, $v11n)"/>
        <xsl:variable name="passage" select="jsword:getValidKey($keyf, $versification, @osisRef)"/>
        <xsl:variable name="passageKey" select="jsword:getName($passage)"/>
        <a href="javascript:void(0)" title="Click for more options" xref="{$passageKey}" onclick="javascript:showOptions();"><xsl:apply-templates/></a>
  </xsl:template>
  
  <!--=======================================================================-->
  <xsl:template match="caption">
    <div class="caption"><xsl:apply-templates/></div>
  </xsl:template>
  
  <xsl:template match="caption" mode="jesus">
    <div class="caption"><xsl:apply-templates/></div>
  </xsl:template>
  
  <xsl:template match="catchWord">
    <xsl:apply-templates/>
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
        <span class="bold">&#160;<xsl:apply-templates /></span>
    </xsl:template>

    <xsl:template match="doxology">
        <span class="italic">&#160;<xsl:apply-templates /></span>
    </xsl:template>

    <xsl:template match="colophon">
        <span class="italic">&#160;<xsl:apply-templates /></span>
    </xsl:template>

    <xsl:template match="refrain">
        <span class="italic">&#160;<xsl:apply-templates /></span>
    </xsl:template>

    <xsl:template match="attribution">
        <span class="italic">&#160;<xsl:apply-templates /></span>
    </xsl:template>

    <xsl:template match="divineName">
    <xsl:apply-templates mode="small-caps"/>
  </xsl:template>
  
  <xsl:template match="divineName" mode="jesus">
    <xsl:apply-templates mode="small-caps"/>
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
    <em class="foreign"><xsl:apply-templates/></em>
  </xsl:template>
  
  <xsl:template match="foreign" mode="jesus">
    <em class="foreign"><xsl:apply-templates mode="jesus"/></em>
  </xsl:template>
  
  <!-- This is a subheading. -->
  <xsl:template match="head//head">
    <h5 class="head"><xsl:apply-templates/></h5>
  </xsl:template>
  
  <!-- This is a top-level heading. -->
  <xsl:template match="head">
    <h4 class="head"><xsl:apply-templates/></h4>
  </xsl:template>
  
  <xsl:template match="index">
    <a name="index{@id}" class="index"/>
  </xsl:template>

  <xsl:template match="inscription">
    <xsl:apply-templates mode="small-caps"/>
  </xsl:template>

  <xsl:template match="inscription" mode="jesus">
    <xsl:apply-templates mode="small-caps"/>
  </xsl:template>

  <xsl:template match="item">
    <li class="item"><xsl:apply-templates/></li>
  </xsl:template>

  <xsl:template match="item" mode="jesus">
    <li class="item"><xsl:apply-templates mode="jesus"/></li>
  </xsl:template>
  
  <!--
      <item> and <label> are covered by <list> below and so do not appear here.
  -->

  <xsl:template match="lg">
    <div class="lg"><xsl:apply-templates/></div>
  </xsl:template>
  
  <xsl:template match="lg" mode="jesus">
    <div class="lg"><xsl:apply-templates mode="jesus"/></div>
  </xsl:template>
  
  <xsl:template match="lg[@sID or @eID]"/>
  <xsl:template match="lg[@sID or @eID]" mode="jesus"/>

  <xsl:template match="l[@sID]"/>
  <xsl:template match="l[@sID]" mode="jesus"/>

  <xsl:template match="l[@eID]"></xsl:template>
  <xsl:template match="l[@eID]" mode="jesus"></xsl:template>

  <xsl:template match="l">
    <xsl:apply-templates/><br/>
  </xsl:template>
  
  <xsl:template match="l" mode="jesus">
    <xsl:apply-templates mode="jesus"/><br/>
  </xsl:template>

  <!-- While a BR is a break, if it is immediately followed by punctuation,
       indenting this rule can introduce whitespace.
    -->
  <xsl:template match="lb"><br /></xsl:template>
  <xsl:template match="lb" mode="jesus">a<br/></xsl:template>

  <xsl:template match="list">
    <xsl:choose>
      <xsl:when test="label">
        <!-- If there are <label>s in the list, it's a <dl>. -->
        <dl class="list">
          <xsl:for-each select="node()">
            <xsl:choose>
              <xsl:when test="self::label">
                <dt class="label"><xsl:apply-templates/></dt>
              </xsl:when>
              <xsl:when test="self::item">
                <dd class="item"><xsl:apply-templates/></dd>
              </xsl:when>
              <xsl:when test="self::list">
                <dd class="list-wrapper"><xsl:apply-templates select="."/></dd>
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
                <li class="item"><xsl:apply-templates/></li>
              </xsl:when>
              <xsl:when test="self::list">
                <li class="list-wrapper"><xsl:apply-templates select="."/></li>
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
                <dt class="label"><xsl:apply-templates mode="jesus"/></dt>
              </xsl:when>
              <xsl:when test="self::item">
                <dd class="item"><xsl:apply-templates mode="jesus"/></dd>
              </xsl:when>
              <xsl:when test="self::list">
                <dd class="list-wrapper"><xsl:apply-templates select="." mode="jesus"/></dd>
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
                <li class="item"><xsl:apply-templates mode="jesus"/></li>
              </xsl:when>
              <xsl:when test="self::list">
                <li class="list-wrapper"><xsl:apply-templates select="." mode="jesus"/></li>
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
  <xsl:template match="milestone[@type = 'x-p']"> <!-- <xsl:text> </xsl:text><xsl:value-of select="@marker"/><xsl:text> </xsl:text> --></xsl:template>
  <xsl:template match="milestone[@type = 'x-p']" mode="jesus"><!-- <xsl:text> </xsl:text><xsl:value-of select="@marker"/><xsl:text> </xsl:text> --></xsl:template>

  <xsl:template match="milestone[@type = 'cQuote']" name="interlinearMilestone" >
        <xsl:call-template name="outputBlankColumnWithText">
            <xsl:with-param name="quoteText" select="@marker" />
        </xsl:call-template>
  </xsl:template>

  <xsl:template match="milestone[@type = 'cQuote']" mode="jesus">
    <xsl:call-template name="interlinearMilestone" />
  </xsl:template>

  <xsl:template match="milestone[@type = 'line']"><br/></xsl:template>

  <xsl:template match="milestone[@type = 'line']" mode="jesus"><br/></xsl:template>

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
  <xsl:template match="q[@sID or @eID]" name="interlinearQuote">
    <xsl:variable name="quoteText">
	    <xsl:choose>
	      <xsl:when test="@marker"><xsl:value-of select="@marker"/></xsl:when>
	      <!-- The chosen mark should be based on the work's author's locale. -->
	      <xsl:otherwise>"</xsl:otherwise>
	    </xsl:choose>
	</xsl:variable>
      <xsl:call-template name="outputBlankColumnWithText">
        <xsl:with-param name="quoteText" select="$quoteText" />
      </xsl:call-template>
  </xsl:template>


  <xsl:template match="q[@sID or @eID]" mode="jesus">
    <xsl:call-template name="interlinearQuote" />
  </xsl:template>

    <xsl:template name="outputBlankColumnWithText">
        <xsl:param name="quoteText" />
        <span class="w">
            <span>
                <xsl:value-of select="$quoteText" />
            </span>

            <!-- output a filling gap for strongs -->
            <xsl:if test="$OriginalTransliteration = 'true'">
                <span class="strongs  transliteration">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$GreekVocab = 'true'">
                <span class="ancientVocab">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$Transliteration = 'true'">
                <span class="strongs  transliteration">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$EnglishVocab = 'true'">
                <span class="strongs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$es_Vocab = 'true'">
                <span class="strongs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$zh_tw_Vocab = 'true'">
                <span class="strongs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$zh_Vocab = 'true'">
                <span class="strongs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>

            <!-- output a filling gap for morphs -->
            <xsl:if test="$Morph = 'true'">
                <span class="morphs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>

            <!--  fill up with spaces where we have extra versions shown -->
            <xsl:if test="normalize-space($interlinearVersion) != ''">
                <xsl:call-template name="blanksForVersions">
                    <xsl:with-param name="versions" select="$interlinearVersion" />
                </xsl:call-template>
            </xsl:if>
        </span>
    </xsl:template>

  <xsl:template match="q[@who = 'Jesus']">
    	<xsl:choose>
	  	<xsl:when test="$RedLetterText = 'true'">
	    	<font class="jesus"><xsl:value-of select="@marker"/><xsl:apply-templates mode="jesus"/><xsl:value-of select="@marker"/></font>
	    </xsl:when>
	    <xsl:otherwise>
	    		<xsl:value-of select="@marker"/>
	    		<xsl:apply-templates />
	    		<xsl:value-of select="@marker"/>
	    </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="q[@type = 'blockquote']">
	    		<xsl:value-of select="@marker"/>
	    		<xsl:apply-templates />
	    		<xsl:value-of select="@marker"/>
  </xsl:template>

  <xsl:template match="q[@type = 'blockquote']" mode="jesus">
	    		<xsl:value-of select="@marker"/>
	    		<xsl:apply-templates />
	    		<xsl:value-of select="@marker"/>
  </xsl:template>

  <xsl:template match="q[@type = 'citation']">
	    		<xsl:value-of select="@marker"/>
	    		<xsl:apply-templates />
	    		<xsl:value-of select="@marker"/>
  </xsl:template>

  <xsl:template match="q[@type = 'citation']" mode="jesus">
	    		<xsl:value-of select="@marker"/>
	    		<xsl:apply-templates />
	    		<xsl:value-of select="@marker"/>
  </xsl:template>

  <xsl:template match="q[@type = 'embedded']">
    <xsl:choose>
      <xsl:when test="@marker">
	    		<xsl:value-of select="@marker"/>
	    		<xsl:apply-templates />
	    		<xsl:value-of select="@marker"/>
      </xsl:when>
      <xsl:otherwise>
	    		<xsl:value-of select="@marker"/>
	    		<xsl:apply-templates />
	    		<xsl:value-of select="@marker"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="q[@type = 'embedded']" mode="jesus">
    <xsl:choose>
      <xsl:when test="@marker">
	    		<xsl:value-of select="@marker"/>
	    		<xsl:apply-templates />
	    		<xsl:value-of select="@marker"/>
      </xsl:when>
      <xsl:otherwise>
        <quote class="q"><xsl:apply-templates/></quote>
      </xsl:otherwise>
    </xsl:choose>
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
    <div class="speech"><xsl:apply-templates/></div>
  </xsl:template>
  
  <xsl:template match="speech" mode="jesus">
    <div class="speech"><xsl:apply-templates mode="jesus"/></div>
  </xsl:template>

  <xsl:template match="table">
    <table class="table">
      <xsl:copy-of select="@rows|@cols"/>
      <xsl:if test="head">
        <thead class="head"><xsl:apply-templates select="head"/></thead>
      </xsl:if>
      <tbody><xsl:apply-templates select="row"/></tbody>
    </table>
  </xsl:template>

  <xsl:template match="row">
    <tr class="row"><xsl:apply-templates/></tr>
  </xsl:template>
  
  <xsl:template match="cell">
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
    <xsl:variable name="cell-direction">
      <xsl:if test="@xml:lang">
        <xsl:call-template name="getDirection">
         <xsl:with-param name="lang"><xsl:value-of select="@xml:lang"/></xsl:with-param>
        </xsl:call-template>
      </xsl:if>
    </xsl:variable>
    <xsl:element name="{$element-name}">
      <xsl:attribute name="class">cell</xsl:attribute>
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
          <xsl:text>&#8235;</xsl:text><xsl:apply-templates/><xsl:text>&#8236;</xsl:text>
        </xsl:when>
        <xsl:when test="$cell-direction = 'ltr'">
          <xsl:text>&#8234;</xsl:text><xsl:apply-templates/><xsl:text>&#8236;</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

	<xsl:template match="transChange">
			<em>
				<xsl:apply-templates />
			</em>

	</xsl:template>


  <xsl:template match="transChange" mode="jesus">
    		<span class="w">
			<em>
				<xsl:apply-templates />
			</em>

			<!-- output a filling gap for strongs -->
                <xsl:if test="$OriginalTransliteration = 'true'">
                    <span class="strongs  transliteration">
                        <xsl:call-template name="outputNonBlank">
                            <xsl:with-param name="string" select="''" />
                        </xsl:call-template>
                    </span>
                </xsl:if>
                <xsl:if test="$GreekVocab = 'true'">
                    <span class="ancientVocab">
                        <xsl:call-template name="outputNonBlank">
                            <xsl:with-param name="string" select="''" />
                        </xsl:call-template>
                    </span>
                </xsl:if>
			<xsl:if test="$Transliteration = 'true'">
				<span class="strongs  transliteration">
					<xsl:call-template name="outputNonBlank">
						<xsl:with-param name="string" select="''" />
					</xsl:call-template>
				</span>
			</xsl:if>
            <xsl:if test="$EnglishVocab = 'true'">
                <span class="strongs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$es_Vocab = 'true'">
                <span class="strongs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$zh_tw_Vocab = 'true'">
                <span class="strongs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>
            <xsl:if test="$zh_Vocab = 'true'">
                <span class="strongs">
                    <xsl:call-template name="outputNonBlank">
                        <xsl:with-param name="string" select="''" />
                    </xsl:call-template>
                </span>
            </xsl:if>

			<!-- output a filling gap for morphs -->
			<xsl:if test="$Morph = 'true'">
				<span class="morphs">
					<xsl:call-template name="outputNonBlank">
						<xsl:with-param name="string" select="''" />
					</xsl:call-template>
				</span>
			</xsl:if>
		
			<!--  fill up with spaces where we have extra versions shown -->
			<xsl:if test="normalize-space($interlinearVersion) != ''">
				<xsl:call-template name="blanksForVersions">
					<xsl:with-param name="versions" select="$interlinearVersion" />
				</xsl:call-template>
			</xsl:if>
		</span>
  </xsl:template>
  
  
    <xsl:template name="blanksForVersions">
	  	<xsl:param name="versions" />  	
	
		<xsl:variable name="nextVersion" select="normalize-space(substring-before($versions, ','))" />
	
		<!--  if next version is not empty, then there was a comma, so we output this version and call template again -->
		<xsl:choose>
			<xsl:when test="normalize-space($nextVersion) != ''">
				<span class="interlinear">
					<xsl:call-template name="outputNonBlank">
						<xsl:with-param name="string">
							<xsl:value-of select="''" />
						</xsl:with-param>
					</xsl:call-template>
				</span>
				<xsl:call-template name="interlinear">
					<xsl:with-param name="versions" select="substring-after($versions, ',')" />
				</xsl:call-template>
			</xsl:when>
			<!-- otherwise, then we can use the remainder as the version, as long as version not empty (for e.g. a trailing comma) -->
			<xsl:otherwise>
			    <xsl:if test="normalize-space($versions) != ''" >
					<span class="interlinear">
						<xsl:call-template name="outputNonBlank">
							<xsl:with-param name="string">
								<xsl:value-of select="''" />
							</xsl:with-param>
						</xsl:call-template>
					</span>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
  

    <xsl:template name="outputVersionNames">
	  	<xsl:param name="versions" />  	
		<xsl:param name="printVersions" />
	
		<xsl:variable name="nextVersion" select="normalize-space(substring-before($versions, ','))" />

		<!--  if next version is not empty, then there was a comma, so we output this version and call template again -->
		<xsl:choose>
			<xsl:when test="normalize-space($nextVersion) != ''">
                <xsl:variable name="disabled" select="jsword:isDisabled($interlinearProvider, $nextVersion)" />
                <xsl:variable name="disabledStatus">
                    <xsl:choose>
                        <xsl:when test="$disabled = true()">true</xsl:when>
                        <xsl:otherwise>false</xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
				<span class="interlinear">
					<xsl:choose>
						<xsl:when test="$printVersions != 'no-print'">
							<a class='smallHeaders' href='javascript:void(0)' data-version='{$nextVersion}' data-version-disabled="{$disabledStatus}">
							<xsl:call-template name="outputNonBlank">
								<xsl:with-param name="string">
									<xsl:value-of select="$nextVersion" />
								</xsl:with-param>
							</xsl:call-template>
							</a>
						</xsl:when>
						<xsl:otherwise>&#160;</xsl:otherwise>
					</xsl:choose>					
				</span>
				<xsl:call-template name="outputVersionNames">
					<xsl:with-param name="versions" select="substring-after($versions, ',')" />
					<xsl:with-param name="printVersions" select="$printVersions" />
				</xsl:call-template>
			</xsl:when>
			<!-- otherwise, then we can use the remainder as the version, as long as version not empty (for e.g. a trailing comma) -->
			<xsl:otherwise>
                <xsl:variable name="disabled" select="jsword:isDisabled($interlinearProvider, $versions)" />
                <xsl:variable name="disabledStatus">
                    <xsl:choose>
                        <xsl:when test="$disabled = true()">true</xsl:when>
                        <xsl:otherwise>false</xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
			    <xsl:if test="normalize-space($versions) != ''" >
					<span class="interlinear">
						<xsl:choose>
							<xsl:when test="$printVersions != 'no-print'">
							<a class='smallHeaders' href="javascript:void(0)" data-version="{$versions}"  data-version-disabled="{$disabledStatus}">
								<xsl:call-template name="outputNonBlank">
									<xsl:with-param name="string">
										<xsl:value-of select="$versions" />
									</xsl:with-param>
								</xsl:call-template>
								</a>
							</xsl:when>
							<xsl:otherwise>&#160;</xsl:otherwise>
						</xsl:choose>
					</span>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
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
        <strong><xsl:apply-templates/></strong>
      </xsl:when>
      <xsl:when test="$style = 'emphasis'">
        <em><xsl:apply-templates/></em>
      </xsl:when>
      <xsl:when test="$style = 'illuminated'">
        <strong><em><xsl:apply-templates/></em></strong>
      </xsl:when>
      <xsl:when test="$style = 'italic'">
        <em><xsl:apply-templates/></em>
      </xsl:when>
      <xsl:when test="$style = 'line-through'">
        <font class="strike"><xsl:apply-templates/></font>
      </xsl:when>
      <xsl:when test="$style = 'normal'">
        <font class="normal"><xsl:apply-templates/></font>
      </xsl:when>
      <xsl:when test="$style = 'small-caps'">
        <font class="small-caps"><xsl:apply-templates/></font>
      </xsl:when>
      <xsl:when test="$style = 'sub'">
        <sub><xsl:apply-templates/></sub>
      </xsl:when>
      <xsl:when test="$style = 'super'">
        <sup><xsl:apply-templates/></sup>
      </xsl:when>
      <xsl:when test="$style = 'underline'">
        <u><xsl:apply-templates/></u>
      </xsl:when>
      <xsl:when test="$style = 'x-caps'">
        <font class="caps"><xsl:apply-templates/></font>
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
        <strong><xsl:apply-templates/></strong>
      </xsl:when>
      <xsl:when test="$style = 'emphasis'">
        <em><xsl:apply-templates/></em>
      </xsl:when>
      <xsl:when test="$style = 'illuminated'">
        <strong><em><xsl:apply-templates/></em></strong>
      </xsl:when>
      <xsl:when test="$style = 'italic'">
        <em><xsl:apply-templates/></em>
      </xsl:when>
      <xsl:when test="$style = 'line-through'">
        <font class="strike"><xsl:apply-templates/></font>
      </xsl:when>
      <xsl:when test="$style = 'normal'">
        <font class="normal"><xsl:apply-templates/></font>
      </xsl:when>
      <xsl:when test="$style = 'small-caps'">
        <font class="small-caps"><xsl:apply-templates/></font>
      </xsl:when>
      <xsl:when test="$style = 'sub'">
        <sub><xsl:apply-templates/></sub>
      </xsl:when>
      <xsl:when test="$style = 'super'">
        <sup><xsl:apply-templates/></sup>
      </xsl:when>
      <xsl:when test="$style = 'underline'">
        <u><xsl:apply-templates/></u>
      </xsl:when>
      <xsl:when test="$style = 'x-caps'">
        <font class="caps"><xsl:apply-templates/></font>
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
      <xsl:apply-templates/><br/><br/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="entry">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="entryFree">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="form">
    <xsl:apply-templates/><br/>
  </xsl:template>

  <xsl:template match="orth">
    <font class="orth"><xsl:apply-templates/></font>
  </xsl:template>

  <xsl:template match="pron">
    <font class="pron"><xsl:apply-templates/></font>
  </xsl:template>

  <xsl:template match="etym">
    <font class="etym"><xsl:apply-templates/></font>
  </xsl:template>

  <xsl:template match="def">
    <font class="def"><xsl:apply-templates/></font>
  </xsl:template>

  <xsl:template match="usg">
    <font class="usg"><xsl:apply-templates/></font>
  </xsl:template>

  <xsl:template match="@xml:lang">
    <xsl:variable name="dir">
      <xsl:if test="@xml:lang">
        <xsl:call-template name="getDirection">
         <xsl:with-param name="lang"><xsl:value-of select="@xml:lang"/></xsl:with-param>
        </xsl:call-template>
      </xsl:if>
    </xsl:variable>
    <xsl:if test="$dir">
      <xsl:attribute name="dir">
        <xsl:value-of select="$dir"/>
      </xsl:attribute>
    </xsl:if>
  </xsl:template>
    
  <!-- If the parent of the text is a verse then, we need to wrap in span. This applies
  to any punctuation really, since all other words should be contained in a W  -->
  <xsl:template match="text()" mode="jesus">
  	  <xsl:call-template name="matchSimpleText" />
  </xsl:template>
  
  <!-- Matching simple text when not matched elsewhere? -->
  <xsl:template match="text()" name="matchSimpleText">
  		<xsl:choose>
            <xsl:when test="name(..) = 'seg' and name(../..) = 'w'"><xsl:call-template name="outputPunctuatedText"><xsl:with-param name="text" select="." /></xsl:call-template></xsl:when>
			<xsl:when test="not(jsword:com.tyndalehouse.step.core.utils.StringUtils.containsAlphaNumeric(normalize-space(.)))" />
	  		<xsl:when test="normalize-space(.) != ''">
	  			<span class="w">
                    <xsl:variable name="lookAhead" select="normalize-space(../following-sibling::node()[1][self::text()])" />
                    <!-- we only output the next portion if it is punctuation -->
                    <xsl:variable name="nextPartOfText">
                        <xsl:choose>
                            <xsl:when
                                test="jsword:com.tyndalehouse.step.core.utils.StringUtils.containsAlphaNumeric($lookAhead)"></xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="$lookAhead" />
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <span class="text"><xsl:call-template name="outputPunctuatedText"><xsl:with-param name="text" select="." /></xsl:call-template><xsl:value-of select="$nextPartOfText"/></span>
	  				<!-- now we need to put the set of spans for strongs/morphs/interlinear versions -->

					<!-- output a filling gap for strongs -->
                    <xsl:if test="$OriginalTransliteration = 'true'">
                        <span class="text">&#160;</span>
                    </xsl:if>
                    <xsl:if test="$GreekVocab = 'true'">
                        <span class="text">&#160;</span>
                    </xsl:if>
					<xsl:if test="$Transliteration = 'true'">
						<span class="text">&#160;</span>
					</xsl:if>
                    <xsl:if test="$EnglishVocab = 'true'">
                        <span class="text">&#160;</span>
                    </xsl:if>
                    <xsl:if test="$es_Vocab = 'true'">
                        <span class="text">&#160;</span>
                    </xsl:if>
                    <xsl:if test="$zh_tw_Vocab = 'true'">
                        <span class="text">&#160;</span>
                    </xsl:if>
                    <xsl:if test="$zh_Vocab = 'true'">
                        <span class="text">&#160;</span>
                    </xsl:if>

					<!-- output a filling gap for morphs -->
					<xsl:if test="$Morph = 'true'">
						<span class="text">&#160;</span>
					</xsl:if>
				
					<!--  fill up with spaces where we have extra versions shown -->
					<xsl:if test="normalize-space($interlinearVersion) != ''">
						<xsl:call-template name="outputVersionNames">
							<xsl:with-param name="versions" select="$interlinearVersion" />
							<xsl:with-param name="printVersions" select="'no-print'" />
						</xsl:call-template>
					</xsl:if>
	  		 	</span>
	  		</xsl:when>
  		</xsl:choose>
  </xsl:template>


  <xsl:template name="outputPunctuatedText">
    <xsl:param name="text" />
    <xsl:choose>
        <xsl:when test="$RemoveVowels = 'true'"><xsl:value-of select="conversion:unAccent(string($text))" /></xsl:when>
        <xsl:when test="$RemovePointing = 'true'"><xsl:value-of select="conversion:unAccentLeavingVowels(string($text))" /></xsl:when>
        <xsl:otherwise><xsl:value-of select="." /></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="text()" mode="small-caps">
  <xsl:value-of select="translate(., 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
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
	<xsl:param name="text" />
	<xsl:param name="replace" />
	<xsl:param name="by" />
	<xsl:choose>
		<xsl:when test="contains($text, $replace)">
			<xsl:value-of select="substring-before($text,$replace)" />
			<xsl:value-of select="$by" />
			<xsl:call-template name="string-replace-all">
				<xsl:with-param name="text" select="substring-after($text,$replace)" />
				<xsl:with-param name="replace" select="$replace" />
				<xsl:with-param name="by" select="$by" />
			</xsl:call-template>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="$text" />
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>  
</xsl:stylesheet>
