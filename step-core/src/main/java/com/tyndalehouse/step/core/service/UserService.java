package com.tyndalehouse.step.core.service;

/**
 * Checks the identify of a user
 * 
 * @author chrisburrell
 * 
 */
public interface UserService {
    /**
     * Given a particular email, we check it is present
     * 
     * @param email the email addres
     * @param name TODO
     * @return true if allowed to enter into the application
     */
    boolean checkUserIdentity(String email, String name);

    /**
     * @param enabled the enabled to set, true to enable
     */
    void setEnabled(boolean enabled);

    /**
     * @param autoRegister the autoRegister to set
     */
    void setAutoRegister(boolean autoRegister);

    /**
     * refreshes the user list
     */
    void refresh();
}
