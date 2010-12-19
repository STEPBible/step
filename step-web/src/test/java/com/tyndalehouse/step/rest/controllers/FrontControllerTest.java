package com.tyndalehouse.step.rest.controllers;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;

import org.junit.Test;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.service.BibleInformationService;

/**
 * tests the front controller parsing process
 * 
 * @author Chris
 * 
 */
public class FrontControllerTest {

    /**
     * tests that arguments are parsed correctly given the correct start
     */
    @Test
    public void testGetArgs() {
        // index starts at ...........0123456789-123456789-123456
        final String sampleRequest = "step-web/rest/bible/get/1K2/2K2";

        final FrontController fc = new FrontController(mock(Injector.class));

        // when
        final Object[] args = fc.getArgs(sampleRequest, 24);

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

        final FrontController fc = new FrontController(mock(Injector.class));

        // when
        final Object[] args = fc.getArgs(sampleRequest, 24);

        // then
        assertEquals(2, args.length);
        assertEquals("1K2", args[0]);
        assertEquals("2K2", args[1]);
    }

    /**
     * tests generation of cache key
     */
    @Test
    public void testCacheKey() {
        assertEquals("controllergetName",
                new FrontController(mock(Injector.class)).getCacheKey("controller", "getName", null));
    }

    /**
     * tests that resolving method works
     * 
     * @throws IllegalAccessException uncaught exception
     * @throws InvocationTargetException uncaught exception
     */
    @Test
    public void testGetControllerMethod() throws IllegalAccessException, InvocationTargetException {
        final FrontController frontController = new FrontController(mock(Injector.class));
        final BibleInformationService bibleInfo = mock(BibleInformationService.class);
        final BibleController controllerInstance = new BibleController(bibleInfo);

        // when
        final Method controllerMethod = frontController.getControllerMethod("getBibleVersions",
                controllerInstance, null);

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
        final Injector mockInjector = mock(Injector.class);
        final FrontController frontController = new FrontController(mockInjector);

        final BibleController mockController = mock(BibleController.class);
        when(mockInjector.getInstance(BibleController.class)).thenReturn(mockController);

        // when
        final Object controller = frontController.getController(controllerName);

        // then
        assertEquals(controller.getClass(), mockController.getClass());
    }

    /**
     * tests various combinations for getClasses
     */
    @Test
    public void testGetClasses() {
        final FrontController fc = new FrontController(null);

        assertEquals(0, fc.getClasses(null).length);
        assertEquals(0, fc.getClasses(new Object[0]).length);
        assertArrayEquals(new Class<?>[] { String.class, ArrayList.class },
                fc.getClasses(new Object[] { "hello", new ArrayList<String>() }));

    }
}
