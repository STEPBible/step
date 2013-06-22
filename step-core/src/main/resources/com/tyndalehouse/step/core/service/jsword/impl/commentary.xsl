<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0"
	xmlns:jsword="http://xml.apache.org/xalan/java"
    extension-element-prefixes="jsword">

  <!-- Create a global key factory from which OSIS ids will be generated -->
  <xsl:variable name="keyf" select="jsword:org.crosswire.jsword.passage.PassageKeyFactory.instance()"/>

  <!--  Support alternate versification -->
  <xsl:param name="v11n" select="'KJV'"/>
  <xsl:variable name="v11nf" select="jsword:org.crosswire.jsword.versification.system.Versifications.instance()"/>

  <!-- Create a global number shaper that can transform 0-9 into other number systems. -->
  <xsl:variable name="shaper" select="jsword:org.crosswire.common.icu.NumberShaper.new()"/>

	<!-- Version 3.0 is necessary to get br to work correctly. -->
<!-- 	<xsl:output method="html" version="3.0" -->
<!-- 		omit-xml-declaration="yes" indent="no" /> -->

	<xsl:template match="/">
		<div>
			<xsl:choose>
				<xsl:when test="count(//verse) != 0">
					<xsl:apply-templates select="//verse" />
				</xsl:when>
				<xsl:otherwise>
					<xsl:apply-templates select="//figure" />
				</xsl:otherwise>
			</xsl:choose>
		
		</div>
	</xsl:template>

	<!--======================================================================= -->
	<!-- == A proper OSIS document has osis as its root. == We dig deeper for 
		its content. -->
	<xsl:template match="verse">
		<span class="commentaryVerse"><xsl:call-template name="versenum"/><xsl:apply-templates/></span>
	</xsl:template>
	
	
	<xsl:template name="versenum">
      <!-- An osisID can be a space separated list of them -->
      <xsl:variable name="firstOsisID" select="substring-before(concat(@osisID, ' '), ' ')"/>
      <xsl:variable name="book" select="substring-before($firstOsisID, '.')"/>
      <xsl:variable name="chapter" select="jsword:shape($shaper, substring-before(substring-after($firstOsisID, '.'), '.'))"/>

      <!-- If n is present use it for the number -->
      <xsl:variable name="verse" select="jsword:shape($shaper, substring-after(substring-after($firstOsisID, '.'), '.'))" />

      <xsl:variable name="versenum">
		      <xsl:variable name="versification" select="jsword:getVersification($v11nf, $v11n)"/>
		      <xsl:variable name="passage" select="jsword:getValidKey($keyf, $versification, @osisID)"/>
              <xsl:value-of select="jsword:getName($passage)"/>
      </xsl:variable>

       <a name="{@osisID}"><span class="commentaryVerseNumber"><xsl:value-of select="$versenum"/></span></a>
  </xsl:template>

  <xsl:template match="reference">
        <xsl:variable name="versification" select="jsword:getVersification($v11nf, $v11n)"/>
        <xsl:variable name="passage" select="jsword:getValidKey($keyf, $versification, @osisRef)"/>
        <xsl:variable name="passageKey" select="jsword:getName($passage)"/>
        <a href="javascript:void(0)" title="Click for more options" class="linkRef" xref="{$passageKey}" onclick="javascript:showPreviewOptions();"><xsl:apply-templates/></a>
  </xsl:template>

  <xsl:template match="lb">
	<p />
  </xsl:template>

  <xsl:template match="div[@type='paragraph']">
	<p />
  </xsl:template>

  <xsl:template match="hi[@type = 'italic']">
	<span class="commentaryItalic">
		<xsl:apply-templates/>
	</span>
  </xsl:template>

  <xsl:template match="hi[@type = 'small-caps']">
	<span class="caps">
		<xsl:apply-templates/>
	</span>
  </xsl:template>


	<xsl:template match="figure">
		<img src="{@src}" alt="{@alt}" class='figureImage' />
	</xsl:template>

</xsl:stylesheet>
