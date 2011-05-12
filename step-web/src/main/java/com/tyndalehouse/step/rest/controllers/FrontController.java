package com.tyndalehouse.step.rest.controllers;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.avaje.ebean.text.json.JsonContext;
import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.rest.framework.Cacheable;
import com.tyndalehouse.step.rest.framework.ClientErrorResolver;
import com.tyndalehouse.step.rest.framework.ClientHandledIssue;
import com.tyndalehouse.step.rest.framework.ResponseCache;
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
    private static final Logger LOGGER = LoggerFactory.getLogger(FrontController.class);
    private static final String ENTITIES_PACKAGE = "com.tyndalehouse.step.core.data.entities";
    private static final String AVAJE_PACKAGE = "com.avaje";
    private static final String UTF_8_ENCODING = "UTF-8";
    private static final char PACKAGE_SEPARATOR = '.';
    private static final long serialVersionUID = 7898656504631346047L;
    private static final String CONTROLLER_SUFFIX = "Controller";
    private final transient Injector guiceInjector;
    // TODO: but also check thread safety and whether we should share this object
    private final transient ObjectMapper jsonMapper = new ObjectMapper();
    // TODO: check if this is thread safe, and if so, then make private field
    private final transient JsonContext ebeanJson;

    // TODO: investigate EH cache here
    private final Map<String, Method> methodNames = new HashMap<String, Method>();
    private final Map<String, Object> controllers = new HashMap<String, Object>();
    private final boolean isCacheEnabled;
    private final transient ClientErrorResolver errorResolver;
    private final transient ResponseCache responseCache;

    /**
     * creates the front controller which will dispatch all the requests
     * <p />
     * 
     * @param guiceInjector the injector used to call the relevant controllers
     * @param isCacheEnabled indicates whether responses should be cached for fast retrieval
     * @param ebean the db access/persisitence object
     * @param errorResolver the error resolver is the object that helps us translate errors for the client
     * @param responseCache cache in which are put any number of responses to speed up processing
     */
    @Inject
    public FrontController(final Injector guiceInjector,
            @Named("frontcontroller.cache.enabled") final Boolean isCacheEnabled, final EbeanServer ebean,
            final ClientErrorResolver errorResolver, final ResponseCache responseCache) {
        this.guiceInjector = guiceInjector;
        this.responseCache = responseCache;
        this.ebeanJson = ebean.createJsonContext();

        this.errorResolver = errorResolver;
        this.isCacheEnabled = Boolean.TRUE.equals(isCacheEnabled);
    }

    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response) {
        // first of all check cache against URI: (only cached responses go here)
        byte[] jsonEncoded = this.responseCache.get(request.getRequestURI());

        StepRequest sr = null;
        try {
            // cache miss?
            if (jsonEncoded == null || jsonEncoded.length == 0) {
                sr = new StepRequest(request, UTF_8_ENCODING);
                if (jsonEncoded == null) {
                    LOGGER.debug("The cache was missed so invoking method now...");
                    jsonEncoded = invokeMethod(sr);
                }
            } else {
                LOGGER.debug("Returning answer from cache [{}]", request.getRequestURI());
            }

            setupHeaders(response, jsonEncoded.length);
            response.getOutputStream().write(jsonEncoded);
            // CHECKSTYLE:OFF We allow catching errors here, since we are at the top of the structure
        } catch (final Exception e) {
            // CHECKSTYLE:ON
            handleError(response, e, sr);
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
        final Method controllerMethod = getControllerMethod(sr.getMethodName(), controllerInstance, sr
                .getArgs(), sr.getCacheKey().getMethodKey());

        // invoke the three together
        Object returnVal;
        try {
            returnVal = controllerMethod.invoke(controllerInstance, (Object[]) sr.getArgs());

            // CHECKSTYLE:OFF
        } catch (final Exception e) {
            returnVal = convertExceptionToJson(e);
        }
        final byte[] encodedJsonResponse = getEncodedJsonResponse(returnVal);
        cache(encodedJsonResponse, sr, controllerMethod);
        return encodedJsonResponse;
        // CHECKSTYLE:ON
    }

    /**
     * We attempt here to rethrow the exception that caused the invocation target exception, so that we can
     * handle it nicely for the user
     * 
     * @param e the wrapped exception that happened during the reflective call
     * @return a client handled issue which wraps the exception that was raised
     */
    private ClientHandledIssue convertExceptionToJson(final Exception e) {
        // first we check to see if it's a step exception, or an illegal argument exception

        final Throwable cause = e.getCause();
        if (cause instanceof StepInternalException) {
            LOGGER.trace(e.getMessage(), e);
            return new ClientHandledIssue(cause.getMessage(), this.errorResolver.resolve(cause.getClass()));
        } else if (cause instanceof IllegalArgumentException) {
            // a validation exception occurred
            LOGGER.warn(e.getMessage(), e);
            return new ClientHandledIssue(cause.getMessage());
        }

        LOGGER.error(e.getMessage(), e);
        return new ClientHandledIssue("An internal error has occurred");
    }

    /**
     * Returns a json response that is encoded
     * 
     * @param responseValue the value that should be encoded
     * @return the encoded form of the JSON response
     */
    byte[] getEncodedJsonResponse(final Object responseValue) {
        LOGGER.debug("Encoding the following response [{}]", responseValue);

        try {
            String response;
            // we have normal objects and avaje ebean objects which have been intercepted
            // therefore we can't just use simple jackson mapper
            if (responseValue == null) {
                return new byte[0];
            } else {
                if (isPojo(responseValue)) {
                    response = this.jsonMapper.writeValueAsString(responseValue);
                } else {
                    response = this.ebeanJson.toJsonString(responseValue);
                }
            }

            return response.getBytes(UTF_8_ENCODING);
        } catch (final JsonGenerationException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final JsonMappingException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * inspects the response value to determine the correct serialiser
     * 
     * @param responseValue the response value
     * @return true if normal serialisation should be used
     */
    private boolean isPojo(final Object responseValue) {
        if (responseValue instanceof java.util.Collection<?>) {
            // inspect what the collection contains...
            final Collection<?> c = (Collection<?>) responseValue;
            if (((java.util.Collection<?>) responseValue).size() != 0) {
                final Object o = c.iterator().next();
                return isPojo(o);
            }
        }

        final String responsePackage = responseValue.getClass().getPackage().getName();
        return !responsePackage.startsWith(ENTITIES_PACKAGE)
                && !responseValue.getClass().getPackage().getName().startsWith(AVAJE_PACKAGE);

    }

    /**
     * caches the results for future use
     * 
     * @param jsonEncoded json encoding of the response
     * @param sr the processed request URI containg the the cache key
     * @param controllerMethod the method so that we can inspect whether an annotation is present
     */
    void cache(final byte[] jsonEncoded, final StepRequest sr, final Method controllerMethod) {
        if (this.isCacheEnabled && controllerMethod.isAnnotationPresent(Cacheable.class)) {
            this.responseCache.put(sr.getCacheKey().getResultsKey(), jsonEncoded);
        }
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
    void handleError(final HttpServletResponse response, final Throwable e, final StepRequest sr) {
        String requestId = null;
        LOGGER.debug("Handling error...");
        try {
            requestId = sr == null ? "Failed to parse request?" : sr.getCacheKey().getResultsKey();
            if (e != null) {
                final byte[] errorMessage = this.getEncodedJsonResponse(e);
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
}
