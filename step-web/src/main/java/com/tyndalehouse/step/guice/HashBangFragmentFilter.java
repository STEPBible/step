package com.tyndalehouse.step.guice;

import com.tyndalehouse.step.core.utils.StringUtils;

import javax.inject.Singleton;
import javax.servlet.*;
import java.io.IOException;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

/**
 * Intercepts and works out whether JSword has been installed with modules...
 */
@Singleton
public class HashBangFragmentFilter implements Filter {
    @Override
    public void init(final FilterConfig filterConfig) throws ServletException {
        // nothing to record
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
            throws IOException, ServletException {

        final String parameter = request.getParameter("_escaped_fragment_");
        if (isBlank(parameter)) {
            continueAsNormal(request, response, chain);
            return;
        }

        final String[] split = parameter.split("=");
        if (split.length < 1) {
            continueAsNormal(request, response, chain);
            return;
        }

        if ("lexicon".equals(split[0])) {
            request.getRequestDispatcher("snapshots/definition.jsp?strong=" + split[2]).forward(request,
                    response);
        } else if(parameter.indexOf("__/") != -1) {
            //then we're looking at a passage...
            String[] parts = parameter.split("__/");

            StringBuilder sb = new StringBuilder(128);

            int passageId = 0;
            sb.append("snapshots/passage.jsp?");
            for(int ii = 0; ii < parts.length; ii++) {
                String[] passageParts = parts[ii].split("/");
                if(StringUtils.isBlank(parts[ii]) || passageParts.length < 4) {
                    continue;
                }

                boolean wasPassage = appendPassageArgs( sb, passageId, passageParts);
                if(!wasPassage) {
                    appendSearchArgs(sb, passageId, passageParts);
                }

                if(ii < parts.length - 1) {
                    sb.append('&');
                }
                passageId++;
            }
            request.getRequestDispatcher(sb.toString()).forward(request, response);
        }

        continueAsNormal(request, response, chain);
    }

    /**
     *  Everything else is a search at the moment
     * @param sb the string builder
     * @param passageId the passage id
     * @param passageParts the passage parts
     */
    private void appendSearchArgs(final StringBuilder sb, final int passageId, final String[] passageParts) {
        if(passageParts.length < 5) {
            return;
        }

        sb.append("querySyntax");
        sb.append(passageId);
        sb.append('=');
        sb.append(passageParts[4]);

        sb.append('&');
        sb.append("context");
        sb.append(passageId);
        sb.append('=');
        sb.append(passageParts[5]);

        sb.append('&');
        sb.append("pageNumber");
        sb.append(passageId);
        sb.append('=');
        sb.append(passageParts[2]);

        sb.append('&');
        sb.append("pageSize");
        sb.append(passageId);
        sb.append('=');
        sb.append(passageParts[3]);
    }

    /**
     * Appends the argument to lookup a passage snapshot
     * @param sb the StringBuilder
     * @param passageId the passage Id
     * @param passageParts the passage parts
     */
    private boolean appendPassageArgs(final StringBuilder sb, final int passageId, final String[] passageParts) {
        if( !"passage".equals(passageParts[1])) {
            return false;
        }

        sb.append("version");
        sb.append(passageId);
        sb.append('=');
        sb.append(passageParts[3]);
        sb.append('&');
        sb.append("reference");
        sb.append(passageId);
        sb.append('=');
        sb.append(passageParts[4]);
        return true;
    }

    /**
     * Continute as normal.
     * 
     * @param request the request
     * @param response the response
     * @param chain the chain
     * @throws IOException Signals that an I/O exception has occurred.
     * @throws ServletException the servlet exception
     */
    private void continueAsNormal(final ServletRequest request, final ServletResponse response,
            final FilterChain chain) throws IOException, ServletException {
        // default, do nothing
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // nothing to destroy
    }
}
