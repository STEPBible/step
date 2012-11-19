package com.tyndalehouse.step.guice;

import java.io.IOException;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;

/**
 * Intercepts and works out whether JSword has been installed with modules...
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class SetupRedirectFilter implements Filter {
    private static final String[] MANDATORY_MODULES = { "ESV", "KJV" };
    private final JSwordModuleService jsword;

    /**
     * @param jsword jsword service
     */
    @Inject
    public SetupRedirectFilter(final JSwordModuleService jsword) {
        this.jsword = jsword;

    }

    @Override
    public void init(final FilterConfig filterConfig) throws ServletException {
        // nothing to record
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
            throws IOException, ServletException {
        if (this.jsword.isInstalled(MANDATORY_MODULES)) {

        } else {
            request.getRequestDispatcher("firstTime.jsp").forward(request, response);
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // nothing to destroy
    }
}
