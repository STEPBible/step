<%@page import="com.google.inject.Injector" %>
<%@page import="com.tyndalehouse.step.core.models.ClientSession" %>
<%@ page import="com.tyndalehouse.step.core.service.helpers.VersionResolver" %>
<%@ page import="com.tyndalehouse.step.jsp.VersionStepRequest" %>
<%@ page import="javax.servlet.jsp.jstl.core.Config" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ page import="java.util.Locale" %>
<%@ page import="java.util.ResourceBundle" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    VersionResolver resolver = injector.getInstance(VersionResolver.class);
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale);
    VersionStepRequest stepRequest = new VersionStepRequest(injector, request);
%>
<fmt:setBundle basename="HtmlBundle"/>
<% if (!stepRequest.isSuccess()) {
    ResourceBundle r = ResourceBundle.getBundle("HtmlBundle", locale);
    response.sendError(404, r.getString("unable_to_obtain_version_information"));
    return;
}
%>
<% request.setCharacterEncoding("utf-8"); %>
<jsp:include page="jsps/header.jsp">
    <jsp:param value="<%= stepRequest.getBook().getName() %>" name="title"/>
    <jsp:param value="<%= stepRequest.getBook().getName() %>" name="description"/>
    <jsp:param value="<%= stepRequest.getBook().getName() %>" name="keywords"/>
</jsp:include>


    <div class="container">
        <h2><%= stepRequest.getBook().getName() %> (<%= resolver.getShortName(stepRequest.getBook().getInitials()) %>)</h2>
        <%
            String info = stepRequest.getTyndaleInfo();
            if (info != null) {
        %>
        <div class="tyndaleInfo">
            <span class='tyndaleInfo'><%=  info %></span>

            <p/>
        </div>
        <%
            }
        %>


        <span id="bookListContainer">
            <%= stepRequest.getBookList() %>
        </span>

        <span class="copyright" style="margin: 0px !important;">
            <span class="about"><fmt:message key="module_from_sword"/></span>
            <p></p>
        </span>

        <span class="copyright">
            <h3><fmt:message key="copyright_information"/></h3>
            <span class="shortCopyright"><%= stepRequest.getShortCopyright() %></span>
            <p></p>
            <%--<span class="shortCopyright"><%= stepRequest.getDistributionLicense() %></span>--%>
            <%--<p></p>--%>
            <span class="shortPromo"><%= stepRequest.getShortPromo() %></span>
            <p></p>
            <span class="about"><%= stepRequest.getAbout() %>
            <p></p>
            <%= stepRequest.getMiniPreface() %>
            </span>

        </span>
    </div>
</body>