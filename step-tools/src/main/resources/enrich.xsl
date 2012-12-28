<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0" xmlns:java="http://xml.apache.org/xalan/java"
	extension-element-prefixes="java">

	<xsl:param name="state" />
<!-- 	<xsl:output omit-xml-declaration="no" indent="no" /> -->
	<!-- <xsl:strip-space elements="*"/> -->


	<xsl:template match="node()|@*">
		<xsl:copy>
			<xsl:if test="name()='verse'">
				<xsl:value-of select="java:setCurrentVerse($state, @sID)" />
			</xsl:if>
			
			<xsl:apply-templates select="node()|@*" />
		</xsl:copy>
	</xsl:template>

	<xsl:template match="text()">
		<xsl:choose>
			<xsl:when 
				test="name(..) != 'reference' and name(..) !=  'note' and name(..) != 'title' and java:isVerse($state) and name(../..) != 'note' and name(../../..) != 'note' ">
<!-- 				hi<xsl:value-of select="." />bye -->
				<xsl:value-of select="java:match($state, .)" />			
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="." />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
	