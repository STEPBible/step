package com.tyndalehouse.step.core.exceptions;

/**
 * The default exception to be thrown throughout the application. It is of type {@link RuntimeException} so
 * that it does not require explicit catching
 * 
 * @author chrisburrell
 * 
 */
public class TranslatedException extends StepInternalException {
    private static final long serialVersionUID = -1083871793637352613L;
    private final String message;
    private final String[] args;

    /**
     * creates the generic step internal exception to be used on the server.
     * 
     * @param t the cause of the exception
     * @param message the message for the exception
     * @param args the args to the localised message key
     */
    public TranslatedException(final Throwable t, final String message, final String... args) {
        super(t.getMessage(), t);
        this.message = message;
        this.args = args;
    }

    /**
     * creates the generic runtime exception to be used on the server.
     * 
     * @param message the message
     * @param args the args to the localised message key
     */
    public TranslatedException(final String message, final String... args) {
        super(message);
        this.message = message;
        this.args = args;
    }

    /**
     * @return the message
     */
    @Override
    public String getMessage() {
        final StringBuilder sb = new StringBuilder();
        sb.append(this.message);
        for(String a : args) {
            sb.append(a);
            sb.append(", ");
        }
        return this.message;
    }

    /**
     * @return the args
     */
    public Object[] getArgs() {
        return this.args;
    }
}
