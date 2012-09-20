package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Indicates that a query should be aborted and no results returned...
 * 
 * @author chrisburrell
 * 
 */
public class AbortQueryException extends StepInternalException {
    private static final long serialVersionUID = 8482324997663864434L;

    /**
     * @param message message as to why we are aborting
     */
    public AbortQueryException(final String message) {
        super(message);
    }

}
