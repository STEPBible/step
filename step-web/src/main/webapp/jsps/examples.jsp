<%@page import="com.tyndalehouse.step.core.models.ClientSession" trimDirectiveWhitespaces="true" %>
<%@page import="java.util.Locale" %>
<%@page import="javax.servlet.jsp.jstl.core.Config" %>
<%@page import="java.net.URLEncoder" %>
<%@ taglib prefix="search" tagdir="/WEB-INF/tags/search" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page import="com.google.inject.Injector" %>
<%@ page import="com.tyndalehouse.step.core.service.AppManagerService" %>
<%@ page import="java.util.Calendar" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
    AppManagerService appManager = injector.getInstance(AppManagerService.class);
%>

<fmt:setBundle basename="HtmlBundle" scope="request"/>
<div class="passageContainer examplesContainer">
    <a class="closeColumn" title="<fmt:message key="close" />">
        <i class="glyphicon glyphicon-remove"></i>
    </a>

    <h3><fmt:message key="simple_intro_welcome"/></h3>
    <h4><fmt:message key="simple_intro_tyndale_house_project"/></h4>

    <p><fmt:message key="simple_intro"/></p>

    <fmt:bundle basename="InteractiveBundle">
        <fmt:message key="the_pentateuch" var="pentateuch"/>
    </fmt:bundle>
    <div class="accordion-row" data-row="0">
        <h5 class="accordion-heading">
            Examples to use the search box to find Bibles, passages, search terms, etc.
            <span class="plusminus">+</span>
        </h5>
        <div class="accordion-body">
            <br>
            <search:sample_search explanation="simple_passage_explanation" option1="ESV" option1type="version"
                                  option2="Gen 1" option2type="reference"
                                  sampleURL="/?q=version=ESV|reference=Gen.1&options=VHNUG"/>
            <search:sample_search explanation="multiple_versions_explanation" option1="NIV" option1type="version"
                                  option2="ESV" option2type="version" option3="KJV" option3type="version"
                                  option4="Gen 1" option4type="reference"
                                  sampleURL="/?q=version=NIV|version=ESV|version=KJV|reference=Gen.1&options=HVGUN&display=COLUMN"/>
            <search:sample_search explanation="simple_search_explanation" option1="ESV" option1type="version"
                                  option2="brother" option2type="greekMeanings"
                                  sampleURL="/?q=version=ESV|strong=G0080&options=HVNGU"/>
            <%--<search:sample_search explanation="simple_search_restricted_explanation" option1="${ pentateuch }" option1type="reference" option2="ESV" option2type="version" option3="he.sed" option3type="hebrew" sampleURL="" />--%>
            <search:sample_search explanation="chained_searches_explanation" option1="NIV" option1type="version"
                                  option2="ESV" option2type="version" option3="land" option3type="text"
                                  option4="he.sed" option4type="hebrewMeanings"
                                  sampleURL="/?q=version=NIV|version=ESV|text=land|strong=H2617a&options=VGUVNH&display=INTERLEAVED"/>
            <search:sample_search explanation="chained_searches_explanation_subject" option1="ESV"
                                  option1type="version" option2="throne" option2type="meanings" option3="David"
                                  option3type="subject" option4="Isa-Rev" option4type="reference"
                                  sampleURL="/?q=version=ESV|meanings=throne|subject=david|reference=Isa-Rev&options=HNVUG"/>
            <search:sample_search explanation="interlinear_versions_explanation" option1="KJV" option1type="version"
                                  option2="THGNT" option2type="version" option3="John 1" option3type="reference"
                                  sampleURL="/?q=version=KJV|version=THGNT|reference=John.1&options=HVLUNM&display=INTERLINEAR"
                                  showInterlinear="true"/>
        </div>
    </div>
    <div class="accordion-row" data-row="1">
        <h5 class="accordion-heading">Examples to use the search box to find Bibles, passages, search terms, etc.
            <span class="plusminus">+</span>
        </h5>
        <div class="accordion-body">
            <br>
            <search:sample_search explanation="kjv_verb_imperative_explanation" option1="KJV"
                                  option1type="version"
                                  option2="Col 3" option2type="reference"
                                  option3="<span class='glyphicon glyphicon-plus'></span><span> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>"
                                  option3type="other"
                                  sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=KJV|reference=Col.3&options=HVGUNC', 'verb, imperative mood', ' Words with a red underlines are verbs in imperative mood.')"/>
            <search:sample_search explanation="kjv_verb_main_supporting_explanation" option1="KJV"
                                  option1type="version" option2="Col 1" option2type="reference"
                                  option3="<span class='glyphicon glyphicon-plus'></span><span> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>"
                                  option3type="other"
                                  sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=KJV|reference=Col.1&options=HVGUNC', 'verb, main vs supporting verbs', 'Words with a green underlines are usually main verbs in either indicative or imperative moods.  Words with a purple underline are support verbs in either subjunctive, optative, infinitive or particple moods.  Move your mouse over the word to see the verb grammar at the bottom of the screen.')"/>
            <search:sample_search explanation="kjv_verb_number_and_gender_explanation" option1="KJV"
                                  option1type="version" option2="Mat 1" option2type="reference"
                                  option3="<span class='glyphicon glyphicon-plus'></span><span> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>"
                                  option3type="other"
                                  sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=KJV|reference=Mat.1&options=HVGUNC', 'gender and number', 'Word with blue color font are masculine, red are feminine and black are neuter.  Words with bold font are plural.  Mouse over a word to see the grammar of the word.')"/>
            <search:sample_search explanation="esv_word_frequency_explanation" option1="ESV"
                                  option1type="version"
                                  option2="1Jo 1" option2type="reference"
                                  option3="<span class='glyphicon glyphicon-plus'></span><span> Quick tryout links<span>&nbsp;<span class='glyphicon glyphicon-plus'>   </span></span><span class='glyphicon glyphicon-stats'></span></span>"
                                  option3type="other"
                                  sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=ESV|reference=1Jo.1&options=HVGUN', 'function:openStats', 'Mouse over the words on the analysis tool (on the right panel) to see where the words are located.  Select book next to Bible text field in the right panel to see the word frequency for the entire book.')"/>
        </div>
    </div>
    <div class="accordion-row" data-row="2">
        <h5 class="accordion-heading">Examples to use the search box to find Bibles, passages, search terms,
            etc.
            <span class="plusminus">+</span>
        </h5>
        <div class="accordion-body">
            <br>
            <search:sample_search explanation="kjv_verb_color_explanation" option1="KJV"
                                  option1type="version"
                                  option2="Eph 1" option2type="reference"
                                  option3="<span class='glyphicon glyphicon-plus'></span><span> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>"
                                  option3type="other"
                                  sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=KJV|reference=Eph.1&options=HVGUNC', 'verb, gender and number', 'Look at the color table on the lower right of the screen to see the definition of the different underlines.')"/>
            <search:sample_search explanation="sblg_verb_color_explanation" option1="SBLG"
                                  option1type="version"
                                  option2="Rom 12" option2type="reference"
                                  option3="<span class='glyphicon glyphicon-plus'></span><span> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>"
                                  option3type="other"
                                  sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=SBLG|reference=Rom.12&options=CEMVALHUN', 'verb, gender and number', 'Look at the color table on the lower right of the screen to see the definition of the different underlines.')"/>
            <search:sample_search explanation="cun_verb_color_explanation" option1="CUn"
                                  option1type="version"
                                  option2="Col 1" option2type="reference"
                                  option3="<span class='glyphicon glyphicon-plus'></span><span> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>"
                                  option3type="other"
                                  sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=CUn|reference=Col.1&options=HVGUNC', 'verb, gender and number', 'Look at the color table on the lower right of the screen to see the definition of the different underlines.')"/>
            <search:sample_search explanation="interlinear_verb_color_explanation" option1="SBLG"
                                  option1type="version" option2="KJV" option2type="version" option3="CUN"
                                  option3type="version" option4="Eph 5" option4type="reference"
                                  option5="<span class='glyphicon glyphicon-plus'></span><span> Color code grammar <span class='glyphicon glyphicon-ok'></span></span>"
                                  option5type="other"
                                  sampleURL="javascript:setupNextPageAndGotoUrl('/?q=version=SBLG|version=KJV|version=CUn|reference=Eph.5&options=CVLHUVNEAM&display=INTERLEAVED', 'verb, gender and number', 'Look at the color table on the lower right of the screen to see the definition of the different underlines.')"/>
            <div id='colorCodeTableDiv'></div>
        </div>
    </div>
    <div class="text-muted step-copyright">
                <span>&copy; <a href="http://www.tyndale.cam.ac.uk"
                                target="_blank">Tyndale House, Cambridge, UK</a> - <%= Calendar.getInstance().get(Calendar.YEAR) %></span>
    </div>
</div>
