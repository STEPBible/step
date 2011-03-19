package com.tyndalehouse.step.core.exceptions;

/**
 * The default exception to be thrown when a feature is unavailable because authentication is required.
 * 
 * @author Chris
 * 
 */
public class RequiresLoginException extends ValidationException {
    private static final long serialVersionUID = 2447731047608723592L;

    /**
     * creates the exception
     * 
     * @param message the message for the exception
     * @param t the cause of the exception
     */
    public RequiresLoginException(final String message, final Throwable t) {
        super(message, t);
    }

    /**
     * creates the exception
     * 
     * @param message the message
     */
    public RequiresLoginException(final String message) {
        super(message);
    }
}
