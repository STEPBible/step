package com.tyndalehouse.step.core.exceptions;

/**
 * The default exception to be thrown throughout the application. It is of type {@link RuntimeException} so
 * that it does not require explicit catching
 */
public class StepInternalException extends RuntimeException {
    private static final long serialVersionUID = -5636677138385910988L;

    /**
     * creates the generic step internal exception to be used on the server
     * 
     * @param message the message for the exception
     * @param t the cause of the exception
     */
    public StepInternalException(final String message, final Throwable t) {
        super(message, t);
    }

    /**
     * creates the generic runtime exception to be used on the server
     * 
     * @param message the message
     */
    public StepInternalException(final String message) {
        super(message);
    }
}
