package com.tyndalehouse.step.rest.framework;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;

import javax.inject.Provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.ClientSession;

/**
 * A set of utilities to deal with requests
 * 
 * @author chrisburrell
 * 
 */
public final class RequestUtils {
    private static final Logger LOGGER = LoggerFactory.getLogger(RequestUtils.class);

    /**
     * preventing instantiation
     */
    private RequestUtils() {
        // no op
    }

    /**
     * validates a session
     * 
     * @param sessionProvider provides the client session
     */
    public static void validateSession(final Provider<ClientSession> sessionProvider) {
        try {
            final String ipAddress = sessionProvider.get().getIpAddress();
            final InetAddress addr = InetAddress.getByName(ipAddress);

            // Check if the address is a valid special local or loop back
            if (addr.isAnyLocalAddress() || addr.isLoopbackAddress()) {
                return;
            }

            // Check if the address is defined on any interface
            try {
                if (NetworkInterface.getByInetAddress(addr) != null) {
                    return;
                }
            } catch (final SocketException e) {
                LOGGER.warn("Socket error: ", e);
            }

            LOGGER.warn("DENYING ACCESS TO IP ADDRESS [{}]", ipAddress);
            throw new StepInternalException("This functionality is not available");
        } catch (final UnknownHostException e) {
            throw new StepInternalException("Failed to initialise ip addresses", e);
        }

    }
}
