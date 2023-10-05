<%@page import="java.io.FileReader"%>
<%@page import="java.io.BufferedReader"%>
<%@page import="com.google.inject.Injector" %>
<%@page import="com.tyndalehouse.step.core.models.ClientSession" %>
<%@ page import="com.tyndalehouse.step.core.service.helpers.VersionResolver" %>
<%@ page import="com.tyndalehouse.step.jsp.VersionStepRequest" %>
<%@ page import="javax.servlet.jsp.jstl.core.Config" %>
<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ page import="java.util.Locale" %>
<%@ page import="java.util.ResourceBundle" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%!
    Boolean isCrossWireModule;
%>
<%
    Injector injector = (Injector) pageContext.getServletContext().getAttribute(Injector.class.getName());
    VersionResolver resolver = injector.getInstance(VersionResolver.class);
    Locale locale = injector.getInstance(ClientSession.class).getLocale();
    Config.set(session, Config.FMT_LOCALE, locale);
    VersionStepRequest stepRequest = new VersionStepRequest(injector, request);

    isCrossWireModule = new Boolean(false);

    try {
        String pathOfCrossWireLookup = "/var/www/crosswire_mods_on_step.txt";
        String searchString = "[" + stepRequest.getBook().getInitials().trim() + "]";
        BufferedReader reader = new BufferedReader(new FileReader(pathOfCrossWireLookup));
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.indexOf(searchString) == 0) {
                isCrossWireModule = new Boolean(true);
                break;
            }
        }
        reader.close();
    }
    catch (Exception e) {
        isCrossWireModule = new Boolean(false);
    }

%>
<fmt:setBundle basename="HtmlBundle"/>
<% if (!stepRequest.isSuccess()) {
    ResourceBundle r = ResourceBundle.getBundle("HtmlBundle", locale);
    response.sendError(404, r.getString("unable_to_obtain_version_information"));
    return;
}
%>
<% request.setCharacterEncoding("utf-8"); %>

<jsp:include page="jsps/header_version.jsp">
    <jsp:param value="<%= stepRequest.getBook().getName() %>" name="title"/>
    <jsp:param value="<%= stepRequest.getBook().getName() %>" name="description"/>
    <jsp:param value="<%= stepRequest.getBook().getName() %>" name="keywords"/>
    <jsp:param value="<%= stepRequest.getBook().getInitials().trim() %>" name="initial"/>
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
            <%
                if ( isCrossWireModule ) {
                    String inits = stepRequest.getBook().getInitials().trim();
                    ResourceBundle r = ResourceBundle.getBundle("HtmlBundle", locale);
                    String curated = String.format(r.getString("module_curated_by_crosswire"), inits);
            %>
                    <span class="about"><%= curated %> </span>
            <%
                }
            %>

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