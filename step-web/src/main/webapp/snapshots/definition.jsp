<%@page import="com.tyndalehouse.step.core.models.LexiconSuggestion"%>
<%@page import="java.util.List"%>
<%@page import="com.tyndalehouse.step.models.info.MorphInfo"%>
<%@page import="com.tyndalehouse.step.core.models.ShortLexiconDefinition"%>
<%@page import="com.tyndalehouse.step.models.info.VocabInfo"%>
<%@page import="com.tyndalehouse.step.models.info.Info"%>
<%@page import="java.util.ResourceBundle"%>
<%@ page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@ page import="java.util.Locale"%>
<%@ page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %> 
<%@ page import="com.tyndalehouse.step.jsp.VersionStepRequest" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>
<%@ page import="com.tyndalehouse.step.rest.controllers.ModuleController" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<% 
	Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
	Locale locale = injector.getInstance(ClientSession.class).getLocale();
	Config.set(session, Config.FMT_LOCALE, locale);
	ModuleController controller = injector.getInstance(ModuleController.class);
	
	String lexiconStrongs = request.getParameter("strong");
	String lexiconMorph = request.getParameter("morph");
	
	String morphValue = lexiconMorph != null ? lexiconMorph : ""; 
	Info infos = controller.getInfo("ESV", "", lexiconStrongs, morphValue);
%>

<fmt:setBundle basename="HtmlBundle" />
<% request.setCharacterEncoding("utf-8"); %>

<% if(infos.getVocabInfos().size() > 0)  {
    VocabInfo firstVocab = infos.getVocabInfos().get(0);
%>
    <TITLE><%= firstVocab.getAccentedUnicode() %> | <%= firstVocab.getStepTransliteration() %> | <%= firstVocab.getStepGloss() %> | <%= firstVocab.getStrongNumber() %> | STEP</TITLE>
    <meta name="description" content="<%= firstVocab.getShortDef() %>" />
<%
    }
%>


<% 
	for(VocabInfo vocab : infos.getVocabInfos()) {
%>
	<h2>
		<%= vocab.getAccentedUnicode() %> - <%= vocab.getStepGloss() %> 
		(<%= vocab.getStepTransliteration() %> <%= vocab.getStrongNumber() %>)
	</h2>
	
	
	<% if (vocab.getShortDef() != null) { %>
	<h3>Short Definition</h3>
	<%= vocab.getShortDef() %>
	
	<% } %>
	
	
	<% if (vocab.getMediumDef() != null) { %>
	<h3>Medium Definition</h3>
	<%= vocab.getMediumDef() %>
	
	<% } %>


    <% if (vocab.getLsjDefs() != null) { %>
    <h3>Full LSJ Definition</h3>
    <%= vocab.getLsjDefs() %>
    <% } %>

	<h3>Related numbers</h3>
	<% 
		List<LexiconSuggestion> similarStrongs = vocab.getRelatedNos();
		if(similarStrongs != null) {
			for(LexiconSuggestion def : similarStrongs) {
	%>
		<a href="#!lexicon=strong=<%= def.getStrongNumber() %>"><%= def.getGloss() %> - <%= def.getMatchingForm() %></a>		
	<%
			}
		}
	%>
	
	<h3>Other transliterations</h3>
	<%= vocab.getAlternativeTranslit1() != null ? vocab.getAlternativeTranslit1() : "" %><br />
	<%= vocab.getStrongTranslit() != null ? vocab.getStrongTranslit()  : "" %><br />
	<%= vocab.getStrongPronunc() != null ? vocab.getStrongPronunc()  : "" %><br />

<% 
} // end for loop 
%>

<!-- Now do morphology -->
<%
		for(MorphInfo morph : infos.getMorphInfos()) {
%>

<% if (morph.getFunction() != null) { %> <h3><fmt:message key="lexicon_grammar_function" /></h3><%= morph.getFunction() %><% } %>
<% if (morph.getPerson() != null) { %> <h3><fmt:message key="lexicon_grammar_person" /></h3><%= morph.getPerson() %><% } %>
<% if (morph.getGender() != null) { %> <h3><fmt:message key="lexicon_grammar_gender" /></h3><%= morph.getGender() %><% } %>
<% if (morph.getNumber() != null) { %> <h3><fmt:message key="lexicon_grammar_number" /></h3> <%= morph.getNumber() %><% } %>
<% if (morph.getWordCase() != null) { %><h3><fmt:message key="lexicon_grammar_case" /></h3> <%= morph.getWordCase() %><% } %>
<% if (morph.getTense() != null) { %> <h3><fmt:message key="lexicon_grammar_tense" /></h3><%= morph.getTense() %><% } %>
<% if (morph.getMood() != null) { %> <h3><fmt:message key="lexicon_grammar_mood" /></h3><%= morph.getMood() %><% } %>
<% if (morph.getVoice() != null) { %> <h3><fmt:message key="lexicon_grammar_voice" /></h3><%= morph.getVoice() %><% } %>
<% if (morph.getSuffix() != null) { %> <h3><fmt:message key="lexicon_grammar_suffix" /></h3> <%= morph.getSuffix() %><% } %>

<%
		}
%>
