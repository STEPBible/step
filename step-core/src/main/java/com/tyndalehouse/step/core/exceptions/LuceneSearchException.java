package com.tyndalehouse.step.core.exceptions;

/**
 * @author chrisburrell
 */
public class LuceneSearchException extends StepInternalException {
    /**
     * @see {@link com.tyndalehouse.step.core.exceptions.StepInternalException }
     * @param message the message
     * @param t the cause of the exception
     */
    public LuceneSearchException(final String message, final Throwable t) {
        super(message, t);
    }
}
