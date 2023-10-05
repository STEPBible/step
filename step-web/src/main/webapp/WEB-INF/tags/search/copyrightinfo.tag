<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="copyrightInfo">
    <fmt:message key="copyright_information_list" />
    <c:forEach var="v" items="${versionList}" varStatus="count"><c:if test="${count.index gt 0}">, </c:if><a href="/version.jsp?version=${v}" target="_new">${v}</a></c:forEach>
</div>

