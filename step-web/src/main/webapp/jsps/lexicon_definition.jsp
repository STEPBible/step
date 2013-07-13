<%@page import="com.google.inject.Injector"%>
<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="java.util.Locale"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>


<%
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle" />


<span id='lexiconDefinition'>
	<ul id="lexiconDefinitionHeader">
			<span id="lexiconPopupClose"></span>
			<li><a href="#origin"><fmt:message key="original_word" /></a></li>
<%-- 			<li><a href="#context"><fmt:message key="original_word_context" /></a></li> --%>
	</ul>

	<div id="origin" name="LEXICON_DEFINITION">
			
			<div><fmt:message key="lexicon_searches" /></div>

			<p />
			<!--  Vocab -->
			<div id="vocabContainer" class="metadataContainer">
                <div id="vocabEntries"></div>

				<h3><fmt:message key="lexicon_vocab" /></h3>
				<div level="0">
					<div class='lexiconContentText'>
                        <span info-name="accentedUnicode" class="unicodeFont"></span>
                        (<span class='stepTransliteration' info-name="stepTransliteration" title="<fmt:message key="step_disclaimer" />"></span>):
                        <span info-name="shortDef|stepGloss"></span>
                    </div>
				</div>
				<div level="1">
					<p />
					<div><h5><fmt:message key="lexicon_meaning" /> </h5><br /><span info-name="mediumDef" class="lexiconContentText"></span> </div>
				</div>	
				<div level="2">
					<p />
					<h5><span id="lsjBdbHeader"></span></h5><div  class="lexiconContentText" info-name="lsjDefs" ></div>
					<br />
					<h5><fmt:message key="lexicon_related_words" /></h5><div><span info-name="relatedNos"></span></div>
					<br />
				</div>
			</div>
			<p />
			<!--  Gramar -->
			<div id="grammarContainer" class="metadataContainer">
				<h3><fmt:message key="lexicon_grammar" /></h3>
				<!-- Quick view -->
				<div level="0">
                    <table>
                        <tr>
                            <td><h5 info-name="functionNotes|function"></h5></td>
                            <td><span info-name="morphSummary"></span></td>
                        </tr>
                        <tr>
                            <td><h5><fmt:message key="lexicon_ie" /></h5></td>
                            <td><span info-name="explanation"></span></td>
                        </tr>
                        <tr  level="1">
                            <td><h5><fmt:message key="lexicon_eg" /></h5></td>
                            <td>"<span info-name="description"></span>"</td>
                        </tr>
                    </table>
				</div>
				<div level="2">
                    <p />
                    <h5><fmt:message key="detailed_grammar_info" /></h5>
					<table class="lexiconContentText">
						<tr depends-on="functionDescription">
							<td><h5><fmt:message key="lexicon_grammar_function" /></h5></td>
							<td><span info-name="function"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="functionExplained"></span></td>
						</tr>
						<tr depends-on="personDescription">
							<td><h5><fmt:message key="lexicon_grammar_person" /></h5></td>
							<td><span info-name="person"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="personExplained"></span></td>
						</tr>
						<tr depends-on="genderDescription">
							<td><h5><fmt:message key="lexicon_grammar_gender" /></h5></td>
							<td><span info-name="gender"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="genderExplained"></span></td>
						</tr>
						<tr depends-on="numberDescription">
							<td><h5><fmt:message key="lexicon_grammar_number" /></h5></td>
							<td><span info-name="number"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="numberExplained"></span></td>
						</tr>
						<tr depends-on="caseDescription">
							<td><h5><fmt:message key="lexicon_grammar_case" /></h5></td>
							<td><span info-name="wordCase"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="caseExplained"></span></td>
						</tr>
						<tr depends-on="tenseDescription">
							<td><h5><fmt:message key="lexicon_grammar_tense" /></h5></td>
							<td><span info-name="tense"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="tenseExplained"></span></td>
						</tr>
						<tr depends-on="moodDescription">
							<td><h5><fmt:message key="lexicon_grammar_mood" /></h5></td>
							<td><span info-name="mood"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="moodExplained"></span></td>
						</tr>
						<tr depends-on="voiceDescription">
							<td><h5><fmt:message key="lexicon_grammar_voice" /></h5></td>
							<td><span info-name="voice"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="voiceExplained"></span></td>
						</tr>
						<tr depends-on="suffixDescription">
							<td><h5><fmt:message key="lexicon_grammar_suffix" /></h5></td>
							<td><span info-name="suffix"></span></td>
							<td><h5><fmt:message key="lexicon_ie" /></h5></td>
							<td><span info-name="suffixExplained"></span></td>
						</tr>
					</table>
				</div>
			</div>
			
	</div>
	<div id="context">
		<p></p>
	</div>
</span>
