<%@ page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@ page import="java.util.Locale"%>
<%@ page import="javax.servlet.jsp.jstl.core.Config"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.tyndalehouse.step.rest.controllers.BibleController" %>
<%@ page import="com.tyndalehouse.step.rest.controllers.SearchController" %>
<%@ page import="com.tyndalehouse.step.jsp.PassageSearchRequest" %>
<%@ page import="com.tyndalehouse.step.jsp.WebStepRequest" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
    BibleController bible = injector.getInstance(BibleController.class);
    SearchController search = injector.getInstance(SearchController.class);

    String version0 = request.getParameter("version0");
    String version1 = request.getParameter("version1");
    String reference0 = request.getParameter("reference0");
    String reference1 = request.getParameter("reference1");

    String querySyntax0 = request.getParameter("querySyntax0");
    String context0 = request.getParameter("context0");
    String pageNumber0 = request.getParameter("pageNumber0");
    String pageSize0 = request.getParameter("pageSize0");

    String querySyntax1 = request.getParameter("querySyntax1");
    String context1 = request.getParameter("context1");
    String pageNumber1 = request.getParameter("pageNumber1");
    String pageSize1 = request.getParameter("pageSize1");

    PassageSearchRequest passageSearchRequest = new PassageSearchRequest(injector);
    WebStepRequest stepRequest = null;
    boolean isFirstPassage = version0 != null && reference0 != null; 
    if(isFirstPassage) {
        stepRequest = new WebStepRequest(injector, request, version0, reference0);
    }
    
%>
<HTML xmlns:fb="http://ogp.me/ns/fb#" itemscope itemtype="http://schema.org/Book">
<HEAD>
    <% if(isFirstPassage) { %>
        <TITLE><%= stepRequest.getTitle() %></TITLE>
        <meta name="description" content="<%= stepRequest.getDescription() %>" />
        <meta name="keywords" content="<%= stepRequest.getKeywords() %>" />
        <link rel="canonical" href="http://www.stepbible.org/?version=<%= stepRequest.getThisVersion() %>&amp;reference=<%= stepRequest.getThisReference() %>" />
    <%
    }
    %>
</HEAD>
<body>
<fmt:setBundle basename="HtmlBundle" />
<% request.setCharacterEncoding("utf-8"); %>

<%-- Do first passage --%>
<% if(version0 != null && reference0 != null) { %>
<h1><%= version0 %> - <%= reference0 %></h1>
<div>
    <%=	bible.getBibleText(version0, reference0).getValue() %>
</div>
<% } %>

<%-- Then do first --%>
<% if(querySyntax0 != null) { %>
<h1>Search results</h1>
<div><%= passageSearchRequest.getOutput(querySyntax0, context0, pageNumber0, pageSize0) %></div>
<% } %>


<%-- Do second passage --%>
<% if(version1 != null && reference1 != null) { %>
<h1><%= version1 %> - <%= reference1 %></h1>
<div><%= bible.getBibleText(version1, reference1).getValue() %></div>
<% } %>

<%-- Then do second search --%>
<% if(querySyntax1 != null) { %>
<h1>Search results</h1>
<div><%= passageSearchRequest.getOutput(querySyntax1, context1, pageNumber1, pageSize1) %></div>
<% } %>

</body>
</HTML>