package com.tyndalehouse.step.core.exceptions;

/**
 * The default exception to be thrown throughout the application when a validation exception has occurred. It
 * is of type {@link StepInternal} so that it does not require explicit catching
 * 
 * @author Chris
 * 
 */
public class ValidationException extends StepInternalException {
    private static final long serialVersionUID = -5636677138385910988L;

    /**
     * creates the generic validation exception to be used on the server. These can be handled separately to @see
     * {StepInternalException}
     * 
     * @param message the message for the exception
     * @param t the cause of the exception
     */
    public ValidationException(final String message, final Throwable t) {
        super(message, t);
    }

    /**
     * creates the generic runtime exception to be used on the server
     * 
     * @param message the message
     */
    public ValidationException(final String message) {
        super(message);
    }
}
