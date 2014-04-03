package com.tyndalehouse.step.rest.controllers;


import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.SupportRequestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.inject.Singleton;

/**
 * @author chrisburrell
 */
@Singleton
public class SupportController {
    private final SupportRequestService supportRequestService;
    private final Provider<ClientSession> clientSession;

    @Inject
    public SupportController(SupportRequestService supportRequestService, final Provider<ClientSession> provider) {
        this.supportRequestService = supportRequestService;
        clientSession = provider;
    }

    /**
     * Creates a support request in JIRA - this is a POST, so we need to get the parameters in manually ourselves
     * rather than rely on reflection
     */
    public void createRequest() {
        final ClientSession session = clientSession.get();
        this.supportRequestService.createRequest(
                session.getParam("summary"),
                session.getParam("description"),
                session.getParam("url"),
                session.getParam("type"),
                session.getParam("email")); 
    }
}
