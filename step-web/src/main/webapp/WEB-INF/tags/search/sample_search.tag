<%@ attribute name="option4" %>
<%@ attribute name="option4type" %>
<%@ attribute name="explanation" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@attribute name="option1" required="false" %>
<%@attribute name="option1type" required="false" %>
<%@attribute name="option2" required="false" %>
<%@attribute name="option2type" required="false" %>
<%@attribute name="option3" required="false" %>
<%@attribute name="option3type" required="false" %>

<fmt:message key="${ explanation }" />
<span class="input-group">
    <span class="form-control input-sm">
        <c:if test="${ not empty option1 }"><span class="argSelect select-${ option1type }">${ option1 }</span></c:if>
        <c:if test="${ not empty option2 }"><span class="argSelect select-${ option2type }">${ option2 }</span></c:if>
        <c:if test="${ not empty option3 }"><span class="argSelect select-${ option3type }">${ option3 }</span></c:if>
        <c:if test="${ not empty option4 }"><span class="argSelect select-${ option4type }">${ option4 }</span></c:if>
    </span>
    <span class="input-group-btn">
        <span class="find btn btn-default btn-danger btn-sm">
            <fmt:message key="find" />
        </span>
    </span>
</span>
<br />
<br />