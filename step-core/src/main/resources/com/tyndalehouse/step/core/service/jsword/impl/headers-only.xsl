<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<!-- Version 3.0 is necessary to get br to work correctly. -->
<!-- 	<xsl:output method="html" version="3.0" -->
<!-- 		omit-xml-declaration="yes" indent="no" /> -->

	<xsl:template match="/">
		<xsl:apply-templates select="//verse//title[@type='section']" />
	</xsl:template>

	<!--======================================================================= -->
	<!-- == A proper OSIS document has osis as its root. == We dig deeper for 
		its content. -->
	<xsl:template match="//verse/title[@type='section']">
			<xsl:value-of select="." />
	</xsl:template>
	
<!-- 	<xsl:template match="*" /> -->

</xsl:stylesheet>
