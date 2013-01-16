<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<% if(request.getParameter("lang") != null) { %>
		<fmt:setLocale value='<%= request.getParameter("lang") %>' />
<% } else { %> 
		<fmt:setLocale value="en" />
<% } %>
<fmt:setBundle basename="UiBundle" />

<!-- <input type="text" class='searchQuerySyntax quickSearch' /> -->
<ul class="paneMenuBar">
	<li menu-name="DISPLAY"><a href="#" menu-name="DISPLAY"><fmt:message key="menu.display" /></a>
	<ul>
		<li><a href="#" name="HEADINGS" >Headings</a></li>
		<li><a href="#" name="VERSE_NUMBERS">Verse Numbers</a></li>
		<li><a href="#" name="VERSE_NEW_LINE">Verses on separate lines</a>
		<li><a href="#" name="RED_LETTER">Jesus' words in red</a></li>
		<li><a href="#" name="NOTES">Notes and References</a></li>
		<li><a href="#" name="ENGLISH_VOCAB">Vocab. in English</a></li>
		<li><a href="#" name="GREEK_VOCAB">Vocab. in Greek / Hebrew</a></li>
		<li><a href="#" name="TRANSLITERATION">Vocab. transliterated</a></li>
		<li><a href="#" name="MORPHOLOGY">Grammar</a></li>
		<li><a href="#" name="COLOUR_CODE" >Colour code grammar</a></li>
	</ul>
	</li>
<!-- 	<li  menu-name="CONTEXT"><a href="#">Context</a> -->
<!-- 	<ul> -->
<!-- 		<li><a href="#" name="TIMELINE">Timeline</a></li> -->
<!-- 		<li><a href="#" name="GEOGRAPHY">Maps</a></li> -->
<!-- 	</ul> -->
<!-- 	</li> -->
	<li  menu-name="SEARCH"><a href="#"><fmt:message key="menu.search" /></a>
	<ul>
		<li><a href="#" name="SEARCH_PASSAGE">Passage lookup</a></li>
		<li class="menuSectionStart"><a href="#" name="SEARCH_SIMPLE_TEXT">Text search</a></li>
		<li><a href="#" name="SEARCH_SUBJECT">Subject search</a></li>
		<li><a href="#" name="SEARCH_ORIGINAL">Word search</a></li>
<!-- 		<li><a href="#" name="SEARCH_LEXICON_DEFINITION">Lexicon definition search</a></li> -->
<!-- 		<li><a href="#" name="SEARCH_TIMELINE">Timeline search</a></li> -->
		<li class="menuSectionStart"><a href="#" name="SEARCH_TEXT">Advanced text search</a></li>
	</ul>
	</li>
	<li menu-name="PASSAGE-TOOLS"><a href="#"><fmt:message key="menu.tools" /></a>
	<ul>
		<li><a href="#" name="BOOKMARK" class="bookmarkPassageMenuItem">Bookmark passage</a></li>
	</ul>
	</li>
</ul>
<br style="clear: left" />