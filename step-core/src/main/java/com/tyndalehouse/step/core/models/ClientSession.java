package com.tyndalehouse.step.core.models;

/**
 * At the moment, the "Client Session" object just wraps around an id.
 * 
 * @author Chris
 * 
 */
public interface ClientSession {
    /**
     * an identifier to the client session
     * 
     * @return the session id
     */
    String getSessionId();

    /**
     * return the IP address that the user is currently coming in on
     * 
     * @return the IP address
     */
    String getIpAddress();

    /**
     * @return the preferred language of the user
     */
    String getLanguage();
}
