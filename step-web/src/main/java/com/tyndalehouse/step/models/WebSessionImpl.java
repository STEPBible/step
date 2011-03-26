package com.tyndalehouse.step.models;

import com.tyndalehouse.step.core.models.ClientSession;

/**
 * A web session which wraps around the jsession id...
 * 
 * @author Chris
 * 
 */
public class WebSessionImpl implements ClientSession {
    private String sessionId;
    private String ipAddress;

    /**
     * creates a web session
     * 
     * @param id the id of the session
     */
    public WebSessionImpl(final String id) {
        this.sessionId = id;
    }

    /**
     * @return the session
     */
    @Override
    public String getSessionId() {
        return this.sessionId;
    }

    /**
     * @param sessionId the session to set
     */
    public void setSessionId(final String sessionId) {
        this.sessionId = sessionId;
    }

    /**
     * @return the ipAddress
     */
    @Override
    public String getIpAddress() {
        return this.ipAddress;
    }

    /**
     * @param ipAddress the ipAddress to set
     */
    public void setIpAddress(final String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
