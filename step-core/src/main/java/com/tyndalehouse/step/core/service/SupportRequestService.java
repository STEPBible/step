package com.tyndalehouse.step.core.service;

public interface SupportRequestService {
    /**
     * @param summary     summary of issue
     * @param description description of issue
     * @param url         URL to the page that was being viewed
     * @param email       the email of the user
     * @param user        the user's name
     */
    void createRequest(String summary, String description, String url,
                       String user, String email);
}
