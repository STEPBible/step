package com.tyndalehouse.step.rest.framework;

import com.tyndalehouse.step.models.ClientOperation;

import java.io.Serializable;

/**
 * A client error, contains a message and an optional redirection operation
 */
public class ClientHandledIssue implements Serializable {
    private static final long serialVersionUID = -4354861806290828883L;
    private final String errorMessage;
    private final ClientOperation operation;

    /**
     * @param errorMessage the error message to be displayed to the user
     */
    public ClientHandledIssue(final String errorMessage) {
        this(errorMessage, null);
    }

    /**
     * @param errorMessage the error message to be displayed to the user
     * @param operation the operation the client (browser) should perform
     */
    public ClientHandledIssue(final String errorMessage, final ClientOperation operation) {
        this.errorMessage = errorMessage;
        this.operation = operation;
    }

    /**
     * @return the errorMessage
     */
    public String getErrorMessage() {
        return this.errorMessage;
    }

    /**
     * @return the operation
     */
    public ClientOperation getOperation() {
        return this.operation;
    }
}
