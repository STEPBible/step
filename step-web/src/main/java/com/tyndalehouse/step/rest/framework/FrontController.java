package com.tyndalehouse.step.rest.framework;

import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.AppManagerService;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Provider;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import static java.lang.String.format;

/**
 * The FrontController acts like a minimal REST server. The paths are resolved as follows:
 * <p/>
 * /step-web/rest/controllerName/methodName/arg1/arg2/arg3
 *
 * @author chrisburrell
 */
@MultipartConfig
@Singleton
public class FrontController extends AbstractAjaxController {
    public static final String UTF_8_ENCODING = "UTF-8";
    private static final String EXTERNAL_CONTROLLER_SUB_PACKAGE = "external";
    private static final Logger LOGGER = LoggerFactory.getLogger(FrontController.class);
    private static final String CONTROLLER_PACKAGE = "com.tyndalehouse.step.rest.controllers";
    private static final char PACKAGE_SEPARATOR = '.';
    private static final long serialVersionUID = 7898656504631346047L;
    private static final String CONTROLLER_SUFFIX = "Controller";
    private final transient Injector guiceInjector;

    private final transient Map<String, Method> methodNames = new HashMap<String, Method>();
    private final transient Map<String, Object> controllers = new HashMap<String, Object>();

    /**
     * creates the front controller which will dispatch all the requests
     * <p/>
     *
     * @param guiceInjector         the injector used to call the relevant controllers
     * @param errorResolver         the error resolver is the object that helps us translate errors for the client
     * @param clientSessionProvider the client session provider
     */
    @Inject
    public FrontController(final Injector guiceInjector,
                           final AppManagerService appManagerService,
                           final ClientErrorResolver errorResolver,
                           final Provider<ClientSession> clientSessionProvider,
                           final Provider<ObjectMapper> objectMapperProvider) {
        super(appManagerService, clientSessionProvider, errorResolver, objectMapperProvider);
        this.guiceInjector = guiceInjector;
    }

    /**
     * Invokes the method on the controller instance and returns JSON-ed results
     *
     * @return byte array representation of the return value
     */
    @Override
    protected Object invokeMethod(HttpServletRequest servletRequest) throws Exception {
        StepRequest sr = new StepRequest(servletRequest, UTF_8_ENCODING);
        return invokeMethodWithStepRequest(sr);
    }

    /**
     * @param sr allows to pass a StepRequest instead of the normal HttpServletRequest
     * @return the object as a result of the call
     * @throws IllegalAccessException
     * @throws InvocationTargetException
     */
    Object invokeMethodWithStepRequest(final StepRequest sr) throws IllegalAccessException, InvocationTargetException {
        LOGGER.debug("The cache was missed so invoking method now...");

        // controller instance on which to call a method
        final Object controllerInstance = getController(sr.getControllerName(), sr.isExternal());

        // resolve method
        final Method controllerMethod = getControllerMethod(sr.getMethodName(), controllerInstance,
                sr.getArgs(), sr.getCacheKey().getMethodKey());

        // invoke the three together
        return controllerMethod.invoke(controllerInstance, (Object[]) sr.getArgs());
    }


    /**
     * Retrieves a controller, either from the cache, or from Guice.
     *
     * @param controllerName the name of the controller (used as the key for the cache)
     * @param isExternal     indicates whether the request should be found in the external controllers
     * @return the controller object
     */
    Object getController(final String controllerName, final boolean isExternal) {
        Object controllerInstance = this.controllers.get(controllerName);

        // if retrieving yields null, get controller from Guice, and put in cache
        if (controllerInstance == null) {
            // make up the full class name
            final String packageName = CONTROLLER_PACKAGE;
            final StringBuilder className = new StringBuilder(packageName.length() + controllerName.length()
                    + CONTROLLER_SUFFIX.length() + 1);

            className.append(packageName);
            className.append(PACKAGE_SEPARATOR);
            if (isExternal) {
                className.append(EXTERNAL_CONTROLLER_SUB_PACKAGE);
                className.append(PACKAGE_SEPARATOR);
            }

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
     * @param methodName         the method name
     * @param controllerInstance the instance of the controller
     * @param args               the list of arguments, required to resolve the correct method if they have arguments
     * @param cacheKey           the key to retrieve in the cache
     * @return the method to be invoked
     */
    Method getControllerMethod(final String methodName, final Object controllerInstance, final Object[] args,
                               final String cacheKey) {
        final Class<?> controllerClass = controllerInstance.getClass();

        // retrieve method from cache, or put in cache if not there
        Method controllerMethod = this.methodNames.get(cacheKey);
        if (controllerMethod == null) {
            // resolve method

            try {
                final Class<?>[] classes = getClasses(args);
                controllerMethod = controllerClass.getMethod(methodName, classes);
                // put method in cache
                this.methodNames.put(cacheKey, controllerMethod);
            } catch (final NoSuchMethodException e) {
                throw new StepInternalException("Unable to find matching method for " + methodName, e);
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
