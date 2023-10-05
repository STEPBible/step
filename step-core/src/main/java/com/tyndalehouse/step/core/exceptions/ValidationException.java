package com.tyndalehouse.step.core.exceptions;

/**
 * The default exception to be thrown throughout the application when a validation exception has occurred. It
 * is of type {@link StepInternal} so that it does not require explicit catching
 */
public class ValidationException extends StepInternalException {
    private static final long serialVersionUID = -5636677138385910988L;
    private final UserExceptionType exceptionType;

    /**
     * creates the generic runtime exception to be used on the server
     * 
     * @param exceptionMessage the exception message
     * @param exceptionType the type of exception
     */
    public ValidationException(final String exceptionMessage, final UserExceptionType exceptionType) {
        super(exceptionMessage);
        this.exceptionType = exceptionType;
    }

    /**
     * @return the exceptionType
     */
    public UserExceptionType getExceptionType() {
        return this.exceptionType;
    }

}
