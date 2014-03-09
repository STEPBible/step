package com.tyndalehouse.step.core.service.impl;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.SupportRequestService;
import com.tyndalehouse.step.core.utils.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpException;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpRequestInterceptor;
import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthScheme;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.AuthState;
import org.apache.http.auth.Credentials;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.entity.BasicHttpEntity;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.InputStreamBody;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.ExecutionContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;

import javax.inject.Named;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import static com.tyndalehouse.step.core.utils.StringUtils.getNonNullString;


/**
 * Accesses JIRA to raise a support request.
 *
 * @author chrisburrell
 */
@Singleton
public class SupportRequestServiceImpl implements SupportRequestService {
    private static final String ISSUE_API = "/issue/";
    private static final String ATTACH_API = ISSUE_API + "%s/attachments";
    public static final int ERROR_START = 400;
    private final String createTemplate;
    private String jiraEndpoint;
    private final javax.inject.Provider<ClientSession> clientSessionProvider;

    @Inject
    public SupportRequestServiceImpl(@Named("app.jira.create.issue") final String createTemplate,
                                     @Named("app.jira.create.endpoint") final String jiraEndpoint,
                                     javax.inject.Provider<ClientSession> clientSessionProvider) {
        this.createTemplate = createTemplate;
        this.jiraEndpoint = jiraEndpoint;
        this.clientSessionProvider = clientSessionProvider;
    }

    @Override
    public void createRequest(final String summary, final String description, final String url,
                              final String user, final String email) {
        final String id = createJiraRequest(summary, description, url, user, email);
        attachImage(id);
    }

    /**
     * Attaches some data to the issue
     *
     * @param id the FST-number
     */
    private void attachImage(final String id) {

        InputStream imageData = null;
        HttpPost attachmentRequest = null;
        MultipartEntity entity = null;
        HttpResponse response = null;
        try {
            imageData = clientSessionProvider.get().getAttachment();
            if (imageData == null || imageData.available() <= 0) {
                return;
            }
            attachmentRequest = getJiraHttpPost(String.format(ATTACH_API, id));
            entity = new MultipartEntity();
            entity.addPart("file", new InputStreamBody(imageData, "file"));
            attachmentRequest.setEntity(entity);
            DefaultHttpClient httpClient = getDefaultHttpClient(attachmentRequest);
            response = httpClient.execute(attachmentRequest, getHttpContext(httpClient));
            if (response.getStatusLine().getStatusCode() >= ERROR_START) {
                handleHttpResponseFailure(response, null);
            }
        } catch (IOException e) {
            handleHttpResponseFailure(response, null);
        } finally {
            IOUtils.closeQuietly(imageData);
            EntityUtils.consumeQuietly(entity);
            if (attachmentRequest != null) {
                attachmentRequest.releaseConnection();
            }
        }
    }

    /**
     * Creates an issue on JIRA
     *
     * @param summary     the summary of the ticket
     * @param description the description of the ticket
     * @param user        the user attached to the issue
     * @param email       the email
     * @return the id of the issue that was created
     */
    private String createJiraRequest(final String summary, final String description, final String url,
                                     final String user, final String email) {
        String userName = escapeQuotes(getNonNullString(user, ""));
        String userEmail = getNonNullString(email, "");

        ByteArrayInputStream createRequest = null;
        BasicHttpEntity entity = null;
        HttpPost post = null;
        HttpResponse response = null;
        try {
            post = getJiraHttpPost(ISSUE_API);
            entity = new BasicHttpEntity();
            final byte[] body = String.format(createTemplate, summary, description, url, userName, userEmail).getBytes();
            createRequest = new ByteArrayInputStream(body);
            entity.setContent(createRequest);
            entity.setContentLength(body.length);
            
            post.setEntity(entity);

            final DefaultHttpClient defaultHttpClient = getDefaultHttpClient(post);
            response = defaultHttpClient.execute(post, getHttpContext(defaultHttpClient));
            if (response.getStatusLine().getStatusCode() >= ERROR_START) {
                return handleHttpResponseFailure(response, null);
            }

            return extractIssueKey(readResponse(response.getEntity()));
        } catch (IOException ex) {
            return handleHttpResponseFailure(response, ex);
        } finally {
            IOUtils.closeQuietly(createRequest);
            EntityUtils.consumeQuietly(entity);
            if (post != null) {
                post.releaseConnection();
            }
        }
    }

    /**
     * Set pre-emptive authentication on
     * @param httpClient the http client
     * @return the context
     */
    private HttpContext getHttpContext(final DefaultHttpClient httpClient) {
        BasicHttpContext localContext = new BasicHttpContext();
        BasicScheme basicAuth = new BasicScheme();
        localContext.setAttribute("preemptive-auth", basicAuth);
        httpClient.addRequestInterceptor(new PreemptiveAuthInterceptor(), 0);
        return localContext;
    }
    
    private DefaultHttpClient getDefaultHttpClient(HttpPost post) {
        final DefaultHttpClient defaultHttpClient = new DefaultHttpClient();
        final Credentials credentials = new UsernamePasswordCredentials(System.getProperty("jira.user"), System.getProperty("jira.password")); 
        defaultHttpClient.getCredentialsProvider().setCredentials(AuthScope.ANY, credentials);
//        post.addHeader( BasicScheme.authenticate(credentials,"US-ASCII",false) );
        
        return defaultHttpClient;
    }

    /**
     * Handles the http response by reading the entity if not null
     * @param response the HTTP response
     * @param ex the exception that caused the issue (or null)
     * @return no string - always returns null
     */
    private String handleHttpResponseFailure(final HttpResponse response, final IOException ex) {
        String explanation = response != null ? readResponse(response.getEntity()) : "<no response>";
        throw new StepInternalException("Unable to create issue with JIRA: " + explanation, ex);
    }

    /**
     * Escapes all double quotes
     *
     * @param nonNullString the string - must be non null
     * @return the escaped string
     */
    private String escapeQuotes(final String nonNullString) {
        return nonNullString.replaceAll("\"", "\\\"");
    }

    private HttpPost getJiraHttpPost(final String operation) {
        final HttpPost post = new HttpPost(this.jiraEndpoint + operation);
        post.addHeader(new BasicHeader("Content-Type", "application/json"));
        post.addHeader(new BasicHeader("X-Atlassian-Token", "no-check"));
        return post;
    }

    private String extractIssueKey(final String response) {
        int startKey = response.indexOf("FST-");
        int quoteMarker = response.indexOf('"', startKey);
        return response.substring(startKey, quoteMarker);
    }

    private String readResponse(final HttpEntity entity) {
        if(entity == null) {
            return "";
        }
        
        InputStream content = null;
        BufferedReader reader = null;
        InputStreamReader inputStreamReader = null;
        try {
            content = entity.getContent();
            if(content == null) {
                return "";
            }
            
            inputStreamReader = new InputStreamReader(content);
            reader = new BufferedReader(inputStreamReader);
            final StringBuilder response = new StringBuilder(256);
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            return response.toString().replaceAll("[\\n\\r]", "");
        } catch (IOException e) {
            throw new StepInternalException("Unable to parse response", e);
        } finally {
            EntityUtils.consumeQuietly(entity);
            IOUtils.closeQuietly(reader);
            IOUtils.closeQuietly(inputStreamReader);
            IOUtils.closeQuietly(content);
        }
    }

    static class PreemptiveAuthInterceptor implements HttpRequestInterceptor {

        public void process(final HttpRequest request, final HttpContext context) throws HttpException, IOException {
            AuthState authState = (AuthState) context.getAttribute(ClientContext.TARGET_AUTH_STATE);

            // If no auth scheme avaialble yet, try to initialize it
            // preemptively
            if (authState.getAuthScheme() == null) {
                AuthScheme authScheme = (AuthScheme) context.getAttribute("preemptive-auth");
                CredentialsProvider credsProvider = (CredentialsProvider) context.getAttribute(ClientContext.CREDS_PROVIDER);
                HttpHost targetHost = (HttpHost) context.getAttribute(ExecutionContext.HTTP_TARGET_HOST);
                if (authScheme != null) {
                    Credentials creds = credsProvider.getCredentials(new AuthScope(targetHost.getHostName(), targetHost.getPort()));
                    if (creds == null) {
                        throw new HttpException("No credentials for preemptive authentication");
                    }
                    authState.update(authScheme, creds);
                }
            }
        }

    }
}
