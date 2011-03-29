package com.tyndalehouse.step.rest.controllers;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Injector;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.rest.framework.ClientErrorResolver;
import com.tyndalehouse.step.rest.framework.ResponseCache;
import com.tyndalehouse.step.rest.framework.StepRequest;

/**
 * tests the front controller parsing process
 * 
 * @author Chris
 * 
 */
@SuppressWarnings("PMD.TooManyMethods")
@RunWith(MockitoJUnitRunner.class)
public class FrontControllerTest {
    private FrontController fcUnderTest;
    @Mock
    private Injector guiceInjector;

    private final Boolean isCacheEnabled = Boolean.FALSE;

    @Mock
    private EbeanServer ebean;
    @Mock
    private ClientErrorResolver errorResolver;
    @Mock
    private ResponseCache responseCache;

    /**
     * Simply setting up the FrontController under test
     */
    @Before
    public void setUp() {
        this.fcUnderTest = new FrontController(this.guiceInjector, this.isCacheEnabled, this.ebean,
                this.errorResolver, this.responseCache);
    }

    /**
     * Tests normal operation of a GET method
     * 
     * @throws IOException uncaught exception
     */
    @Test
    public void testDoGet() throws IOException {
        final HttpServletRequest request = mock(HttpServletRequest.class);
        final HttpServletResponse response = mock(HttpServletResponse.class);

        final FrontController fc = spy(this.fcUnderTest);
        final StepRequest parsedRequest = new StepRequest("blah", "SomeController", "someMethod",
                new String[] { "arg1", "arg2" });
        final ServletOutputStream mockOutputStream = mock(ServletOutputStream.class);

        doReturn(parsedRequest).when(fc).parseRequest(request);
        doReturn(mockOutputStream).when(response).getOutputStream();
        final byte[] sampleResponse = new byte[] { 1, 2, 3 };
        doReturn(sampleResponse).when(fc).invokeMethod(parsedRequest);

        // do the test
        fc.doGet(request, response);
        verify(mockOutputStream).write(sampleResponse);
    }

    /**
     * tests what happens when doGet catches an exception
     */
    @Test
    public void testDoGetHasException() {
        final HttpServletRequest request = mock(HttpServletRequest.class);
        final HttpServletResponse response = mock(HttpServletResponse.class);
        final StepInternalException testException = new StepInternalException("A test exception");

        final FrontController fc = spy(this.fcUnderTest);
        final StepRequest parsedRequest = new StepRequest("blah", "SomeController", "someMethod",
                new String[] { "arg1", "arg2" });

        doThrow(testException).when(fc).parseRequest(request);
        doNothing().when(fc).handleError(response, testException, parsedRequest);

        // do the test
        fc.doGet(request, response);

    }

    /**
     * tests that arguments are parsed correctly given the correct start
     */
    @Test
    public void testGetArgs() {
        // index starts at ...........0123456789-123456789-123456
        final String sampleRequest = "step-web/rest/bible/get/1K2/2K2";

        // when
        final Object[] args = this.fcUnderTest.getArgs(sampleRequest, 24);

        // then
        assertEquals(2, args.length);
        assertEquals("1K2", args[0]);
        assertEquals("2K2", args[1]);
    }

    /**
     * tests that parsing of request works if request finishes with a slash
     */
    @Test
    public void testGetArgsFinishingWithSlash() {
        // index starts at ...........0123456789-123456789-123456
        final String sampleRequest = "step-web/rest/bible/get/1K2/2K2/";

        // when
        final Object[] args = this.fcUnderTest.getArgs(sampleRequest, 24);

        // then
        assertEquals(2, args.length);
        assertEquals("1K2", args[0]);
        assertEquals("2K2", args[1]);
    }

    /**
     * we check that the path is concatenated with the servlet path
     * 
     * @throws ServletException an uncaught exception
     */
    @Test
    public void testGetPath() throws ServletException {
        final FrontController spy = spy(this.fcUnderTest);

        final ServletContext mockServletContext = mock(ServletContext.class);
        final HttpServletRequest mockRequest = mock(HttpServletRequest.class);

        spy.init(mock(ServletConfig.class));

        when(spy.getServletContext()).thenReturn(mockServletContext);
        when(mockServletContext.getContextPath()).thenReturn("context/");
        when(mockRequest.getServletPath()).thenReturn("servletPath");

        // when
        final String path = spy.getPath(mockRequest);

        // then
        assertEquals(path, "context/servletPath");
    }

    /**
     * tests that the headers are setup correctly
     */
    @Test
    public void testHeadersSetupCorrectly() {
        final HttpServletResponse response = mock(HttpServletResponse.class);

        final int sampleRequestLength = 10;
        this.fcUnderTest.setupHeaders(response, sampleRequestLength);

        verify(response).addDateHeader(eq("Date"), anyLong());
        verify(response).setCharacterEncoding("UTF-8");
        verify(response).setContentType("application/json");
        verify(response).setContentLength(sampleRequestLength);

    }

    /**
     * tests that resolving method works
     * 
     * @throws IllegalAccessException uncaught exception
     * @throws InvocationTargetException uncaught exception
     */
    @Test
    public void testGetControllerMethod() throws IllegalAccessException, InvocationTargetException {
        final BibleInformationService bibleInfo = mock(BibleInformationService.class);
        final BibleController controllerInstance = new BibleController(bibleInfo);

        // when
        final Method controllerMethod = this.fcUnderTest.getControllerMethod("getBibleVersions",
                controllerInstance, null, null);

        // then
        controllerMethod.invoke(controllerInstance);
        verify(bibleInfo).getAvailableBibleVersions();
    }

    /**
     * tests the get controller method
     */
    @Test
    public void testGetController() {
        final String controllerName = "Bible";
        final BibleController mockController = mock(BibleController.class);
        when(this.guiceInjector.getInstance(BibleController.class)).thenReturn(mockController);

        // when
        final Object controller = this.fcUnderTest.getController(controllerName);

        // then
        assertEquals(controller.getClass(), mockController.getClass());
    }

    /**
     * tests various combinations for getClasses
     */
    @Test
    public void testGetClasses() {
        assertEquals(0, this.fcUnderTest.getClasses(null).length);
        assertEquals(0, this.fcUnderTest.getClasses(new Object[0]).length);
        assertArrayEquals(new Class<?>[] { String.class, Integer.class },
                this.fcUnderTest.getClasses(new Object[] { "hello", Integer.valueOf(1) }));

    }

    /**
     * tests that we encode using json mapper and set to UTF 8
     */
    @Test
    public void testJsonEncoding() {
        final byte[] encodedJsonResponse = this.fcUnderTest.getEncodedJsonResponse("abc");

        // this reprensents the string "{abc}"
        final byte[] expectedValues = new byte[] { 34, 97, 98, 99, 34 };

        assertArrayEquals(expectedValues, encodedJsonResponse);
    }

    /**
     * If an error was thrown, we should map it and output
     * 
     * @throws IOException uncaught exception
     */
    @Test
    public void testDoErrorHandlesCorrectly() throws IOException {
        final HttpServletResponse response = mock(HttpServletResponse.class);
        final StepRequest stepRequest = new StepRequest("blah", "controller", "method", null);
        final ServletOutputStream outputStream = mock(ServletOutputStream.class);
        final Throwable exception = new Exception();
        when(response.getOutputStream()).thenReturn(outputStream);

        // do test
        this.fcUnderTest.handleError(response, exception, stepRequest);

        // check
        verify(outputStream).write(any(byte[].class));
    }

    /**
     * checks that parsing is working correctly
     * 
     * @throws ServletException uncaught exception
     */
    @Test
    public void testParseRequest() throws ServletException {
        final HttpServletRequest request = mock(HttpServletRequest.class);
        final String requestSeparator = "/";
        final String contextName = "step-web";
        final String servletName = "servletName";
        final String controllerName = "controllerName";
        final String methodName = "methodName";
        final String arg1 = "argument1";
        final String arg2 = "argument2";

        when(request.getServletPath()).thenReturn(servletName);
        when(request.getRequestURI()).thenReturn(
                contextName + requestSeparator + servletName + requestSeparator + controllerName
                        + requestSeparator + methodName + requestSeparator + arg1 + requestSeparator + arg2);

        this.fcUnderTest.init(mock(ServletConfig.class));

        final FrontController spy = spy(this.fcUnderTest);

        final ServletContext mockServletContext = mock(ServletContext.class);
        when(spy.getServletContext()).thenReturn(mockServletContext);
        when(mockServletContext.getContextPath()).thenReturn(contextName + "/");

        // do test
        final StepRequest parseRequest = this.fcUnderTest.parseRequest(request);

        // check controller name, method name and arguments
        assertEquals(controllerName, parseRequest.getControllerName());
        assertEquals(methodName, parseRequest.getMethodName());
    }

    /**
     * We check that invoke method calls the correct controller and method with the right arguments
     */
    @Test
    public void testInvokeMethod() {
        final StepRequest sr = new StepRequest("blah", "bible", "getAllFeatures", new String[] {});
        final BibleController testController = mock(BibleController.class);

        final FrontController fc = spy(this.fcUnderTest);
        doReturn(testController).when(fc).getController("bible");

        // do test
        fc.invokeMethod(sr);

        // verify
        verify(testController).getAllFeatures();
    }
}
