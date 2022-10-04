package com.tyndalehouse.step.rest.framework;

import com.tyndalehouse.step.core.exceptions.LocalisedException;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.exceptions.ValidationException;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.AppManagerService;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Provider;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Locale;
import java.util.ResourceBundle;

import static java.lang.String.format;

/**
 * @author chrisburrell
 */
@MultipartConfig
public abstract class AbstractAjaxController extends HttpServlet {
    private static final Logger LOGGER = LoggerFactory.getLogger(AbstractAjaxController.class);
    private final ObjectMapper jsonMapper;
    private final transient ClientErrorResolver errorResolver;
    private final AppManagerService appManagerService;
    private final Provider<ClientSession> clientSessionProvider;

    public AbstractAjaxController(final AppManagerService appManagerService,
                                  final Provider<ClientSession> clientSessionProvider,
                                  final ClientErrorResolver errorResolver,
                                  final Provider<ObjectMapper> objectMapperProvider) {
        this.appManagerService = appManagerService;
        this.clientSessionProvider = clientSessionProvider;
        this.errorResolver = errorResolver;
        this.jsonMapper = objectMapperProvider.get();
    }

    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response) {
        // CHECKSTYLE:ON
        try {
            Object returnVal = executeRestMethod(request);
            byte[] jsonEncoded = getEncodedJsonResponse(returnVal);
            setupHeaders(response, jsonEncoded.length);
            response.getOutputStream().write(jsonEncoded);
            // CHECKSTYLE:OFF We allow catching errors here, since we are at the top of the structure
        } catch (final Exception e) {
            // CHECKSTYLE:ON
            handleError(response, e, request);
        }
    }

    @Override
    protected void doPost(final HttpServletRequest request, final HttpServletResponse response) {
        this.doGet(request, response);
    }

    private Object executeRestMethod(final HttpServletRequest request) {
        Object returnVal;
        try {
            returnVal = invokeMethod(request);

            // CHECKSTYLE:OFF
        } catch (final Exception e) {
            LOGGER.warn(e.getMessage());
			// if ((e.getMessage() != null) && (e.getMessage().indexOf("Unable to find a controller for") == -1)) // This line might cause another exception so it is commented out.  PT 9/22/2022
			//	LOGGER.trace(e.getMessage(), e);
            returnVal = convertExceptionToJson(e);
        }
        return returnVal;
    }

    protected abstract Object invokeMethod(HttpServletRequest request) throws Exception;

    /**
     * We attempt here to rethrow the exception that caused the invocation target exception, so that we can handle it
     * nicely for the user
     *
     * @param e the wrapped exception that happened during the reflective call
     * @return a client handled issue which wraps the exception that was raised
     */
    protected ClientHandledIssue convertExceptionToJson(final Exception e) {
        // first we check to see if it's a step exception, or an illegal argument exception

        final Throwable cause = e.getCause() == null ? e : e.getCause();
        return new ClientHandledIssue(getExceptionMessageAndLog(cause), this.errorResolver.resolve(cause
                .getClass()));
    }

    /**
     * Returns a json response that is encoded
     *
     * @param responseValue the value that should be encoded
     * @return the encoded form of the JSON response
     */
    byte[] getEncodedJsonResponse(final Object responseValue) {
        /* LOGGER.debug("Encoding the following response [{}]", responseValue); */

        try {
            String response;
            if (responseValue == null) {
                return new byte[0];
            } else {
                response = this.jsonMapper.writeValueAsString(responseValue);
            }

            return response.getBytes(FrontController.UTF_8_ENCODING);
        } catch (final JsonGenerationException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final JsonMappingException e) {
            throw new StepInternalException(e.getMessage(), e);
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        }
    }

    /**
     * sets up the headers and the length of the message
     *
     * @param response the response
     * @param length   the length of the message
     */
    void setupHeaders(final HttpServletResponse response, final int length) {
        // we ensure that headers are set up appropriately
        response.addDateHeader("Date", System.currentTimeMillis());
        response.setCharacterEncoding(FrontController.UTF_8_ENCODING);
        response.setContentType("application/json");
        response.setContentLength(length);
        String lang = this.clientSessionProvider.get().getLocale().getLanguage();
        // For Chinese there is zh and zh_TW.  The getLanguage() will return zh even if it is zh_TW
        if (lang.equals("zh")) lang = this.clientSessionProvider.get().getLocale().toString();
        response.setHeader("step-language", lang);
        response.setHeader("step-version", this.appManagerService.getAppVersion());
    }

    /**
     * deals with an error whilst executing the request
     *
     * @param response the response
     * @param e        the exception
     */
    void handleError(final HttpServletResponse response, final Throwable e, final HttpServletRequest request) {
        LOGGER.debug("Handling error...");
        try {
            if (e != null) {
                final ClientHandledIssue issue = new ClientHandledIssue(getExceptionMessageAndLog(e));
                final byte[] errorMessage = this.getEncodedJsonResponse(issue);
                response.getOutputStream().write(errorMessage);
                setupHeaders(response, errorMessage.length);
            }
            // CHECKSTYLE:OFF We allow catching errors here, since we are at the top of the structure
        } catch (final Exception unableToSendError) {
            // CHECKSTYLE:ON
            LOGGER.error("Unable to output error for request" + request.getRequestURI(), unableToSendError);
            LOGGER.error("Due to original Throwable", e);
        }
    }

    /**
     * Gets the exception message.
     *
     * @param e the e
     * @return the exception message
     */
    private String getExceptionMessageAndLog(final Throwable e) {
        //LOGGER.debug("Debugging exception: ", e);

        final Locale locale = this.clientSessionProvider.get().getLocale();
        final ResourceBundle bundle = ResourceBundle.getBundle("ErrorBundle", locale);

        if (!(e instanceof StepInternalException)) {
            return returnInternalError(e, bundle);
        }

        // else we're looking at a STEP caught exception
        if (e instanceof LocalisedException) {
            return e.getMessage();
        }

        if (e instanceof TranslatedException) {
            final TranslatedException translatedException = (TranslatedException) e;
            LOGGER.warn(e.getMessage());
            LOGGER.debug(e.getMessage(), e);
            return format(bundle.getString(translatedException.getMessage()), translatedException.getArgs());
        }

        if (e instanceof ValidationException) {
            final ValidationException validationException = (ValidationException) e;
            switch (validationException.getExceptionType()) {
                case LOGIN_REQUIRED:
                    return bundle.getString("error_login");
                case USER_MISSING_FIELD:
                    return bundle.getString("error_missing_field");
                case USER_VALIDATION_ERROR:
                    return bundle.getString("error_validation");
                case APP_MISSING_FIELD:
                case CONTROLLER_INITIALISATION_ERROR:
                case SERVICE_VALIDATION_ERROR:
                default:
                    return returnInternalError(e, bundle);
            }
        }
        return returnInternalError(e, bundle);
    }

    /**
     * Return internal error.
     *
     * @param e      the e
     * @param bundle the bundle
     * @return the string
     */
    private String returnInternalError(final Throwable e, final ResourceBundle bundle) {
        if (e == null) {
            LOGGER.error("An unknown internal error has occurred");
        } else {
           // if ((e.getMessage() != null) && (e.getMessage().indexOf("Unable to find a controller for") == -1)) LOGGER.error(e.getMessage(), e);
           LOGGER.error(e.getMessage(), e);
        }
        return bundle.getString("error_internal");
    }
}
