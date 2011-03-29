package com.tyndalehouse.step.rest.framework;

/**
 * A simple class that hold request information, provides various cache keys
 * <p />
 * TODO: move parse method from FrontController to here.
 * 
 * @author Chris
 * 
 */
public class StepRequest {
    private final String controllerName;
    private final String methodName;
    private final String[] args;

    private final String requestURI;

    /**
     * Creates a request holder object containing the relevant information about a request
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
        this.args = args == null ? new String[] {} : args;
    }

    /**
     * returns the cache key to resolve from the cache
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
     * @return the controllerName
     */
    public String getControllerName() {
        return this.controllerName;
    }

    /**
     * @return the methodName
     */
    public String getMethodName() {
        return this.methodName;
    }

    /**
     * @return the args
     */
    public String[] getArgs() {
        return this.args;
    }

    /**
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
}
