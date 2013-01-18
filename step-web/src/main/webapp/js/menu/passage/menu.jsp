<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<% if(request.getParameter("lang") != null) { %>
		<fmt:setLocale value='<%= request.getParameter("lang") %>' />
<% } else { %> 
		<fmt:setLocale value="en" />
<% } %>
<fmt:setBundle basename="HtmlBundle" />

<!-- <input type="text" class='searchQuerySyntax quickSearch' /> -->
<ul class="paneMenuBar">
	<li menu-name="DISPLAY"><a href="#" menu-name="DISPLAY"><fmt:message key="display" /></a>
	<ul>
		<li><a href="#" name="HEADINGS" ><fmt:message key="display_headings" /></a></li>
		<li><a href="#" name="VERSE_NUMBERS"><fmt:message key="display_verseNumbers" /></a></li>
		<li><a href="#" name="VERSE_NEW_LINE"><fmt:message key="display_separateLines" /></a>
		<li><a href="#" name="RED_LETTER"><fmt:message key="display_redLetter" /></a></li>
		<li><a href="#" name="NOTES"><fmt:message key="display_notes" /></a></li>
		<li><a href="#" name="ENGLISH_VOCAB"><fmt:message key="display_englishVocab" /></a></li>
		<li><a href="#" name="GREEK_VOCAB"><fmt:message key="display_greekVocab" /></a></li>
		<li><a href="#" name="TRANSLITERATION"><fmt:message key="display_transliteration" /></a></li>
		<li><a href="#" name="MORPHOLOGY"><fmt:message key="display_grammar" /></a></li>
		<li><a href="#" name="COLOUR_CODE" ><fmt:message key="display_grammarColor" /></a></li>
	</ul>
	</li>
<!-- 	<li  menu-name="CONTEXT"><a href="#">Context</a> -->
<!-- 	<ul> -->
<!-- 		<li><a href="#" name="TIMELINE"><fmt:message key="context_timeline" /></a></li> -->
<!-- 		<li><a href="#" name="GEOGRAPHY"><fmt:message key="context_geography" /></a></li> -->
<!-- 		<li><a href="#" name="GENEALOGY"><fmt:message key="context_genealogy" /></a></li> -->
<!-- 	</ul> -->
<!-- 	</li> -->
	<li  menu-name="SEARCH"><a href="#"><fmt:message key="search" /></a>
	<ul>
		<li><a href="#" name="SEARCH_PASSAGE"><fmt:message key="search_passage_lookup" /></a></li>
		<li class="menuSectionStart"><a href="#" name="SEARCH_SIMPLE_TEXT"><fmt:message key="search_text" /></a></li>
		<li><a href="#" name="SEARCH_SUBJECT"><fmt:message key="search_subject" /></a></li>
		<li><a href="#" name="SEARCH_ORIGINAL"><fmt:message key="search_word" /></a></li>
<!-- 		<li><a href="#" name="SEARCH_LEXICON_DEFINITION">Lexicon definition search</a></li> -->
<!-- 		<li><a href="#" name="SEARCH_TIMELINE">Timeline search</a></li> -->
		<li class="menuSectionStart"><a href="#" name="SEARCH_TEXT"><fmt:message key="search_advanced_text" /></a></li>
	</ul>
	</li>
	<li menu-name="PASSAGE-TOOLS"><a href="#"><fmt:message key="tools" /></a>
	<ul>
		<li><a href="#" name="BOOKMARK" class="bookmarkPassageMenuItem"><fmt:message key="passage_tools_bookmark" /></a></li>
	</ul>
	</li>
</ul>
<br style="clear: left" />