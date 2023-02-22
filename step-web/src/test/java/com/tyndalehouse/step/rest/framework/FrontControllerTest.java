package com.tyndalehouse.step.rest.framework;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.AppManagerService;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.guice.providers.ClientSessionProvider;
import com.tyndalehouse.step.rest.controllers.BibleController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import javax.inject.Provider;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Locale;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.*;
import static org.mockito.Mockito.*;

/**
 * tests the front controller parsing process
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
    public void setUp() throws IOException {
        final ClientSession clientSession = mock(ClientSession.class);
        when(clientSession.getLocale()).thenReturn(Locale.ENGLISH);
        when(this.clientSessionProvider.get()).thenReturn(clientSession);
        final ObjectMapper mockMapper = mock(ObjectMapper.class);
        when(mockMapper.writeValueAsString(any(Object.class))).thenReturn("Test");
        when(this.objectMapper.get()).thenReturn(mockMapper);

        this.fcUnderTest = new FrontController(this.guiceInjector, mock(AppManagerService.class), this.errorResolver,
                this.clientSessionProvider, objectMapper);
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
}
