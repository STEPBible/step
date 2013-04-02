<%@page import="com.google.inject.Injector"%>
<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle" />

<!-- <input type="text" class='searchQuerySyntax quickSearch' /> -->
<ul class="paneMenuBar">
	<li menu-name="DISPLAY"><a href="javascript:void(0)" menu-name="DISPLAY"><fmt:message key="display" /></a>
	<ul>
		<li><a href="javascript:void(0)" name="HEADINGS" ><fmt:message key="display_headings" /></a></li>
		<li><a href="javascript:void(0)" name="VERSE_NUMBERS"><fmt:message key="display_verseNumbers" /></a></li>
		<li><a href="javascript:void(0)" name="VERSE_NEW_LINE"><fmt:message key="display_separateLines" /></a>
		<li><a href="javascript:void(0)" name="RED_LETTER"><fmt:message key="display_redLetter" /></a></li>
		<li><a href="javascript:void(0)" name="NOTES"><fmt:message key="display_notes" /></a></li>
		<li><a href="javascript:void(0)" name="ENGLISH_VOCAB"><fmt:message key="display_englishVocab" /></a></li>
		<li><a href="javascript:void(0)" name="GREEK_VOCAB"><fmt:message key="display_greekVocab" /></a></li>
<%-- 		<li><a href="javascript:void(0)" name="TRANSLITERATION"><fmt:message key="display_transliteration" /></a></li> --%>
		<li><a href="javascript:void(0)" name="MORPHOLOGY"><fmt:message key="display_grammar" /></a></li>
		<li><a href="javascript:void(0)" name="COLOUR_CODE" ><fmt:message key="display_grammarColor" /></a></li>
	</ul>
	</li>
<!-- 	<li  menu-name="CONTEXT"><a href="javascript:void(0)">Context</a> -->
<!-- 	<ul> -->
<%-- 		<li><a href="javascript:void(0)" name="TIMELINE"><fmt:message key="context_timeline" /></a></li> --%>
<!-- 		<li><a href="javascript:void(0)" name="GEOGRAPHY"><fmt:message key="context_geography" /></a></li> -->
<!-- 		<li><a href="javascript:void(0)" name="GENEALOGY"><fmt:message key="context_genealogy" /></a></li> -->
<!-- 	</ul> -->
<!-- 	</li> -->
	<li  menu-name="SEARCH"><a href="javascript:void(0)"><fmt:message key="search" /></a>
	<ul>
		<li><a href="javascript:void(0)" name="SEARCH_PASSAGE"><fmt:message key="search_passage_lookup" /></a></li>
		<li class="menuSectionStart"><a href="javascript:void(0)" name="SEARCH_SIMPLE_TEXT"><fmt:message key="search_text" /></a></li>
		<li><a href="javascript:void(0)" name="SEARCH_SUBJECT"><fmt:message key="search_subject" /></a></li>
		<li><a href="javascript:void(0)" name="SEARCH_ORIGINAL"><fmt:message key="search_word" /></a></li>
<!-- 		<li><a href="javascript:void(0)" name="SEARCH_LEXICON_DEFINITION">Lexicon definition search</a></li> -->
<!-- 		<li><a href="javascript:void(0)" name="SEARCH_TIMELINE">Timeline search</a></li> -->
		<li class="menuSectionStart"><a href="javascript:void(0)" name="SEARCH_TEXT"><fmt:message key="search_advanced_text" /></a></li>
<%-- 		<li class="menuSectionStart"><a href="javascript:void(0)" name="SEARCH_PERSONAL_NOTES"><fmt:message key="personal_notes" /></a></li> --%>
	</ul>
	</li>
	<li menu-name="PASSAGE-TOOLS"><a href="javascript:void(0)"><fmt:message key="tools" /></a>
	<ul>
		<li><a href="javascript:void(0)" name="BOOKMARK" class="bookmarkPassageMenuItem"><fmt:message key="passage_tools_bookmark" /></a></li>
	</ul>
	</li>
</ul>
<br style="clear: left" />