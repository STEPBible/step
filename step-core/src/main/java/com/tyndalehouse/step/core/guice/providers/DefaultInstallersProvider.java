package com.tyndalehouse.step.core.guice.providers;

import static com.tyndalehouse.step.core.utils.StringUtils.commaSeparate;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static java.net.Proxy.NO_PROXY;

import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.ProxySelector;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.data.StepHttpSwordInstaller;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.book.install.sword.HttpSwordInstaller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Provides a set of installers for installing Bibles, modules, etc e.g. from Crosswire
 */
@Singleton
public class DefaultInstallersProvider implements Provider<List<Installer>> {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultInstallersProvider.class);
    private static final String CROSSWIRE_ROOT = "http://crosswire.org/";
    private volatile List<Installer> installers;
    private final Properties stepProperties;
    private final String proxyHost;
    private final String proxyPort;

    /**
     * @param stepProperties the properties for the whole STEP application
     * @param proxyHost the host name of the proxy
     * @param proxyPort the port of a proxy to go through
     */
    @Inject
    public DefaultInstallersProvider(@Named("StepCoreProperties") final Properties stepProperties,
            @Named("app.proxy.host") final String proxyHost, @Named("app.proxy.port") final String proxyPort) {
        this.stepProperties = stepProperties;
        this.proxyHost = proxyHost;
        this.proxyPort = proxyPort;
    }

    /**
     * Initialises the installers from the passed in properties
     * 
     * @return a list of installers that have been created
     */
    private synchronized List<Installer> initialiseInstallers() {
        final List<Installer> newInstallers = new ArrayList<Installer>();
        final Set<Entry<Object, Object>> entrySet = this.stepProperties.entrySet();
        for (final Entry<Object, Object> entry : entrySet) {
            if (entry.getKey() instanceof String && ((String) entry.getKey()).startsWith("installer")) {
                // add to list
                final String[] split = commaSeparate(entry.getValue().toString());

                final Installer i = getInstaller(split);

                if (i != null) {
                    newInstallers.add(i);
                }
            }
        }

        return newInstallers;
    }

    /**
     * @param splitParts the various parts of the installer property
     * @return an installer, properly configured with any relevant proxy
     */
    protected synchronized Installer getInstaller(final String[] splitParts) {
        if (splitParts.length < 4) {
            return null;
        }

        final StepHttpSwordInstaller installer = new StepHttpSwordInstaller();
        installer.setInstallerName(splitParts[0]);
        installer.setHost(splitParts[1]);
        installer.setPackageDirectory(splitParts[2]);
        installer.setCatalogDirectory(splitParts[3]);

        if (isNotBlank(this.proxyHost) || isNotBlank(this.proxyPort)) {
            setManualProxy(installer);
        } else {
            setAvailableSystemProxy(installer);
        }

        return installer;
    }

    /**
     * Sets the proxy manually
     * 
     * @param installer the installer that requires configuration
     */
    private void setManualProxy(final HttpSwordInstaller installer) {
        // set the host
        if (isNotBlank(this.proxyHost)) {
            installer.setProxyHost(this.proxyHost);
        }

        // set the port
        if (isNotBlank(this.proxyPort)) {
            try {
                final Integer p = Integer.parseInt(this.proxyPort);
                installer.setProxyPort(p.intValue());
            } catch (final NumberFormatException e) {
                throw new StepInternalException("Unable to parse port number " + this.proxyPort, e);
            }
        }
    }

    /**
     * if available, then sets the default proxy and port
     * 
     * @param installer an installer to be configured with a potential proxy
     */
    private void setAvailableSystemProxy(final HttpSwordInstaller installer) {
        System.setProperty("java.net.useSystemProxies", "true");
        List<Proxy> l = null;
        try {
            l = ProxySelector.getDefault().select(new URI(CROSSWIRE_ROOT));
        } catch (final URISyntaxException e) {
            LOGGER.warn("Unable to parse URL for Crosswire: [{}]", CROSSWIRE_ROOT);
            LOGGER.trace("Root exception was", e);
            return;
        }

        if (l != null && !l.isEmpty()) {
            final Proxy p = l.get(0);
            if (NO_PROXY.equals(p)) {
                return;
            }

            final InetSocketAddress address = (InetSocketAddress) p.address();
            if (address == null) {
                return;
            }

            // finally set to what the address actually says
            installer.setProxyHost(address.getHostName());
            installer.setProxyPort(address.getPort());
        }
    }

    @Override
    public List<Installer> get() {
        if (this.installers == null) {
            synchronized (this) {
                if (this.installers == null) {
                    this.installers = initialiseInstallers();
                }
            }
        }

        return this.installers;
    }
}
