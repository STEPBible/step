<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace" version="1.0">

    <!--<xsl:output method="xml" indent="yes"/>-->
    <xsl:template name="splitLemma">
        <xsl:param name="input" select="."/>
        <xsl:variable name="pText" select="translate($input, ' ', '/')" />

        <xsl:if test="string-length($pText)">
            <!--<xsl:if test=""-->
            <xsl:variable name="currentInput" select="substring-before(concat($pText,'/'),'/')" />
            <xsl:choose>
                <xsl:when test="string(number($currentInput)) != 'NaN'">
                    <xsl:value-of select="concat('strong:H', $currentInput)"/>
                </xsl:when>
                <xsl:otherwise>
                    <!--<xsl:value-of select="$currentInput"/>-->
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of select="' '"/>
            <xsl:call-template name="splitLemma">
                <xsl:with-param name="input" select="substring-after($pText, '/')"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template match="@lemma">
        <xsl:variable name="newLemma">
            <xsl:call-template name="splitLemma">
                <xsl:with-param name="input" select="."/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:attribute name="lemma">
            <xsl:value-of select="normalize-space($newLemma)"/>
        </xsl:attribute>
    </xsl:template>

    <xsl:template match="text()" name="split">
        <xsl:param name="pText" select="."/>
        <xsl:choose>
            <xsl:when test="name(..) = 'w'">
                <xsl:if test="string-length($pText)">
                    <seg>
                        <xsl:value-of select="substring-before(concat($pText,'/'),'/')"/>
                    </seg>
                    <xsl:call-template name="split">
                        <xsl:with-param name="pText" select="substring-after($pText, '/')"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="@*|*|processing-instruction()|comment()">
        <xsl:copy>
            <xsl:apply-templates select="@*|*|text()|processing-instruction()|comment()"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
