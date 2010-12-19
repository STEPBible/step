package com.tyndalehouse.step.core.guice.providers;

import static org.apache.commons.lang.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.book.install.sword.HttpSwordInstaller;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Provides a set of installers for installing Bibles, modules, etc e.g. from Crosswire
 * 
 * @author Chris
 * 
 */
@Singleton
public class DefaultInstallersProvider implements Provider<List<Installer>> {
    private final List<Installer> installers;

    /**
     * @param stepProperties the properties for the whole STEP application
     * @param proxyHost the host name of the proxy
     * @param proxyPort the port of a proxy to go through
     */
    @Inject
    public DefaultInstallersProvider(@Named("StepCoreProperties") final Properties stepProperties,
            @Named("app.proxy.host") final String proxyHost, @Named("app.proxy.port") final String proxyPort) {
        this.installers = new ArrayList<Installer>();
        final Set<Entry<Object, Object>> entrySet = stepProperties.entrySet();
        for (final Entry<Object, Object> entry : entrySet) {
            if (entry.getKey() instanceof String && ((String) entry.getKey()).startsWith("installer")) {
                // add to list
                final String[] split = StringUtils.split(entry.getValue().toString(), ",");

                final HttpSwordInstaller installer = new HttpSwordInstaller();
                installer.setHost(split[0]);
                installer.setPackageDirectory(split[1]);
                installer.setCatalogDirectory(split[2]);

                if (isNotBlank(proxyHost)) {
                    installer.setProxyHost(proxyHost);
                }

                if (isNotBlank(proxyPort)) {
                    try {
                        final Integer p = Integer.parseInt(proxyPort);
                        installer.setProxyPort(p.intValue());
                    } catch (final NumberFormatException e) {
                        throw new StepInternalException("Unable to parse port number " + proxyPort, e);
                    }
                }

                this.installers.add(installer);
            }
        }
    }

    @Override
    public List<Installer> get() {
        return this.installers;
    }
}
