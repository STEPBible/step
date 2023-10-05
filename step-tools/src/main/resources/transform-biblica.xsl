<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"
                xmlns:s="xalan://com.tyndalehouse.step.tools.conversion.OsisConversionUtils"
                xmlns:c="http://www.w3.org/1999/XSL/Transform"
                extension-element-prefixes="s"
                xsi:schemaLocation="
                http://www.Biblica.com/namespace/version_1.0 Biblica.xsd
                http://www.bibletechnologies.net/2003/OSIS/namespace osisCore.2.1.1.xsd"
        >

    <!-- questions: Do we drop 'caller' -->
    <!-- 1John 5:8 is a verse within a note, but the verse never gets closed -->


    <xsl:output method="xml" indent="no"/>
    <xsl:template match="scripture">
        <osisText osisIDWork="NIV" osisRefWork="defaultReferenceScheme" xml:lang="en">
            <header>
                <work osisWork="NIV">
                    <title>New International Version</title>
                    <identifier type="OSIS">Bible.NIV</identifier>
                    <scope>Gen-Rev</scope>
                    <refSystem>Bible.KJV</refSystem>
                </work>
                <work osisWork="defaultReferenceScheme">
                    <refSystem>Bible.KJV</refSystem>
                </work>
            </header>
            <xsl:apply-templates/>
        </osisText>
    </xsl:template>


    <!-- Header stuff -->
    <xsl:template match="header"><!-- do nothing for now --></xsl:template>

    <xsl:template match="titlePage"><!-- do nothing for now --></xsl:template>

    <!-- These are exclusively from the proverbs -->
    <xsl:template match="title">
        <xsl:call-template name="parseTitles" />
    </xsl:template>
    
    <!-- Do nothings -->
    <xsl:template match="newTestament">
        <!-- do nothing for now -->
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="oldTestament">
        <!-- do nothing for now -->
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="titleGroup">
        <!--<xsl:apply-templates/>-->
    </xsl:template>


    <xsl:template match="book">
        <div osisID="{s:convertBookToOsis(@ID)}" type="book">
            <xsl:apply-templates/>
        </div>
    </xsl:template>


    <xsl:template match="section">
        <div type="section">
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="hebrewTitle" name="hebrewTitleTemplate">
        <!-- if we have a end of something, then it's most certainly from somewhere else and it's not the end of a section 
            e.g. the Psalms are really badly encoded, with ends of verses and the canonical title headings
        -->
        <xsl:if test=".//verseEnd and ../*[last()] != .">
            <xsl:apply-templates select=".//verseEnd" />
        </xsl:if>
        <xsl:if test=".//chapterEnd and ../*[last()] != .">
            <xsl:apply-templates select=".//chapterEnd" />
        </xsl:if>
        
        <xsl:choose>
            <!-- To cope for psalms and Hab 3.19 -->
            <xsl:when test="s:isCurrentChapterAlignedToPsalm() or ../*[last()] = .">
                <xsl:choose>
                    <xsl:when test="name(..) = 'psalm'"><title canonical="true" type="psalm"><xsl:apply-templates mode="stepSilent" /></title></xsl:when>
                    <xsl:otherwise><title canonical="true"><xsl:apply-templates mode="stepSilent" /></title></xsl:otherwise>
                </xsl:choose>
                <!-- if there are some ends in the mark-up, then output them here -->
                <xsl:apply-templates select=".//verseEnd" />
                <xsl:apply-templates select=".//chapterEnd" />
            </xsl:when>
            <xsl:otherwise>
                <!-- if we have a chapter start, then call it, same for verse start -->
                <xsl:apply-templates select=".//chapterStart" />
                <xsl:apply-templates select=".//verseStart" />
                
                    <xsl:choose>
                        <xsl:when test="name(..) = 'psalm'"><title step="pre-verse" canonical="true" type="psalm"><xsl:apply-templates mode="stepSilent" /></title></xsl:when>
                        <xsl:otherwise><title step="pre-verse" canonical="true"><xsl:apply-templates mode="stepSilent" /></title></xsl:otherwise>
                    </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>        
        <xsl:if test=".//verseStart"><xsl:apply-templates select=".//verseStart" /></xsl:if>
    </xsl:template>
    
    <xsl:template match="sectionHead" name="parseTitles">
        <xsl:choose>
            <xsl:when test="s:isInChapter()">
                <xsl:choose>
                    <xsl:when test="name(..) = 'minorSection'"><title type="sub"><xsl:apply-templates/></title></xsl:when>
                    <xsl:when test="name(..) = 'proverbsMajorSection'"><title type="x-proverbs"><xsl:apply-templates/></title></xsl:when>
                    <xsl:otherwise><title><xsl:apply-templates /></title></xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="name(..) = 'minorSection'"><title type="sub" step="pre-verse"><xsl:apply-templates/></title></xsl:when>
                    <xsl:when test="name(..) = 'proverbsMajorSection'"><title type="x-proverbs" step="pre-verse"><xsl:apply-templates/></title></xsl:when>
                    <xsl:otherwise><title step="pre-verse"><xsl:apply-templates /></title></xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="p|pIntroduction">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>

    <xsl:template match="psalm">
        <xsl:value-of select="s:markPsalmStart(number(@n))" />
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="chapterStart" mode="stepSilent">
        <!-- do nothing - this is a title being processed-->
    </xsl:template>
    
    <xsl:template match="chapterStart">
        <xsl:value-of select="s:markChapterStart(number(@n))" />
        <chapter osisID="{ s:convertChapterToOsis(@ID)}" sID="{@ID}"/>
        <!--<xsl:call-template name="outputChapterTitles" />-->
        <!--<xsl:call-template name="outputAcrosticTitles" />-->
        <xsl:apply-templates />
    </xsl:template>

    <xsl:template match="chapterEnd" mode="stepSilent">
        <!-- do nothing but mark the end of the chapter -->
    </xsl:template>
    
    <xsl:template match="chapterEnd">
        <xsl:value-of select="s:markChapterEnd()" />
        <chapter eID="{@from}"/>
    </xsl:template>


    <xsl:template match="verseStart" mode="stepSilent">
        <!--do nothing-->
    </xsl:template>
    <xsl:template match="verseStart">
        <xsl:choose>
            <xsl:when test="./ancestor::note"><seg type="verseNumber"><xsl:value-of select="@n" /></seg></xsl:when>
            <xsl:otherwise><verse osisID="{ s:convertVerseToOsis(@ID) }" sID="{@ID}"/></xsl:otherwise>
        </xsl:choose>
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="verseEnd">
            <!-- do nothing -->
    </xsl:template>
    
    <xsl:template match="verseEnd">
        <verse eID="{@from}"/>
        <xsl:apply-templates/>
    </xsl:template>

    
    <xsl:template match="note" mode="stepSilent">
        <xsl:call-template name="note" />
    </xsl:template>

    <xsl:template match="note" name="note">
        <note osisRef="{s:convertNoteScopeToOsis(@scope)}" type="{s:convertNoteType(@type)}">
            <xsl:apply-templates/>
        </note>
    </xsl:template>

    <xsl:template match="alternateReading">
        <q level="1">
            <xsl:apply-templates/>
        </q>
    </xsl:template>

    <xsl:template match="emphasis">
        <q level="1">
            <xsl:apply-templates/>
        </q>
    </xsl:template>

    <xsl:template match="stanza">
        <lg level="1">
            <xsl:apply-templates/>
        </lg>
    </xsl:template>

    <xsl:template match="line1|item1|itemContinued">
        <l level="1">
            <xsl:apply-templates/>
        </l>
    </xsl:template>

    <xsl:template match="line2|item2">
        <l level="2">
            <xsl:apply-templates/>
        </l>
    </xsl:template>

    <xsl:template match="line3">
        <l level="3">
            <xsl:apply-templates/>
        </l>
    </xsl:template>

    <xsl:template match="lineBreak">
        <lb />
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="seriesList|outlineList">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    

    <xsl:template match="nameOfGod">
        <divineName><xsl:apply-templates /></divineName>
    </xsl:template>
    
    <xsl:template match="wordsOfJesus">
        <q marker="" who="Jesus">
            <xsl:apply-templates />
        </q>
    </xsl:template>
    
    <xsl:template match="speaker">
        <xsl:choose>
            <xsl:when test="s:isInChapter()">
                <title type="x-speaker"><xsl:apply-templates /></title>
            </xsl:when>
            <xsl:otherwise>
                <title type="x-speaker" step="pre-verse"><xsl:apply-templates /></title>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="table">
        <xsl:apply-templates />
    </xsl:template>
    <xsl:template match="row">
        <xsl:apply-templates />
    </xsl:template>
    
    <xsl:template match="cellItem1">
        <xsl:apply-templates select=".//chapterStart" />
        <xsl:apply-templates select=".//verseStart" />
        <cell type="x-min-width">
            <xsl:apply-templates mode="stepSilent" />
        </cell>
        <xsl:apply-templates select=".//verseEnd" />
        <xsl:apply-templates select=".//chapterEnd" />
    </xsl:template>

    <xsl:template match="cellItem2">
        <xsl:apply-templates select=".//chapterStart" />
        <xsl:apply-templates select=".//verseStart" />
        <cell type="x-min-width x-indented">
            <xsl:apply-templates mode="stepSilent" />
        </cell>
        <xsl:apply-templates select=".//verseEnd" />
        <xsl:apply-templates select=".//chapterEnd" />
    </xsl:template>

    <xsl:template match="cellItem3">
        <xsl:apply-templates select=".//chapterStart" />
        <xsl:apply-templates select=".//verseStart" />
        <xsl:apply-templates mode="stepSilent" />
        <xsl:apply-templates select=".//verseEnd" />
        <xsl:apply-templates select=".//chapterEnd" />
        <lb type="x-continued" />
    </xsl:template>
    
    <xsl:template match="acrosticTitle">
        <xsl:variable name="title">
            <xsl:apply-templates />
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="s:isInRealChapter()">
                <xsl:call-template name="printAcrosticTitle">
                    <xsl:with-param name="letter" select="@letter" />
                    <xsl:with-param name="title" select="$title"/>
                    <xsl:with-param name="extra" select="''"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="printAcrosticTitle">
                    <xsl:with-param name="letter" select="@letter" />
                    <xsl:with-param name="title" select="$title"/>
                    <xsl:with-param name="extra" select="'pre-verse'"/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="printAcrosticTitle" >
        <xsl:param name="title" />
        <xsl:param name="letter" />
        <xsl:param name="extra" />
        <xsl:choose>
            <xsl:when test="$extra = ''"><title type="x-acrostic">&amp;&#35;<xsl:value-of select="$letter" />; <xsl:value-of select="$title" /></title></xsl:when>
            <xsl:otherwise><title type="x-acrostic" step="pre-verse">&amp;&#35;<xsl:value-of select="$letter" />; <xsl:value-of select="$title" /></title></xsl:otherwise>
        </xsl:choose>
        
    </xsl:template>
    
    <xsl:template match="inscription">
        <inscription><xsl:apply-templates /></inscription>
    </xsl:template>

    <xsl:template match="doxology">
        <l type="doxology"><xsl:apply-templates /></l>
    </xsl:template>
    
    <xsl:template match="pInscription">
        <inscription type="x-p-inscription"><xsl:apply-templates /></inscription>
    </xsl:template>

    <xsl:template match="foreign">
        <foreign><xsl:apply-templates /></foreign>
    </xsl:template>



</xsl:stylesheet>