package com.tyndalehouse.step.core.exceptions;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.LOGIN_REQUIRED;

/**
 * The default exception to be thrown when a feature is unavailable because authentication is required.
 * 
 * @author chrisburrell
 * 
 */
public class RequiresLoginException extends ValidationException {
    private static final long serialVersionUID = 2447731047608723592L;

    /**
     * creates the exception
     * 
     * @param message the message
     */
    public RequiresLoginException(final String message) {
        super(message, LOGIN_REQUIRED);
    }
}
