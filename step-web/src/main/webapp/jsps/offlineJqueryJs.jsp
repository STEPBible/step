<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:choose>
    <c:when test="${ param.debug eq '' }">
        <script src="libs/jquery-1.10.2.js" type="text/javascript"></script>
        <script src="libs/bootstrap.js" type="text/javascript"></script>
    </c:when>
    <c:otherwise>
        <script src="libs/jquery-1.10.2.min.js" type="text/javascript"></script>
        <script src="libs/bootstrap.min.js" type="text/javascript"></script>

    </c:otherwise>
</c:choose>