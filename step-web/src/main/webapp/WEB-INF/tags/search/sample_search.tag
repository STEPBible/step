<%@ attribute name="option4" %>
<%@ attribute name="option4type" %>
<%@ attribute name="explanation" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="http://www.stepbible.org/stepFunctions" prefix="step" %>
<%@attribute name="option1" required="false" %>
<%@attribute name="option1type" required="false" %>
<%@attribute name="option2" required="false" %>
<%@attribute name="option2type" required="false" %>
<%@attribute name="option3" required="false" %>
<%@attribute name="option3type" required="false" %>

<fmt:message key="${explanation}"  var="explanationText" />
${ step:markTransliteration(explanationText) }

<span class="input-group">
    <span class="form-control input-sm argSummary">
        <c:if test="${ not empty option1 }"><span class="argSelect select-${ option1type } ${fn:contains(option1, '.') ? 'transliteration' : ''}>${ option1 }</span></c:if>
        <c:if test="${ not empty option2 }"><span class="argSelect select-${ option2type } ${fn:contains(option2, '.') ? 'transliteration' : ''}">${ option2 }</span></c:if>
        <c:if test="${ not empty option3 }"><span class="argSelect select-${ option3type } ${fn:contains(option3, '.') ? 'transliteration' : ''}">${ option3 }</span></c:if>
        <c:if test="${ not empty option4 }"><span class="argSelect select-${ option4type } ${fn:contains(option4, '.') ? 'transliteration' : ''}">${ option4 }</span></c:if>
    </span>
    <span  class="input-group-btn">
        &nbsp;
    </span>
</span>
<br />
<br />