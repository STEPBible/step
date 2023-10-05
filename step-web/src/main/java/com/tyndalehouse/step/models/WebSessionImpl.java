package com.tyndalehouse.step.models;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.ClientSession;
import org.apache.commons.codec.binary.Base64;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;

import static org.apache.commons.codec.binary.Base64.decodeBase64;

/**
 * A web session which wraps around the jsession id...
 */
public class WebSessionImpl implements ClientSession {
    private String sessionId;
    private String ipAddress;
    private String language;
    private Locale locale;
    private HttpServletRequest request;

    /**
     * creates a web session
     *
     * @param id the id of the session
     * @param language the ISO 3-character long language name
     * @param ipAddress the user's IP address
     * @param locale the user's locale
     * @param request
     */
    public WebSessionImpl(final String id, final String language, final String ipAddress, final Locale locale, final HttpServletRequest request) {
        this.sessionId = id;
        this.language = language;
        this.ipAddress = ipAddress;
        this.locale = locale;
        this.request = request;
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

    @Override
    public Locale getLocale() {
        return this.locale;
    }

    @Override
    public String getParam(String name) {
        return this.request.getParameter(name);
    }

    @Override
    public InputStream getAttachment(final String filePart) {
        try {
            final Part part = this.request.getPart(filePart);
            InputStream received = part.getInputStream();
            // If the attachment is base64 encoded, we need to decode it
            int size = received.available();
            byte[] encoded = new byte[size];
            size = received.read(encoded);
            if(Base64.isArrayByteBase64(encoded)) {
                byte[] decoded = decodeBase64(encoded);
                return (new ByteArrayInputStream(decoded));
            }
            else
            {
                return received;
            }
        } catch (ServletException e) {
            throw new StepInternalException("Unable to obtain part", e);
        } catch (IOException e) {
            throw new StepInternalException("Unable to obtain part", e);
        }
    }

    /**
     * @param locale the locale to set
     */
    public void setLocale(final Locale locale) {
        this.locale = locale;
    }
}
