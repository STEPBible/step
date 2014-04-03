<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
                xmlns:jsword="http://xml.apache.org/xalan/java"
                extension-element-prefixes="jsword">
    <xsl:param name="VNum" select="'false'"/>
    <xsl:param name="CVNum" select="'false'"/>
    <xsl:param name="BCVNum" select="'false'"/>
    <xsl:param name="TinyVNum" select="'false'"/>
    <xsl:param name="v11n" select="'KJV'"/>
    <xsl:variable name="v11nf" select="jsword:org.crosswire.jsword.versification.system.Versifications.instance()"/>
    <xsl:variable name="versification" select="jsword:getVersification($v11nf, $v11n)"/>
    <xsl:variable name="shaper" select="jsword:org.crosswire.common.icu.NumberShaper.new()"/>
    <xsl:variable name="keyf" select="jsword:org.crosswire.jsword.passage.PassageKeyFactory.instance()"/>


    <xsl:template match="/">
		<xsl:apply-templates select="//verse" />
	</xsl:template>

	
	<xsl:template match="//verse">
        <xsl:call-template name="versenum" />
        
		<xsl:if test="./preceding-sibling::title[not(starts-with(@type, 'x-'))]">
			<xsl:value-of select="./preceding-sibling::title[not(starts-with(@type, 'x-'))]" />
		</xsl:if>
	</xsl:template>

    <xsl:template name="versenum">
        <!-- we output version names not verse numbers for interleaved translations -->
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
                        <xsl:variable name="passage" select="jsword:getValidKey($keyf, $versification, @osisID)"/>
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
                <xsl:when test="$TinyVNum = 'true'">
                    <a name="{@osisID}"><span class="verseNumber"><xsl:value-of select="$versenum"/>&#160;</span></a>
                </xsl:when>
                <xsl:when test="$TinyVNum = 'false'">
                    <a name="{@osisID}">(<xsl:value-of select="$versenum"/>)</a>
                    <xsl:text> </xsl:text>
                </xsl:when>
                <xsl:otherwise>
                    <a name="{@osisID}"><span class="verseNumber"><xsl:value-of select="$versenum"/></span></a>
                    <xsl:text> </xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
