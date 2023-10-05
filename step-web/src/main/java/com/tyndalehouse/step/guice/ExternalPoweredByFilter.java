package com.tyndalehouse.step.guice;

import javax.inject.Singleton;
import javax.servlet.*;
import java.io.IOException;

/**
 * Adds a filter, and restricts the types of calls allowed.
 * 
 */
@Singleton
public class ExternalPoweredByFilter implements Filter {
    /** The path under which all external systems connect. */
    public static final String EXTERNAL_PREFIX = "external/";

    @Override
    public void init(final FilterConfig filterConfig) throws ServletException {
        // no config
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
            throws IOException, ServletException {
        request.setAttribute("external_request", true);
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // nothing to destroy
    }

}
