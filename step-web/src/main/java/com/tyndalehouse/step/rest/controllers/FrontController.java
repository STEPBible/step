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
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.rest.framework.ControllerCacheKey;
import com.tyndalehouse.step.rest.framework.StepRequest;

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
    // TODO EH cache here too?
    private final Map<String, String> contextPath = new HashMap<String, String>();
    private final Map<String, byte[]> resultsCache = new HashMap<String, byte[]>();
    private final transient Injector guiceInjector;
    // TODO but also check threadsafety and whether we should share this object
    private final transient ObjectMapper jsonMapper = new ObjectMapper();

    // TODO investigate EH cache here
    private final Map<String, Method> methodNames = new HashMap<String, Method>();
    private final Map<String, Object> controllers = new HashMap<String, Object>();
    private final boolean isCacheEnabled;

    /**
     * creates the front controller which will dispatch all the requests
     * 
     * @param guiceInjector the injector used to call the relevant controllers
     * @param isCacheEnabled indicates whether responses should be cached for fast retrieval
     * 
     */
    @Inject
    public FrontController(final Injector guiceInjector, @Named("cache.enabled") final Boolean isCacheEnabled) {
        this.guiceInjector = guiceInjector;
        this.isCacheEnabled = Boolean.TRUE.equals(isCacheEnabled);
    }

    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response) {
        StepRequest sr = null;
        try {
            sr = parseRequest(request);
            byte[] jsonEncoded = null;

            // in here we want to retrieve from the cache.
            final ControllerCacheKey cacheKey = sr.getCacheKey();

            // check results cache here -- TODO - use servlet caching instead?
            if (this.isCacheEnabled) {
                LOGGER.debug("Checking cache...");
                jsonEncoded = this.resultsCache.get(cacheKey.getResultsKey());
            }

            // cache miss?
            if (jsonEncoded == null) {
                LOGGER.debug("The cache was missed so invoking method now...");
                jsonEncoded = invokeMethod(sr);
            }
            setupHeaders(response, jsonEncoded.length);
            response.getOutputStream().write(jsonEncoded);
            cache(jsonEncoded, sr.getControllerName(), sr.getMethodName(), sr.getArgs());
            // CHECKSTYLE:OFF We allow catching errors here, since we are at the top of the structure
        } catch (final Exception e) {
            // CHECKSTYLE:ON
            doError(response, e, sr);
        }
    }

    /**
     * Invokes the method on the controller instance and returns JSON-ed results
     * 
     * @param sr the STEP Request containing all pertinent information
     * @return byte array representation of the return value
     */
    byte[] invokeMethod(final StepRequest sr) {

        // controller instance on which to call a method
        final Object controllerInstance = getController(sr.getControllerName());

        // resolve method
        final Method controllerMethod = getControllerMethod(sr.getMethodName(), controllerInstance,
                sr.getArgs(), sr.getCacheKey().getMethodKey());

        // invoke the three together
        try {
            final Object returnVal = controllerMethod.invoke(controllerInstance, (Object[]) sr.getArgs());
            return getEncodedJsonResponse(returnVal);
        } catch (final IllegalAccessException e) {
            throw new StepInternalException(sr.toString(), e);
        } catch (final InvocationTargetException e) {
            throw new StepInternalException(sr.toString(), e);
        }

        // TODO remove dead code once I have proven this doesn't get used
        // catch (final NoSuchMethodError e) {
        // throw new StepInternalException(sr.toString(), e);
        // }
    }

    /**
     * Returns a json response that is encoded
     * 
     * @param responseValue the value that should be encoded
     * @return the encoded form of the JSON response
     */
    byte[] getEncodedJsonResponse(final Object responseValue) {
        try {
            return this.jsonMapper.writeValueAsString(responseValue).getBytes(UTF_8_ENCODING);
        } catch (final JsonGenerationException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final JsonMappingException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * Returns the step request object containing the relevant information about the STEP Request
     * 
     * @param request the HTTP request
     * @return the StepRequest encapsulating key data
     */
    StepRequest parseRequest(final HttpServletRequest request) {
        final String requestURI = request.getRequestURI();

        LOGGER.debug("Parsing {}", requestURI);

        final int requestStart = getPath(request).length() + 1;
        final int endOfControllerName = requestURI.indexOf('/', requestStart);
        final int startOfMethodName = endOfControllerName + 1;
        final String controllerName = requestURI.substring(requestStart, endOfControllerName);
        final String methodName = requestURI.substring(startOfMethodName,
                requestURI.indexOf('/', startOfMethodName));
        final int endOfMethodName = startOfMethodName + methodName.length();

        LOGGER.debug("Request parsed as controller: [{}], method [{}]", controllerName, methodName);
        return new StepRequest(controllerName, methodName, getArgs(requestURI, endOfMethodName + 1));
    }

    /**
     * TODO caches the results for future use
     * 
     * @param jsonEncoded json encoding of the response
     * @param controllerName the name of the controller that was ino
     * @param methodName the method name that was called
     * @param args the arguments that were passed
     */
    void cache(final byte[] jsonEncoded, final String controllerName, final String methodName,
            final Object[] args) {
        // TODO using EH Cache
    }

    /**
     * sets up the headers and the length of the message
     * 
     * @param response the response
     * @param length the length of the message
     */
    void setupHeaders(final HttpServletResponse response, final int length) {
        // we ensure that headers are set up appropriately
        response.addDateHeader("Date", System.currentTimeMillis());
        response.setCharacterEncoding(UTF_8_ENCODING);
        response.setContentType("application/json");
        response.setContentLength(length);
    }

    /**
     * deals with an error whilst executing the request
     * 
     * @param response the response
     * 
     * @param e the exception
     * @param sr the step request
     */
    void doError(final HttpServletResponse response, final Throwable e, final StepRequest sr) {
        String requestId = null;
        try {
            requestId = sr == null ? "Failed to parse request?" : sr.getCacheKey().getResultsKey();
            if (e != null) {
                final byte[] errorMessage = this.getEncodedJsonResponse(e.getMessage());
                response.getOutputStream().write(errorMessage);
                setupHeaders(response, errorMessage.length);

                LOGGER.error("An internal error has occurred for [{}]", requestId, e);
            }
            // CHECKSTYLE:OFF We allow catching errors here, since we are at the top of the structure
        } catch (final Exception unableToSendError) {
            // CHECKSTYLE:ON
            LOGGER.error("Unable to output error for request" + requestId, unableToSendError);
            LOGGER.error("Due to original Throwable", e);
        }
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
     * @param cacheKey the key to retrieve in the cache
     * @return the method to be invoked
     */
    Method getControllerMethod(final String methodName, final Object controllerInstance, final Object[] args,
            final String cacheKey) {
        final Class<? extends Object> controllerClass = controllerInstance.getClass();

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
