package com.tyndalehouse.step.rest.framework;

import java.util.HashMap;
import java.util.Map;

import com.google.inject.Singleton;
import com.tyndalehouse.step.core.exceptions.RequiresLoginException;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.models.ClientOperation;

/**
 * Resolves errors based on the type of exception thrown
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class ClientErrorResolver {
    private final Map<Class<? extends StepInternalException>, ClientOperation> clientOperations = new HashMap<Class<? extends StepInternalException>, ClientOperation>();

    /**
     * sets up the redirections
     */
    public ClientErrorResolver() {
        this.clientOperations.put(RequiresLoginException.class, ClientOperation.SHOW_LOGIN_POPUP);
    }

    /**
     * returns from the internal map what action should be performed if any
     * 
     * @param clazz a client operation
     * @return the client operation corresponding to the exception
     */
    public ClientOperation resolve(final Class<? extends Throwable> clazz) {
        return this.clientOperations.get(clazz);
    }
}
