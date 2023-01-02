package com.tyndalehouse.step.core.exceptions;

/**
 * Contains a list of errors and their corresponding error messages, a step towards localisation
 * 
 * @author chrisburrell
 * 
 */
public enum UserExceptionType {
    /**
     * Some general error while receiving a request at the service layer
     */
    SERVICE_VALIDATION_ERROR("internal_error"),
    /** Functionality not available unless the user logs in */
    LOGIN_REQUIRED("error_login"),
    /** the user incorrectly provided a field */
    USER_VALIDATION_ERROR("error_validation"),
    /** the user did not provide a field */
    USER_MISSING_FIELD("error_missing_field"),
    /** App is not providing a field that is expected */
    APP_MISSING_FIELD("internal_error"),
    /** Some general error at the controller layer */
    CONTROLLER_INITIALISATION_ERROR("internal_error");

    private final String langKey;

    /**
     * Instantiates a new user exception type.
     * 
     * @param langKey the lang key
     */
    UserExceptionType(final String langKey) {
        this.langKey = langKey;
    }

    /**
     * @return the langKey
     */
    public String getLangKey() {
        return this.langKey;
    }
}
