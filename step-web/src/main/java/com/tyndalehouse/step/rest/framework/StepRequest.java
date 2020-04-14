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
        final int endOfControllerName = this.requestURI.indexOf('/', requestStart);
        final int startOfMethodName = endOfControllerName + 1;
        final int endOfMethodNameSlash = this.requestURI.indexOf('/', startOfMethodName);

        // now we can set the controllerName and methodNme
        this.controllerName = this.requestURI.substring(requestStart, endOfControllerName);
        this.methodName = this.requestURI.substring(startOfMethodName,
                endOfMethodNameSlash == -1 ? this.requestURI.length() : endOfMethodNameSlash);

        LOGGER.debug("Request parsed as controller: [{}], method [{}]", this.controllerName, this.methodName);
        final int endOfMethodName = startOfMethodName + this.methodName.length();
        final String[] calculatedArguments = parseArguments(endOfMethodName + 1, encoding);
        this.args = calculatedArguments == null ? new String[] {} : calculatedArguments;
    }

    /**
     * gets the arguments out of the requestURI String.
     * 
     * @param parameterStart the location at which the parameters start
     * @param encoding the encoding with which to decode the arguments
     * @return a list of arguments
     */
    private String[] parseArguments(final int parameterStart, final String encoding) {
        final List<String> arguments = new ArrayList<String>();
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
