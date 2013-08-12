package com.tyndalehouse.step.guice;

import com.tyndalehouse.step.core.service.AppManagerService;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.*;
import java.io.IOException;

/**
 * Intercepts and works out whether STEP has finished the installation process
 *
 * @author chrisburrell
 */
@Singleton
public class SetupRedirectFilter implements Filter {
    //sourced from step.core.properties, identifies the version of the currently running application
    private String runningAppVersion;
    private AppManagerService appManager;

    /**
     * @param runningAppVersion the version of the running application
     */
    @Inject
    public SetupRedirectFilter(@Named(AppManagerService.APP_VERSION) final String runningAppVersion,
                               AppManagerService appManager) {
        this.runningAppVersion = runningAppVersion;
        this.appManager = appManager;
    }

    @Override
    public void init(final FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
            throws IOException, ServletException {
        String installedVersion = appManager.getAppVersion();
        //server installations always going forward
        if (!appManager.isLocal() || (installedVersion != null && installedVersion.equals(runningAppVersion))) {
            // do nothing
            chain.doFilter(request, response);
        } else {
            request.getRequestDispatcher("firstTime.jsp").forward(request, response);
        }
    }

    @Override
    public void destroy() {
        // nothing to destroy
    }
}
