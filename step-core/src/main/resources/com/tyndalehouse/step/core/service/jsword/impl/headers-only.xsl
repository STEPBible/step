<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:template match="/">
		<xsl:apply-templates select="//verse" />
	</xsl:template>

	
	<xsl:template match="//verse">
		<xsl:if test="./preceding-sibling::title[not(starts-with(@type, 'x-'))]">
			<xsl:value-of select="./preceding-sibling::title[not(starts-with(@type, 'x-'))]" />
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>
