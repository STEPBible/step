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

    <!-- This file converts elements from USX spec located at: https://github.com/ubsicap/dblvalidation/blob/master/source/text/1.4/usx.rnc -->
    <!-- TODO: pass through TODOs in the rest of this file -->
    <!-- TODO: ensure that unmatched elements get warnings -->
    <!-- TODO: what is a para style="b" -->
    <!-- TODO: check that mt1 and s are correct styles for para -->
    <!-- TODO: x-major-section-{n} to be defined -->
    <!-- TODO: check what other types of 'char' there are -->
    <!-- TODO: Remove dead code -->
    <!-- TODO: Check reference parsing -->

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


    <!-- MAJOR SECTION IN USX DOC - BOOK -->
    <!-- Book can have ID attribute, code. Id isn't defined. -->
    <xsl:template match="book">
        <xsl:value-of select="s:markBookStart(@code)" />
        <div osisID="{s:convertBookToOsis(@code)}" type="book">
            <!-- always close a chapter (which will close a verse) before the end of a book -->
            <xsl:call-template name="closeChapter" />

        </div>
    </xsl:template>
    <!-- MAJOR SECTION IN USX DOC - END BOOK -->

    <!-- MAJOR SECTION IN USX DOC - HeaderPara-->
    <xsl:template match="para[@style='ide']"><!-- File encoding information --></xsl:template>
    <xsl:template match="para[@style='h']"><!-- Running text for a book --></xsl:template>
    <xsl:template match="para[@style='h1']"><!-- Running header text --></xsl:template>
    <xsl:template match="para[@style='h2']"><!-- Running header - left side --></xsl:template>
    <xsl:template match="para[@style='h3']"><!-- Running header - right side --></xsl:template>
    <xsl:template match="para[@style='toc1']"><!-- Long table of contents --></xsl:template>
    <xsl:template match="para[@style='toc2']"><!-- Short table of contents --></xsl:template>
    <xsl:template match="para[@style='toc3']"><!-- Book abbreviation --></xsl:template>
    <xsl:template match="para[@style='rem']"><!-- Remark --></xsl:template>
    <!-- MAJOR SECTION IN USX DOC - END HEADER PARA -->

    <!-- MAJOR SECTION IN USX DOC - TitlePara -->
    <!-- Various book titles, secondary and tertiary and small titles
    the imt, imt1, imt2 are introductory titles are ommitted as covered in IntroPara
    -->
    <xsl:template match="para[@style='mt' or @style='mt1' or @style='mt2' or @style='mt3' or @style='mt4']">
        <title><xsl:apply-templates/></title>
    </xsl:template>
    <!-- MAJOR SECTION IN USX DOC - END TitlePara -->

    <!-- MAJOR SECTION IN USX DOC - IntroPara -->
    <!-- Currently introductions are unsupported. This is for 2 reasons -
      - not supported in STEP,
      - would need to detect start and stop of intros
    -->
    <xsl:template match="para[@style='imt'
        or @style='imt1'
        or @style='imt2'
        or @style='imt2'
        or @style='imt3'
        or @style='imt4'
        ]">
    </xsl:template>
    <xsl:template match="para[@style='ib']">
    </xsl:template>
    <xsl:template match="para[@style='ie']">
    </xsl:template>
    <xsl:template match="para[@style='ili']">
    </xsl:template>
    <xsl:template match="para[@style='ili2']">
    </xsl:template>
    <xsl:template match="para[@style='im']">
    </xsl:template>
    <xsl:template match="para[@style='imi']">
    </xsl:template>
    <xsl:template match="para[@style='imq']">
    </xsl:template>
    <xsl:template match="para[@style='io']">
    </xsl:template>
    <xsl:template match="para[@style='io1']">
    </xsl:template>
    <xsl:template match="para[@style='io2']">
    </xsl:template>
    <xsl:template match="para[@style='io3']">
    </xsl:template>
    <xsl:template match="para[@style='io4']">
    </xsl:template>
    <xsl:template match="para[@style='ip']">
    </xsl:template>
    <xsl:template match="para[@style='ipi']">
    </xsl:template>
    <xsl:template match="para[@style='ipq']">
    </xsl:template>
    <xsl:template match="para[@style='ipr']">
    </xsl:template>
    <xsl:template match="para[@style='iq']">
    </xsl:template>
    <xsl:template match="para[@style='iq1']">
    </xsl:template>
    <xsl:template match="para[@style='iq2']">
    </xsl:template>
    <xsl:template match="para[@style='iq3']">
    </xsl:template>
    <xsl:template match="para[@style='is']">
    </xsl:template>
    <xsl:template match="para[@style='is1']">
    </xsl:template>
    <xsl:template match="para[@style='is2']">
    </xsl:template>
    <xsl:template match="para[@style='imte']">
    </xsl:template>
    <xsl:template match="para[@style='imte1']">
    </xsl:template>
    <xsl:template match="para[@style='imte2']">
    </xsl:template>
    <xsl:template match="para[@style='iex']">
    </xsl:template>

    <!-- MAJOR SECTION IN USX DOC - END IntroPara -->
    <!-- MAJOR SECTION IN USX DOC - paraStyle-->
    <xsl:template match="para[@style='m' or @style='mi' or @style='nb' or @style='p' or @style='p1' or @style='p2']">
        <!-- close an opening verse if it's immediately followed by a verse marker -->
        <!-- Need extra condition here to cater for verses immediately going after -->
        <!--Similarly for empty nodes-->
        <p>
            <!-- apply paragraph content -->
            <xsl:apply-templates />

            <!-- often the pattern is that we have <p><verse> text</p> <p><verse> text</p>
                 so if the next paragraph starts a verse, then we should close the verse now within the paragraph
                 so do we have an open verse?
                 -->
            <xsl:if test="s:isInVerse() ">
                <!-- is the next element a paragraph -->
                <xsl:if test="name(./following-sibling::node()[1]) = 'para'">
                    <!-- is the next element a verse -->
                    <xsl:if test="name(./following-sibling::node()[1]/child::node()[1]) = 'verse' or (normalize-space(./following-sibling::node()[1]/child::node()[1]/text()) = ''  and name(./following-sibling::node()[1]/child::node()[2]) = 'verse')">
                        <xsl:call-template name="closeUSXVerse" />
                    </xsl:if>
                </xsl:if>
                <xsl:if test="normalize-space(./following-sibling::node()[1]/text()) = ''  and name(./following-sibling::node()[2]) = 'para'">
                    <!-- is the next element a verse, or a space followed by a verse -->
                    <xsl:if test="name(./following-sibling::node()[2]/child::node()[1]) = 'verse' or (normalize-space(./following-sibling::node()[2]/child::node()[1]/text()) = '' and name(./following-sibling::node()[2]/child::node()[2]) = 'verse')">
                        <!-- let's close the verse -->
                        <xsl:call-template name="closeUSXVerse" />
                    </xsl:if>
                </xsl:if>
            </xsl:if>
        </p>
    </xsl:template>

    <xsl:template match="para[@style='restore']"><!-- comment about when text was restored --></xsl:template>

    <xsl:template match="para[@style='b']"><lg sID="" /><lg eID="" /><xsl:apply-templates /></xsl:template>
    <xsl:template match="para[@style='cls'
        or @style='iex'
        or @style='lit'
        or @style='pm'
        or @style='pmo'
        or @style='pmc'
        or @style='cp'
        or @style='cl'
        or @style='cd'
        or @style='mte'
        or @style='mte1'
        or @style='mte2'
        or @style='periph'
        or @style='k1'
        or @style='k2'
        ]">###NOT SUPPORTED###: attribute: <xsl:value-of select="@style" /></xsl:template>

    <xsl:template match="para[@style='pb']"><!-- a page break --><xsl:apply-templates /></xsl:template>
    <xsl:template match="para[@style='pc']"><inscription><xsl:apply-templates /></inscription></xsl:template>
    <xsl:template match="para[@style='pi']"><l><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='pi1']"><l level="1"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='pi2']"><l level="2"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='pi3']"><l level="3"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='pmr']"><l type="refrain"><xsl:apply-templates /></l></xsl:template>

    <xsl:template match="para[@style='q']"><l level="1"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='q1']"><l level="1"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='q2']"><l level="2"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='q3']"><l level="3"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='q4']"><l level="4"><xsl:apply-templates /></l></xsl:template>

    <xsl:template match="para[@style='qa']"><title type="acrostic"><xsl:apply-templates /></title></xsl:template>
    <xsl:template match="para[@style='qc']"><l type="x-centered"><xsl:apply-templates /></l></xsl:template>

    <xsl:template match="para[@style='qm' or @style='li']"><lg sID="" /><l level="1"><xsl:apply-templates /></l><lg eID="" /></xsl:template>
    <xsl:template match="para[@style='qm1' or @style='li1']"><lg sID="" /><l level="1"><xsl:apply-templates /></l><lg eID="" /></xsl:template>
    <xsl:template match="para[@style='qm2' or @style='li2']"><l level="2"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='qm3' or @style='li3']"><l level="3"><xsl:apply-templates /></l></xsl:template>
    <xsl:template match="para[@style='qm4' or @style='li4']"><l level="4"><xsl:apply-templates /></l></xsl:template>

    <xsl:template match="para[@style='qr']"><l type="x-aligned-right"><xsl:apply-templates /></l></xsl:template>
    <!-- assuming used for titles for formatting purposes -->
    <xsl:template match="para[@style='d']"><title canonical="true"><xsl:apply-templates /></title></xsl:template>

    <xsl:template match="para[@style='ms' or @style='s']"><title type="main"><xsl:apply-templates /></title></xsl:template>
    <xsl:template match="para[@style='ms1' or @style='s1']"><title><xsl:apply-templates /></title></xsl:template>
    <xsl:template match="para[@style='ms2' or @style='s2' or @style='mr']"><title type="sub"><xsl:apply-templates /></title></xsl:template>
    <xsl:template match="para[@style='ms3' or @style='s3']"><title type="x-major-section-2"><xsl:apply-templates /></title></xsl:template>
    <xsl:template match="para[@style='s4']"><title type="x-major-section-3"><xsl:apply-templates /></title></xsl:template>
    <xsl:template match="para[@style='r' or @style='sr']"><reference><xsl:apply-templates /></reference></xsl:template>
    <xsl:template match="para[@style='sp']"><speaker><xsl:apply-templates /></speaker></xsl:template>
    <xsl:template match="para[@style='s']"><title><xsl:apply-templates/></title></xsl:template>

    <!-- MAJOR SECTION IN USX DOC - END paraStyle -->

    <!-- MAJOR SECTION IN USX DOC - Table - because of nesting, for STEP, we ignore tables and rows -->
    <xsl:template match="table"><table type="x-simpleTable"><xsl:apply-templates /></table></xsl:template>
    <xsl:template match="row"><row type="x-simpleTable-row"><xsl:apply-templates /></row></xsl:template>
    <xsl:template match="cell[@style='th' or @style='th1']"><cell type="x-simpleTable-cell-left"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='tc' or @style='tc1']"><cell type="x-simpleTable-cell-left"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='thr' or @style='thr1']"><cell type="x-simpleTable-cell-right"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='tcr' or @style='tcr1']"><cell type="x-simpleTable-cell-right"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='thc']"><cell type="x-simpleTable-cell-center"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='tcc']"><cell type="x-simpleTable-cell-center"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='th2' or @style='th3' or @style='th4' or @style='th5']"><cell type="x-simpleTable-cell-left"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='tc2' or @style='tc3' or @style='tc4' or @style='tc5']"><cell type="x-simpleTable-cell-left"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='thr2' or @style='thr3' or @style='thr4' or @style='thr5']"><cell type="x-simpleTable-cell-right"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='tcr2' or @style='tcr3' or @style='tcr4' or @style='tcr5']"><cell type="x-simpleTable-cell-right"><xsl:apply-templates /></cell></xsl:template>
    <xsl:template match="cell[@style='rem']"><!-- some remarks and comments --></xsl:template>
    <!-- MAJOR SECTION IN USX DOC - END Table -->


    <!-- MAJOR SECTION IN USX DOC - char and IntroChar and FootNoteChar -->
    <xsl:template match="char">
        <xsl:choose>
            <xsl:when test="@style = 'va' or @style='vp' or @style='ca' or @style='addpn' or @style='efm' or @style='fm' or @style='ndx'
                or @style='pn' or @style='pro' or @style='w' or @style='wh' or @style='wg' or @style='ior' or style='iqt'">###NOT SUPPORTED### attribute: <xsl:value-of select="@style" /></xsl:when>
            <xsl:when test="@style = 'qac'"><hi type="acrostic"><xsl:apply-templates /></hi></xsl:when>
            <xsl:when test="@style = 'qs'"><foreign type="x-selah"><xsl:apply-templates /></foreign></xsl:when>
            <xsl:when test="@style = 'add'"><transChange type="added"><xsl:apply-templates /></transChange></xsl:when>
            <xsl:when test="@style = 'bk'"><reference type="x-bookName"><xsl:apply-templates /></reference></xsl:when>
            <xsl:when test="@style = 'dc'"><transChange type="added" edition="dc"><xsl:apply-templates /></transChange></xsl:when>
            <xsl:when test="@style = 'k'"><seg type="keyword"><xsl:apply-templates /></seg></xsl:when>
            <xsl:when test="@style = 'nd'"><divineName><xsl:value-of select="s:toTitleCase(./text())" /></divineName></xsl:when>
            <xsl:when test="@style = 'ord'"><hi type="super"><xsl:apply-templates /></hi></xsl:when>
            <xsl:when test="@style = 'qt'"><seg type="otPassage"><xsl:apply-templates /></seg></xsl:when>
            <xsl:when test="@style = 'rq'"><reference><xsl:apply-templates /></reference></xsl:when>
            <xsl:when test="@style = 'sig'"><signed><xsl:apply-templates /></signed></xsl:when>
            <xsl:when test="@style = 'sls'"><foreign type="x-secondaryLanguage"><xsl:apply-templates /></foreign></xsl:when>
            <xsl:when test="@style = 'tl'"><foreign><xsl:apply-templates /></foreign></xsl:when>
            <xsl:when test="@style = 'wj'"><q who="Jesus"><xsl:apply-templates /></q></xsl:when>
            <xsl:when test="@style = 'no'"><hi type="normal"><xsl:apply-templates /></hi></xsl:when>
            <xsl:when test="@style = 'it'"><hi type="italic"><xsl:apply-templates /></hi></xsl:when>
            <xsl:when test="@style = 'bd'"><hi type="bold"><xsl:apply-templates /></hi></xsl:when>
            <xsl:when test="@style = 'bdit'"><hi type="bold"><hi type="italic"><xsl:apply-templates /></hi></hi></xsl:when>
            <xsl:when test="@style = 'em'"><hi type="emphasis"><xsl:apply-templates /></hi></xsl:when>
            <xsl:when test="@style = 'sc'"><hi type="small-caps"><xsl:apply-templates /></hi></xsl:when>
            <xsl:when test="@style = 'fr'"><reference type="source"><xsl:apply-templates /></reference></xsl:when>
            <xsl:when test="@style = 'ft'"><xsl:apply-templates /></xsl:when>
            <xsl:when test="@style = 'fk'"><catchWord><xsl:apply-templates /></catchWord></xsl:when>
            <xsl:when test="@style = 'fq'"><q><xsl:apply-templates /></q></xsl:when>
            <xsl:when test="@style = 'fqa'"><rdg><xsl:apply-templates /></rdg></xsl:when>
            <xsl:when test="@style = 'fl'"><hi type="x-label"><xsl:apply-templates /></hi></xsl:when>
            <xsl:when test="@style = 'fp'"><p><xsl:apply-templates /></p></xsl:when>
            <xsl:when test="@style = 'fv'"><seg type="verseNumber"><xsl:apply-templates /></seg></xsl:when>
            <xsl:when test="@style = 'fdc'"><seg edition="dc"><xsl:apply-templates /></seg></xsl:when>
            <xsl:when test="@style = 'xt'"><xsl:apply-templates /></xsl:when>
            <xsl:when test="@style = 'xo'"><!-- the original verse which should be enclosing this anyway --></xsl:when>
            <xsl:when test="@style = 'xk'"><catchWord><xsl:apply-templates /></catchWord></xsl:when>
            <xsl:when test="@style = 'xq'"><q><xsl:apply-templates /></q></xsl:when>
            <xsl:when test="@style = 'xot'"><xsl:apply-templates /></xsl:when>
            <xsl:when test="@style = 'xnt'"><xsl:apply-templates /></xsl:when>
            <xsl:when test="@style = 'xdc'"><seg edition="dc"><xsl:apply-templates /></seg></xsl:when>
            <xsl:otherwise><hi><xsl:apply-templates /></hi></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <!-- MAJOR SECTION IN USX DOC - END char and IntroChar -->



    <!-- MAJOR SECTION IN USX DOC - Chapter -->
    <xsl:template name="closeChapter">
        <!-- If already in chapter, close the chapter off -->
        <xsl:choose>
            <xsl:when test="s:isInChapter()">
                <xsl:variable name="endChapterId" select="s:closeUSXChapter()" />
                <!-- close the verse seen as we're opening a new chapter -->
                <xsl:call-template name="closeUSXVerse" />
                <chapter eID="{$endChapterId}" />
            </xsl:when>
            <xsl:otherwise></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="chapter">
        <xsl:call-template name="closeChapter" />
        <xsl:variable name="chapterId" select="s:openUSXChapter(@number)" />
        <chapter osisID="{ $chapterId }" sID="{$chapterId}"/>
        <!--&lt;!&ndash;<xsl:call-template name="outputChapterTitles" />&ndash;&gt;-->
        <!--&lt;!&ndash;<xsl:call-template name="outputAcrosticTitles" />&ndash;&gt;-->
        <xsl:apply-templates />
    </xsl:template>
    <!-- MAJOR SECTION IN USX DOC - END Chapter -->

    <!-- MAJOR SECTION IN USX DOC - ref/sidebar -->
    <xsl:template match="ref|sidebar">###NOT SUPPORTED###: attribute: <xsl:value-of select="name()" /></xsl:template>
    <!-- MAJOR SECTION IN USX DOC - END ref/sidebar -->

    <!-- MAJOR SECTION IN USX DOC - Figure -->
    <xsl:template match="figure">
        <figure location="{@loc}" rights="{@copy}" alt="{@desc}" size="{@size}" src="{@file}"><caption><xsl:apply-templates /></caption></figure>
    </xsl:template>
    <!-- MAJOR SECTION IN USX DOC - END FIgure -->

    <xsl:template match="optbreak"><!-- Optional line breaks - not sure if we should put them in... --></xsl:template>

    <!-- notes and references -->
    <xsl:template match="note[@style='x' or @style='ex']">
        <note type="crossReference" n="{@caller}"><xsl:apply-templates/></note>
    </xsl:template>
    <xsl:template match="note[@style='f']">
        <note type="explanation" n="{@caller}"><xsl:apply-templates/></note>
    </xsl:template>
    <!-- MAJOR SECTION IN USX DOC - CrossReference -->



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
        <xsl:variable name="verseId" select="s:openUSXVerse(@number)" />
        <xsl:variable name="verseOsisId" select="translate($verseId, '_', ' ')" />
        <verse osisID="{ $verseOsisId }" sID="{$verseId}"/>
    </xsl:template>

    <!-- catch all -->
    <xsl:template match="*">
        ###NOT SUPPORTED### Node name: <xsl:value-of select="name()" /> style: <xsl:value-of select="@style" />
        <xsl:apply-templates />
    </xsl:template>
</xsl:stylesheet>