package com.tyndalehouse.step.core.exceptions;

/**
 * The default exception to be thrown throughout the application. It is of type {@link RuntimeException} so
 * that it does not require explicit catching
 */
public class LocalisedException extends StepInternalException {
    private static final long serialVersionUID = -1083871793637352613L;
    private final String message;

    /**
     * creates the generic step internal exception to be used on the server.
     * 
     * @param t the cause of the exception
     * @param message the message for the exception
     */
    public LocalisedException(final Throwable t, final String message) {
        super(t.getMessage(), t);
        this.message = message;
    }

    /**
     * creates the generic runtime exception to be used on the server.
     * 
     * @param message the message
     */
    public LocalisedException(final String message) {
        super(message);
        this.message = message;
    }

    /**
     * @return the message
     */
    @Override
    public String getMessage() {
        return this.message;
    }
}
