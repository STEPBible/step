/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 *
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.rest.framework;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Locale;

import javax.inject.Provider;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.guice.providers.ClientSessionProvider;
import com.tyndalehouse.step.rest.controllers.BibleController;

/**
 * tests the front controller parsing process
 *
 * @author chrisburrell
 */
@SuppressWarnings("PMD.TooManyMethods")
@RunWith(MockitoJUnitRunner.class)
public class FrontControllerTest {
    private FrontController fcUnderTest;

    @Mock
    private Injector guiceInjector;

    @Mock
    private ClientErrorResolver errorResolver;
    @Mock
    private StepRequest stepRequest;

    @Mock
    private ClientSessionProvider clientSessionProvider;
    
    @Mock
    private Provider<ObjectMapper> objectMapper;

    /**
     * Simply setting up the FrontController under test
     */
    @Before
    public void setUp() {
        final ClientSession clientSession = mock(ClientSession.class);
        when(clientSession.getLocale()).thenReturn(Locale.ENGLISH);
        when(this.clientSessionProvider.get()).thenReturn(clientSession);
        when(this.objectMapper.get()).thenReturn(mock(ObjectMapper.class));
        
        this.fcUnderTest = new FrontController(this.guiceInjector, this.errorResolver,
                this.clientSessionProvider, objectMapper);
    }

    /**
     * Tests normal operation of a GET method
     *
     * @throws IOException uncaught exception
     */
    @Test
    public void testDoGet() throws Exception {
        final HttpServletRequest req = mock(HttpServletRequest.class);
        final HttpServletResponse response = mock(HttpServletResponse.class);
        final String sampleRequest = "step-web/rest/bible/get/1K2/2K2/";

        when(req.getRequestURI()).thenReturn(sampleRequest);
        when(req.getServletPath()).thenReturn("step-web/");
        when(req.getContextPath()).thenReturn("rest/");

        final FrontController fc = spy(this.fcUnderTest);

        final ServletOutputStream mockOutputStream = mock(ServletOutputStream.class);

        doReturn(mockOutputStream).when(response).getOutputStream();
        final byte[] sampleResponse = new byte[]{1, 2, 3};
        doReturn(sampleResponse).when(fc).invokeMethodWithStepRequest(any(StepRequest.class));

        // do the test
        assertEquals(sampleResponse, fc.invokeMethod(req));
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
                new String[]{"arg1", "arg2"});

        // TODO remove this/
        doNothing().when(fc).handleError(response, testException, mock(HttpServletRequest.class));

        // do the test
        fc.doGet(request, response);

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
     * @throws IllegalAccessException    uncaught exception
     * @throws InvocationTargetException uncaught exception
     */
    @Test
    public void testGetControllerMethod() throws IllegalAccessException, InvocationTargetException {
        final BibleInformationService bibleInfo = mock(BibleInformationService.class);
        final BibleController controllerInstance = new BibleController(bibleInfo, this.clientSessionProvider, null);

        // when
        final Method controllerMethod = this.fcUnderTest.getControllerMethod("getAllFeatures",
                controllerInstance, null, null);

        // then
        controllerMethod.invoke(controllerInstance);
        verify(bibleInfo).getAllFeatures();
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
        final Object controller = this.fcUnderTest.getController(controllerName, false);

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
        assertArrayEquals(new Class<?>[]{String.class, Integer.class},
                this.fcUnderTest.getClasses(new Object[]{"hello", Integer.valueOf(1)}));

    }

    /**
     * tests that we encode using json mapper and set to UTF 8
     */
    @Test
    public void testJsonEncoding() {
        final byte[] encodedJsonResponse = this.fcUnderTest.getEncodedJsonResponse("abc");

        // this reprensents the string "{abc}"
        final byte[] expectedValues = new byte[]{34, 97, 98, 99, 34};

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
        // final StepRequest stepRequest = new StepRequest("blah", "controller", "method", null);
        final ServletOutputStream outputStream = mock(ServletOutputStream.class);
        final Throwable exception = new Exception();
        when(response.getOutputStream()).thenReturn(outputStream);
        when(this.stepRequest.getCacheKey()).thenReturn(new ControllerCacheKey("method", "results"));

        // do test
        this.fcUnderTest.handleError(response, exception, mock(HttpServletRequest.class));

        // check
        verify(outputStream).write(any(byte[].class));
    }

    /**
     * We check that invoke method calls the correct controller and method with the right arguments
     */
    @Test
    public void testInvokeMethod() throws Exception {
        final StepRequest sr = new StepRequest("blah", "bible", "getAllFeatures", new String[]{});
        final BibleController testController = mock(BibleController.class);

        final FrontController fc = spy(this.fcUnderTest);
        doReturn(testController).when(fc).getController("bible", false);

        // do test
        fc.invokeMethodWithStepRequest(sr);

        // verify
        verify(testController).getAllFeatures();
    }
}
