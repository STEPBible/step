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
    private String language;

    /**
     * creates a web session
     * 
     * @param id the id of the session
     */
    public WebSessionImpl(final String id, final String language) {
        this.sessionId = id;
        this.language = language;
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

    @Override
    public String getLanguage() {
        return this.language;
    }

    /**
     * @param language the language to set
     */
    public void setLanguage(final String language) {
        this.language = language;
    }
}
