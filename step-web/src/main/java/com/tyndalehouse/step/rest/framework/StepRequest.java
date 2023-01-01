package com.tyndalehouse.step.rest.framework;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * A simple class that hold request information, provides various cache keys
 * <p />
 * .
 * 
 * @author chrisburrell
 */
public class StepRequest {

    /** The Constant LOGGER. */
    private static final Logger LOGGER = LoggerFactory.getLogger(StepRequest.class);

    /** The controller name. */
    private final String controllerName;

    /** The method name. */
    private final String methodName;

    /** The args. */
    private final String[] args;

    /** The external. */
    private final boolean external;

    /** The request uri. */
    private final String requestURI;

    /**
     * Creates a request holder object containing the relevant information about a request. This constructor
     * is used more for testing and could possibly be removed later
     * 
     * @param requestURI the request URI that determines the controller, method name, etc.
     * @param controllerName the controller name
     * @param methodName the method name
     * @param args the arguments that should be passed to the method
     */
    public StepRequest(final String requestURI, final String controllerName, final String methodName,
            final String[] args) {
        this.requestURI = requestURI;
        this.controllerName = controllerName;
        this.methodName = methodName;
        this.external = false;
        this.args = args == null ? new String[] {} : args;
    }

    /**
     * Returns the step request object containing the relevant information about the STEP Request.
     * 
     * @param request the HTTP request
     * @param encoding the encoding with which to decode the request
     */
    public StepRequest(final HttpServletRequest request, final String encoding) {
        this.requestURI = request.getRequestURI();
        this.external = request.getAttribute("external_request") != null;
        LOGGER.debug("Parsing {}", this.requestURI);

        final int requestStart = getPathLength(request) + 1;
        final int endPosOfControllerName = this.requestURI.indexOf('/', requestStart);
        if ( endPosOfControllerName == -1 )
            throw new StepInternalException("Unable to find a controller for " + requestURI);
        final int startOfMethodName = endPosOfControllerName + 1;
        final int endOfMethodNameSlash = this.requestURI.indexOf('/', startOfMethodName);

        // now we can set the controllerName and methodNme
        this.controllerName = this.requestURI.substring(requestStart, endPosOfControllerName);
        if (!" module bible analysis search alternativeTranslations geography image index internationalJson notes searchPage setup setupPage siteMap support timeline user ".contains(" " + this.controllerName + " "))
            throw new StepInternalException("Unable to find a controller for " + requestURI);
        this.methodName = this.requestURI.substring(startOfMethodName,
                endOfMethodNameSlash == -1 ? this.requestURI.length() : endOfMethodNameSlash);
        String methodNameForSearch = " " + this.methodName + " ";
        if ((this.controllerName.equals("module")) && (!" getInfo getQuickInfo getAllModules getAllInstallableModules addDirectoryInstaller ".contains(methodNameForSearch)))
            throw new StepInternalException("Unable to find a controller for " + requestURI);
        if ((this.controllerName.equals("search")) && (!" suggest masterSearch getSubjectVerses getExactForms ".contains(methodNameForSearch)))
            throw new StepInternalException("Unable to find a controller for " + requestURI);
        if ((this.controllerName.equals("bible")) && (!" getModules getBibleText getStrongNumbersAndSubjects getPlainTextPreview getBibleByVerseNumber getFeatures getAllFeatures getBibleBookNames getNextChapter getPreviousChapter convertReferenceForBook expandKeyToChapter getKeyInfo ".contains(methodNameForSearch)))
            throw new StepInternalException("Unable to find a controller for " + requestURI);
        LOGGER.debug("Request parsed as controller: [{}], method [{}]", this.controllerName, this.methodName);
        final int endOfMethodName = startOfMethodName + this.methodName.length();
        this.args = parseArguments(endOfMethodName + 1, encoding);
        // Above line replaced the following two lines.  If this works, remove this line and the next two lines.
//        final String[] calculatedArguments = parseArguments(endOfMethodName + 1, encoding);
//        this.args = calculatedArguments == null ? new String[]{} : calculatedArguments;
    }

    /**
     * gets the arguments out of the requestURI String.
     * 
     * @param parameterStart the location at which the parameters start
     * @param encoding the encoding with which to decode the arguments
     * @return a list of arguments
     */
    private String[] parseArguments(final int parameterStart, final String encoding) {
        final List<String> arguments = new ArrayList<>();
        int argStart = parameterStart;
        int nextArgStop = this.requestURI.indexOf('/', argStart);
        try {
            while (nextArgStop != -1) {
                arguments.add(URLDecoder.decode(this.requestURI.substring(argStart, nextArgStop), encoding));
                argStart = nextArgStop + 1;
                nextArgStop = this.requestURI.indexOf('/', argStart);
            }
        } catch (final UnsupportedEncodingException e) {
            throw new StepInternalException(e.getMessage(), e);
        }

        // add the last argument
        if (argStart < this.requestURI.length()) {
            try {
                arguments.add(URLDecoder.decode(this.requestURI.substring(argStart), encoding));
            } catch (final UnsupportedEncodingException e) {
                throw new StepInternalException("Unable to decode last argument", e);
            }
        }
        return arguments.toArray(new String[arguments.size()]);
    }

    /**
     * Retrieves the path from the request.
     * 
     * @param req the request
     * @return the concatenated request
     */
    private int getPathLength(final HttpServletRequest req) {
        return req.getServletPath().length() + req.getContextPath().length();
    }

    /**
     * returns the cache key to resolve from the cache.
     * 
     * @return the key to the method as expected in the cache.
     */
    public ControllerCacheKey getCacheKey() {
        final String methodKey;

        // generate the shorter key
        final StringBuilder cacheKeyBuffer = new StringBuilder(this.controllerName.length()
                + this.methodName.length());
        cacheKeyBuffer.append(this.controllerName);
        cacheKeyBuffer.append(this.methodName);
        cacheKeyBuffer.append(this.args.length);

        // get the shorter key now
        methodKey = cacheKeyBuffer.toString();
        return new ControllerCacheKey(methodKey, this.requestURI);
    }

    /**
     * Gets the controller name.
     * 
     * @return the controllerName
     */
    public String getControllerName() {
        return this.controllerName;
    }

    /**
     * Gets the method name.
     * 
     * @return the methodName
     */
    public String getMethodName() {
        return this.methodName;
    }

    /**
     * Gets the args.
     * 
     * @return the args
     */
    public String[] getArgs() {
        return this.args;
    }

    /**
     * To string.
     * 
     * @return an message describibg the step request
     */
    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append(this.controllerName);
        sb.append('.');
        sb.append(this.methodName);
        sb.append('(');

        for (int ii = 0; ii < this.args.length; ii++) {
            sb.append(this.args.length);
            sb.append(',');
        }
        return sb.toString();
    }

    /**
     * Checks if request is external.
     * 
     * @return true, if is external
     */
    public boolean isExternal() {
        return this.external;
    }
}
