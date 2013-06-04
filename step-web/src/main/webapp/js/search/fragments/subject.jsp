<%@page import="com.tyndalehouse.step.core.models.ClientSession"%>
<%@page import="javax.servlet.jsp.jstl.core.Config"%>
<%@page import="java.util.Locale"%>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ page import="com.google.inject.Injector"%>
<%@ page import="com.google.inject.Guice"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale.getLanguage());
%>
<fmt:setBundle basename="HtmlBundle" />

<fieldset name="subject">
    <legend><fmt:message key="search_subject" /></legend>
    <table class="subjectSearchTable">
        <tr>
            <td><fmt:message key="subject_search" />&nbsp;</td>
            <td>
                <input type="text" class="subjectText _m" title="<fmt:message key="subject_search_text_title" />" />
            </td>
        </tr>
        <tr level="1">
            <td><fmt:message key="subject_related" />&nbsp;</td>
            <td>
                <input type="text" class="subjectRelated _m drop" title="<fmt:message key="subject_search_related" />"/>
            </td>
        </tr>

        <tr level="2">
            <td><fmt:message key="search_query_syntax" />&nbsp;</td>
            <td><input type="text" class="subjectQuerySyntax querySyntax" /></td>
        </tr>
    </table>

    <div>
        <input type="button" class="subjectClear resetSearch" value="<fmt:message key="search_reset_form" />" title="<fmt:message key="search_reset_form_title" />" />
        <input type="button" class="subjectSearch doSearch" value="<fmt:message key="search_search_button" />" title="<fmt:message key="search_search_button_title" />" />
    </div>

    <hr level="2" />

    <jsp:include page="search_toolbar.jsp?namespace=subject&context=false&bibleVersions=false&paging=false&refining=false" />
</fieldset>