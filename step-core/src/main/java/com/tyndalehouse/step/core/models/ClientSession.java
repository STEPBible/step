package com.tyndalehouse.step.core.models;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;

/**
 * At the moment, the "Client Session" object just wraps around an id.
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

    /**
     * @return the full Locale object
     */
    Locale getLocale();

    /**
     * @param name the name of the parameter
     * @return the servlet request parameter value
     */
    String getParam(String name);

    /**
     * Gets a multi-part attachment
     * @param filePartName the name of the file part from which we can get the file out
     * @return an attachment
     */
    InputStream getAttachment(String filePartName) throws IOException;
}
