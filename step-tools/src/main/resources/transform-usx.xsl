<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"
                xmlns:s="xalan://com.tyndalehouse.step.tools.conversion.OsisConversionUtils"
                xmlns:c="http://www.w3.org/1999/XSL/Transform"
                extension-element-prefixes="s"
        >
    <xsl:param name="versification" />
    <xsl:param name="identifier" />

    <!--xsi:schemaLocation="-->
    <!--http://www.Biblica.com/namespace/version_1.0 Biblica.xsd-->
    <!--http://www.bibletechnologies.net/2003/OSIS/namespace osisCore.2.1.1.xsd"-->

    <xsl:output method="xml" indent="no"/>
    <xsl:template match="usx">
        <osisText osisIDWork="NIV" osisRefWork="defaultReferenceScheme" xml:lang="en">
            <header>
                <work osisWork="NIV">
                    <title><xsl:value-of select="./div[type='book']" /></title>
                    <identifier type="OSIS">Bible.<xsl:value-of select="$identifier" /></identifier>
                    <refSystem>Bible.<xsl:value-of select="$versification" /></refSystem>
                    <!--<scope>Gen-Rev</scope>-->
                </work>
                <work osisWork="defaultReferenceScheme">
                    <refSystem>Bible.<xsl:value-of select="$versification" /></refSystem>
                </work>
            </header>
            <xsl:apply-templates/>
        </osisText>
    </xsl:template>


    <!-- Header stuff -->
    <!--<xsl:template match="header">&lt;!&ndash; do nothing for now &ndash;&gt;</xsl:template>-->

    <!--<xsl:template match="titlePage">&lt;!&ndash; do nothing for now &ndash;&gt;</xsl:template>-->

    <!--&lt;!&ndash; These are exclusively from the proverbs &ndash;&gt;-->
    <!--<xsl:template match="title">-->
        <!--<xsl:call-template name="parseTitles" />-->
    <!--</xsl:template>-->
    <!---->
    <!--&lt;!&ndash; Do nothings &ndash;&gt;-->
    <!--<xsl:template match="newTestament">-->
        <!--&lt;!&ndash; do nothing for now &ndash;&gt;-->
        <!--<xsl:apply-templates/>-->
    <!--</xsl:template>-->
    <!--<xsl:template match="oldTestament">-->
        <!--&lt;!&ndash; do nothing for now &ndash;&gt;-->
        <!--<xsl:apply-templates/>-->
    <!--</xsl:template>-->
    <!--<xsl:template match="titleGroup">-->
        <!--&lt;!&ndash;<xsl:apply-templates/>&ndash;&gt;-->
    <!--</xsl:template>-->


    <xsl:template match="book">
        <xsl:value-of select="s:markBookStart(@code)" />
        <div osisID="{s:convertBookToOsis(@code)}" type="book">
            <xsl:apply-templates/>
        </div>
    </xsl:template>


    <!--<xsl:template match="section">-->
        <!--<div type="section">-->
            <!--<xsl:apply-templates/>-->
        <!--</div>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="hebrewTitle" name="hebrewTitleTemplate">-->
        <!--&lt;!&ndash; if we have a end of something, then it's most certainly from somewhere else and it's not the end of a section -->
            <!--e.g. the Psalms are really badly encoded, with ends of verses and the canonical title headings-->
        <!--&ndash;&gt;-->
        <!--<xsl:if test=".//verseEnd and ../*[last()] != .">-->
            <!--<xsl:apply-templates select=".//verseEnd" />-->
        <!--</xsl:if>-->
        <!--<xsl:if test=".//chapterEnd and ../*[last()] != .">-->
            <!--<xsl:apply-templates select=".//chapterEnd" />-->
        <!--</xsl:if>-->
        <!---->
        <!--<xsl:choose>-->
            <!--&lt;!&ndash; To cope for psalms and Hab 3.19 &ndash;&gt;-->
            <!--<xsl:when test="s:isCurrentChapterAlignedToPsalm() or ../*[last()] = .">-->
                <!--<xsl:choose>-->
                    <!--<xsl:when test="name(..) = 'psalm'"><title canonical="true" type="psalm"><xsl:apply-templates mode="stepSilent" /></title></xsl:when>-->
                    <!--<xsl:otherwise><title canonical="true"><xsl:apply-templates mode="stepSilent" /></title></xsl:otherwise>-->
                <!--</xsl:choose>-->
                <!--&lt;!&ndash; if there are some ends in the mark-up, then output them here &ndash;&gt;-->
                <!--<xsl:apply-templates select=".//verseEnd" />-->
                <!--<xsl:apply-templates select=".//chapterEnd" />-->
            <!--</xsl:when>-->
            <!--<xsl:otherwise>-->
                <!--&lt;!&ndash; if we have a chapter start, then call it, same for verse start &ndash;&gt;-->
                <!--<xsl:apply-templates select=".//chapterStart" />-->
                <!--<xsl:apply-templates select=".//verseStart" />-->
                <!---->
                    <!--<xsl:choose>-->
                        <!--<xsl:when test="name(..) = 'psalm'"><title step="pre-verse" canonical="true" type="psalm"><xsl:apply-templates mode="stepSilent" /></title></xsl:when>-->
                        <!--<xsl:otherwise><title step="pre-verse" canonical="true"><xsl:apply-templates mode="stepSilent" /></title></xsl:otherwise>-->
                    <!--</xsl:choose>-->
            <!--</xsl:otherwise>-->
        <!--</xsl:choose>        -->
        <!--<xsl:if test=".//verseStart"><xsl:apply-templates select=".//verseStart" /></xsl:if>-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="sectionHead" name="parseTitles">-->
        <!--<xsl:choose>-->
            <!--<xsl:when test="s:isInChapter()">-->
                <!--<xsl:choose>-->
                    <!--<xsl:when test="name(..) = 'minorSection'"><title type="sub"><xsl:apply-templates/></title></xsl:when>-->
                    <!--<xsl:when test="name(..) = 'proverbsMajorSection'"><title type="x-proverbs"><xsl:apply-templates/></title></xsl:when>-->
                    <!--<xsl:otherwise><title><xsl:apply-templates /></title></xsl:otherwise>-->
                <!--</xsl:choose>-->
            <!--</xsl:when>-->
            <!--<xsl:otherwise>-->
                <!--<xsl:choose>-->
                    <!--<xsl:when test="name(..) = 'minorSection'"><title type="sub" step="pre-verse"><xsl:apply-templates/></title></xsl:when>-->
                    <!--<xsl:when test="name(..) = 'proverbsMajorSection'"><title type="x-proverbs" step="pre-verse"><xsl:apply-templates/></title></xsl:when>-->
                    <!--<xsl:otherwise><title step="pre-verse"><xsl:apply-templates /></title></xsl:otherwise>-->
                <!--</xsl:choose>-->
            <!--</xsl:otherwise>-->
        <!--</xsl:choose>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="p|pIntroduction">-->
        <!--<p>-->
            <!--<xsl:apply-templates/>-->
        <!--</p>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="psalm">-->
        <!--<xsl:value-of select="s:markPsalmStart(number(@n))" />-->
        <!--<xsl:apply-templates/>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="chapterStart" mode="stepSilent">-->
        <!-- do nothing - this is a title being processed-->
    <!--</xsl:template>-->
    <!---->
    <xsl:template match="chapter">
        <!-- If already in chapter, close the chapter off -->
        <xsl:choose>
            <xsl:when test="s:isInChapter()">
                <xsl:variable name="endChapterId" select="s:closeUSXChapter()" />
                <chapter eID="{$endChapterId}" />
            </xsl:when>
            <xsl:otherwise></xsl:otherwise>
        </xsl:choose>


        <xsl:variable name="chapterId" select="s:openUSXChapter(@number)" />
        <chapter osisID="{ $chapterId }" sID="{$chapterId}"/>
        <!--&lt;!&ndash;<xsl:call-template name="outputChapterTitles" />&ndash;&gt;-->
        <!--&lt;!&ndash;<xsl:call-template name="outputAcrosticTitles" />&ndash;&gt;-->
        <xsl:apply-templates />
    </xsl:template>

    <xsl:template match="para[@style='p']">
        <!-- close an opening verse if it's immediately followed by a verse marker -->
        <!-- Need extra condition here to cater for verses immediately going after -->
        <!--Similarly for empty nodes-->
        <!--<xsl:if test="s:isInVerse() and ( name(./child::node()[2]) = 'verse')">-->
            <!---->
        <!--</xsl:if>-->

        <p>
            <xsl:apply-templates />

            <!-- before we close the paragraph, if we find that the next element is a paragraph, and that its
            first child is a verse, then we want to close the verse early -->
            <xsl:if test="s:isInVerse() ">

                <xsl:if test="name(./following-sibling::node()[1]) = 'para'">
                    <xsl:if test="./following-sibling::node()[1]/child::node()[1] = 'verse' or (normalize-space(./following-sibling::node()[1]/child::node()[1]/text()) = ''  and name(./following-sibling::node()[1]/child::node()[1]) = 'para')">
                        <xsl:call-template name="closeUSXVerse" />
                    </xsl:if>
                </xsl:if>
                <xsl:if test="normalize-space(./following-sibling::node()[1]/text()) = ''  and name(./following-sibling::node()[2]) = 'para'">
                    <xsl:if test="./following-sibling::node()[2]/child::node()[1] = 'verse' or (normalize-space(./following-sibling::node()[2]/child::node()[1]/text()) = ''  and name(./following-sibling::node()[1]/child::node()[1]) = 'para')">
                        <xsl:call-template name="closeUSXVerse" />
                    </xsl:if>
                </xsl:if>
            </xsl:if>
                <!--a<xsl:value-of select="name(./following-sibling::node()[2]) = 'para'" />-->
                <!--b<xsl:value-of select="name(./child::node()[2]) = 'para'" />-->
                <!--c<xsl:value-of select="" />-->
                <!--d<xsl:value-of select="" />-->

            <!--</xsl:if>-->
        </p>
    </xsl:template>

    <xsl:template match="para[@style='ide']"><!-- All paragraphs do nothing --></xsl:template>
    <xsl:template match="para[@style='rem']"><!-- All paragraphs do nothing --></xsl:template>
    <xsl:template match="para[@style='toc1']"><!-- All paragraphs do nothing --></xsl:template>
    <xsl:template match="para[@style='toc2']"><!-- All paragraphs do nothing --></xsl:template>
    <xsl:template match="para[@style='toc3']"><!-- All paragraphs do nothing --></xsl:template>
    <xsl:template match="para[@style='h']"><!-- All paragraphs do nothing --></xsl:template>

    <xsl:template match="para[@style='mt1']">
        <title><xsl:apply-templates/></title>
    </xsl:template>


    <!-- notes and references -->
    <xsl:template match="note[@style='x']">
        <note type="crossReference" n="{@caller}"><xsl:apply-templates/></note>
    </xsl:template>


    <!--<xsl:template match="chapterEnd" mode="stepSilent">-->
        <!--&lt;!&ndash; do nothing but mark the end of the chapter &ndash;&gt;-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="chapterEnd">-->
        <!--<xsl:value-of select="s:markChapterEnd()" />-->
        <!--<chapter eID="{@from}"/>-->
    <!--</xsl:template>-->


    <!--<xsl:template match="verseStart" mode="stepSilent">-->
        <!--&lt;!&ndash;do nothing&ndash;&gt;-->
    <!--</xsl:template>-->

    <xsl:template name="closeUSXVerse">
        <xsl:variable name="previousVerseId" select="s:closeUSXVerse()" />
        <verse eID="{$previousVerseId}"/>
    </xsl:template>

    <xsl:template match="verse">
        <xsl:choose>
            <xsl:when test="s:isInVerse()">
                <xsl:call-template name="closeUSXVerse" />
            </xsl:when>
            <xsl:otherwise></xsl:otherwise>
        </xsl:choose>

        <!--<xsl:choose>-->
            <!--<xsl:when test="./ancestor::note"><seg type="verseNumber"><xsl:value-of select="@n" /></seg></xsl:when>-->
            <!--<xsl:otherwise>-->
                <xsl:variable name="verseId" select="s:openUSXVerse(@number)" />
                <verse osisID="{ $verseId }" sID="{$verseId}"/>
            <!--</xsl:otherwise>-->
        <!--</xsl:choose>-->
        <!--<xsl:apply-templates/>-->
    </xsl:template>

    <!--<xsl:template match="verseEnd">-->
            <!--&lt;!&ndash; do nothing &ndash;&gt;-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="verseEnd">-->
        <!--<verse eID="{@from}"/>-->
        <!--<xsl:apply-templates/>-->
    <!--</xsl:template>-->

    <!---->
    <!--<xsl:template match="note" mode="stepSilent">-->
        <!--<xsl:call-template name="note" />-->
    <!--</xsl:template>-->

    <!--<xsl:template match="note" name="note">-->
        <!--<note osisRef="{s:convertNoteScopeToOsis(@scope)}" type="{s:convertNoteType(@type)}">-->
            <!--<xsl:apply-templates/>-->
        <!--</note>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="alternateReading">-->
        <!--<q level="1">-->
            <!--<xsl:apply-templates/>-->
        <!--</q>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="emphasis">-->
        <!--<q level="1">-->
            <!--<xsl:apply-templates/>-->
        <!--</q>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="stanza">-->
        <!--<lg level="1">-->
            <!--<xsl:apply-templates/>-->
        <!--</lg>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="line1|item1|itemContinued">-->
        <!--<l level="1">-->
            <!--<xsl:apply-templates/>-->
        <!--</l>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="line2|item2">-->
        <!--<l level="2">-->
            <!--<xsl:apply-templates/>-->
        <!--</l>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="line3">-->
        <!--<l level="3">-->
            <!--<xsl:apply-templates/>-->
        <!--</l>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="lineBreak">-->
        <!--<lb />-->
        <!--<xsl:apply-templates/>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="seriesList|outlineList">-->
        <!--<p>-->
            <!--<xsl:apply-templates/>-->
        <!--</p>-->
    <!--</xsl:template>-->
    <!---->

    <!--<xsl:template match="nameOfGod">-->
        <!--<divineName><xsl:apply-templates /></divineName>-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="wordsOfJesus">-->
        <!--<q marker="" who="Jesus">-->
            <!--<xsl:apply-templates />-->
        <!--</q>-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="speaker">-->
        <!--<xsl:choose>-->
            <!--<xsl:when test="s:isInChapter()">-->
                <!--<title type="x-speaker"><xsl:apply-templates /></title>-->
            <!--</xsl:when>-->
            <!--<xsl:otherwise>-->
                <!--<title type="x-speaker" step="pre-verse"><xsl:apply-templates /></title>-->
            <!--</xsl:otherwise>-->
        <!--</xsl:choose>-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="table">-->
        <!--<xsl:apply-templates />-->
    <!--</xsl:template>-->
    <!--<xsl:template match="row">-->
        <!--<xsl:apply-templates />-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="cellItem1">-->
        <!--<xsl:apply-templates select=".//chapterStart" />-->
        <!--<xsl:apply-templates select=".//verseStart" />-->
        <!--<cell type="x-min-width">-->
            <!--<xsl:apply-templates mode="stepSilent" />-->
        <!--</cell>-->
        <!--<xsl:apply-templates select=".//verseEnd" />-->
        <!--<xsl:apply-templates select=".//chapterEnd" />-->
    <!--</xsl:template>-->

    <!--<xsl:template match="cellItem2">-->
        <!--<xsl:apply-templates select=".//chapterStart" />-->
        <!--<xsl:apply-templates select=".//verseStart" />-->
        <!--<cell type="x-min-width x-indented">-->
            <!--<xsl:apply-templates mode="stepSilent" />-->
        <!--</cell>-->
        <!--<xsl:apply-templates select=".//verseEnd" />-->
        <!--<xsl:apply-templates select=".//chapterEnd" />-->
    <!--</xsl:template>-->

    <!--<xsl:template match="cellItem3">-->
        <!--<xsl:apply-templates select=".//chapterStart" />-->
        <!--<xsl:apply-templates select=".//verseStart" />-->
        <!--<xsl:apply-templates mode="stepSilent" />-->
        <!--<xsl:apply-templates select=".//verseEnd" />-->
        <!--<xsl:apply-templates select=".//chapterEnd" />-->
        <!--<lb type="x-continued" />-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="acrosticTitle">-->
        <!--<xsl:variable name="title">-->
            <!--<xsl:apply-templates />-->
        <!--</xsl:variable>-->
        <!--<xsl:choose>-->
            <!--<xsl:when test="s:isInRealChapter()">-->
                <!--<xsl:call-template name="printAcrosticTitle">-->
                    <!--<xsl:with-param name="letter" select="@letter" />-->
                    <!--<xsl:with-param name="title" select="$title"/>-->
                    <!--<xsl:with-param name="extra" select="''"/>-->
                <!--</xsl:call-template>-->
            <!--</xsl:when>-->
            <!--<xsl:otherwise>-->
                <!--<xsl:call-template name="printAcrosticTitle">-->
                    <!--<xsl:with-param name="letter" select="@letter" />-->
                    <!--<xsl:with-param name="title" select="$title"/>-->
                    <!--<xsl:with-param name="extra" select="'pre-verse'"/>-->
                <!--</xsl:call-template>-->
            <!--</xsl:otherwise>-->
        <!--</xsl:choose>-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template name="printAcrosticTitle" >-->
        <!--<xsl:param name="title" />-->
        <!--<xsl:param name="letter" />-->
        <!--<xsl:param name="extra" />-->
        <!--<xsl:choose>-->
            <!--<xsl:when test="$extra = ''"><title type="x-acrostic">&amp;&#35;<xsl:value-of select="$letter" />; <xsl:value-of select="$title" /></title></xsl:when>-->
            <!--<xsl:otherwise><title type="x-acrostic" step="pre-verse">&amp;&#35;<xsl:value-of select="$letter" />; <xsl:value-of select="$title" /></title></xsl:otherwise>-->
        <!--</xsl:choose>-->
        <!---->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="inscription">-->
        <!--<inscription><xsl:apply-templates /></inscription>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="doxology">-->
        <!--<l type="doxology"><xsl:apply-templates /></l>-->
    <!--</xsl:template>-->
    <!---->
    <!--<xsl:template match="pInscription">-->
        <!--<inscription type="x-p-inscription"><xsl:apply-templates /></inscription>-->
    <!--</xsl:template>-->

    <!--<xsl:template match="foreign">-->
        <!--<foreign><xsl:apply-templates /></foreign>-->
    <!--</xsl:template>-->



</xsl:stylesheet>