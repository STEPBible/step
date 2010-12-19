package com.tyndalehouse.step.rest.controllers;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * The FrontController acts like a minimal REST server. The paths are resolved as follows:
 * 
 * /step-web/rest/controllerName/methodName/arg1/arg2/arg3
 * 
 * @author Chris
 * 
 */
@Singleton
public class FrontController extends HttpServlet {
    private static final String UTF_8_ENCODING = "UTF-8";
    private static final Logger LOGGER = LoggerFactory.getLogger(FrontController.class);
    private static final char PACKAGE_SEPARATOR = '.';
    private static final long serialVersionUID = 7898656504631346047L;
    private static final String CONTROLLER_SUFFIX = "Controller";
    private final Map<String, String> contextPath = new HashMap<String, String>();
    private final transient Injector guiceInjector;
    // TODO but also check threadsafety and whether we should share this object
    private final transient ObjectMapper jsonMapper = new ObjectMapper();
    private final Map<String, Method> methodNames = new HashMap<String, Method>();
    private final Map<String, Object> controllers = new HashMap<String, Object>();

    /**
     * creates the front controller which will dispatch all the requests
     * 
     * @param guiceInjector the injector used to call the relevant controllers
     */
    @Inject
    public FrontController(final Injector guiceInjector) {
        this.guiceInjector = guiceInjector;
    }

    @Override
    protected void doGet(final HttpServletRequest req, final HttpServletResponse response) {
        // fast string manipulation... (?)
        final String requestURI = req.getRequestURI();
        LOGGER.debug("Processing {}", requestURI);

        final int requestStart = getPath(req).length() + 1;
        final int endOfControllerName = requestURI.indexOf('/', requestStart);
        final int startOfMethodName = endOfControllerName + 1;
        final String controllerName = requestURI.substring(requestStart, endOfControllerName);
        final String methodName = requestURI.substring(startOfMethodName,
                requestURI.indexOf('/', startOfMethodName));
        final int endOfMethodName = startOfMethodName + methodName.length();

        LOGGER.debug("Request parsed as controller: [{}], method [{}]", controllerName, methodName);

        // controller instance on which to call a method
        final Object controllerInstance = getController(controllerName);

        // some arguments to be passsed through
        final Object[] args = getArgs(requestURI, endOfMethodName + 1);

        // resolve method
        final Method controllerMethod = getControllerMethod(methodName, controllerInstance, args);

        try {
            // invoke the three together
            final Object returnVal = controllerMethod.invoke(controllerInstance, args);
            final String jsonReturnValue = this.jsonMapper.writeValueAsString(returnVal);

            final byte[] jsonEncoded = jsonReturnValue.getBytes(UTF_8_ENCODING);

            // put results in cache if method is annotated. We don't need to do that
            // afterwards...
            setupHeaders(response, jsonEncoded.length);
            response.getOutputStream().write(jsonEncoded);
            // response.getOutputStream().flush();
            // response.getOutputStream().close();

            // perhaps we want to cache things...
            // TODO

        } catch (final StepInternalException e) {
            // TODO handle this slightly differently?
            doError(e);
        } catch (final NoSuchMethodError e) {
            doError(e);
        } catch (final IllegalAccessException e) {
            doError(e);
        } catch (final InvocationTargetException e) {
            doError(e);
        } catch (final JsonGenerationException e) {
            doError(e);
        } catch (final JsonMappingException e) {
            doError(e);
        } catch (final IOException e) {
            doError(e);
        }
    }

    /**
     * sets up the headers and the length of the message
     * 
     * @param response the response
     * @param length the length of the message
     */
    private void setupHeaders(final HttpServletResponse response, final int length) {
        // we ensure that headers are set up appropriately
        response.addDateHeader("Date", System.currentTimeMillis());
        response.setCharacterEncoding(UTF_8_ENCODING);
        response.setContentType("application/json");
        response.setContentLength(length);
    }

    /**
     * deals with an error whilst executing the request
     * 
     * @param e the exception
     */
    private void doError(final Throwable e) {
        LOGGER.error(e.getMessage(), e);

        // TODO deal with error here:

    }

    /**
     * Retrieves a controller, either from the cache, or from Guice
     * 
     * @param controllerName the name of the controller (used as the key for the cache)
     * @return the controller object
     */
    Object getController(final String controllerName) {
        Object controllerInstance = this.controllers.get(controllerName);

        // if retrieving yields null, get controller from Guice, and put in cache
        if (controllerInstance == null) {
            // make up the full class name
            final String packageName = getClass().getPackage().getName();
            final StringBuilder className = new StringBuilder(packageName.length() + controllerName.length()
                    + CONTROLLER_SUFFIX.length() + 1);

            className.append(packageName);
            className.append(PACKAGE_SEPARATOR);
            className.append(Character.toUpperCase(controllerName.charAt(0)));
            className.append(controllerName.substring(1));
            className.append(CONTROLLER_SUFFIX);

            try {
                final Class<?> controllerClass = Class.forName(className.toString());
                controllerInstance = this.guiceInjector.getInstance(controllerClass);

                // we use the controller name as it came in to key the map
                this.controllers.put(controllerName, controllerInstance);
            } catch (final ClassNotFoundException e) {
                throw new StepInternalException("Unable to find a controller for " + className, e);
            }
        }
        return controllerInstance;
    }

    /**
     * Returns the method to be invoked upon the controller
     * 
     * @param methodName the method name
     * @param controllerInstance the instance of the controller
     * @param args the list of arguments, required to resolve the correct method if they have arguments
     * @return the method to be invoked
     */
    Method getControllerMethod(final String methodName, final Object controllerInstance, final Object[] args) {
        final Class<? extends Object> controllerClass = controllerInstance.getClass();

        // try cache first
        final String cacheKey = getCacheKey(controllerClass.getName(), methodName, args == null ? 0
                : args.length);

        // retrieve method from cache, or put in cache if not there
        Method controllerMethod = this.methodNames.get(cacheKey);
        if (controllerMethod == null) {
            // resolve method
            try {
                controllerMethod = controllerClass.getMethod(methodName, getClasses(args));

                // put method in cache
                this.methodNames.put(cacheKey, controllerMethod);
            } catch (final NoSuchMethodException e) {
                throw new StepInternalException(e.getMessage(), e);
            }
        }
        return controllerMethod;
    }

    /**
     * @param args a number of arguments
     * @return an array of classes matching the list of arguments passed in
     */
    Class<?>[] getClasses(final Object[] args) {
        if (args == null) {
            return new Class<?>[0];
        }

        final Class<?>[] classes = new Class<?>[args.length];

        for (int ii = 0; ii < classes.length; ii++) {
            classes[ii] = args[ii].getClass();
        }

        return classes;
    }

    /**
     * returns the cache key to resolve from the cache
     * 
     * @param controllerName the controller name
     * @param methodName the method name
     * @param numArgs the number of arguments affects which method is returned
     * @return the key to the method as expected in the cache.
     */
    String getCacheKey(final String controllerName, final String methodName, final int numArgs) {
        final StringBuilder cacheKeyBuffer = new StringBuilder(controllerName.length() + methodName.length());
        cacheKeyBuffer.append(controllerName);
        cacheKeyBuffer.append(methodName);
        cacheKeyBuffer.append(numArgs);
        return cacheKeyBuffer.toString();
    }

    /**
     * gets the arguments out of the requestURI String
     * 
     * @param requestURI the request URI string
     * @param parameterStart the location at which the parameters start
     * @return a list of arguments
     */
    String[] getArgs(final String requestURI, final int parameterStart) {
        final List<String> arguments = new ArrayList<String>();
        int argStart = parameterStart;
        int nextArgStop = requestURI.indexOf('/', argStart);
        try {
            while (nextArgStop != -1) {
                arguments.add(URLDecoder.decode(requestURI.substring(argStart, nextArgStop), UTF_8_ENCODING));
                argStart = nextArgStop + 1;
                nextArgStop = requestURI.indexOf('/', argStart);
            }
        } catch (final UnsupportedEncodingException e) {
            throw new StepInternalException(e.getMessage(), e);
        }

        // add the last argument
        if (argStart < requestURI.length()) {
            try {
                arguments.add(URLDecoder.decode(requestURI.substring(argStart), UTF_8_ENCODING));
            } catch (final UnsupportedEncodingException e) {
                throw new StepInternalException("Unable to decode last argument", e);
            }
        }
        return arguments.toArray(new String[arguments.size()]);
    }

    /**
     * Retrieves the path from the request
     * 
     * @param req the request
     * @return the concatenated request
     */
    String getPath(final HttpServletRequest req) {
        final String servletPath = req.getServletPath();
        String path = this.contextPath.get(servletPath);

        if (path == null) {
            path = super.getServletContext().getContextPath() + servletPath;
            this.contextPath.put(servletPath, path);
        }
        return path;
    }
}
