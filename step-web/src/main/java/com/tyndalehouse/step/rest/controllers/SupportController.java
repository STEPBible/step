package com.tyndalehouse.step.rest.controllers;


import com.tyndalehouse.step.core.service.SupportRequestService;

import javax.inject.Inject;
import javax.inject.Singleton;

/**
 * @author chrisburrell
 */
@Singleton
public class SupportController {
    private final SupportRequestService supportRequestService;

    @Inject
    public SupportController(SupportRequestService supportRequestService) {
        this.supportRequestService = supportRequestService;
    }

    /**
     * Creates a support request in JIRA
     */
    public void createRequest(final String summary, final String description, final String url, final String name, final String email) {
       this.supportRequestService.createRequest(summary, description, url, name, email); 
    }
}
