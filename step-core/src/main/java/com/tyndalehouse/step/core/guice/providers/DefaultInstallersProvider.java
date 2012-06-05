/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.guice.providers;

import static com.tyndalehouse.step.core.utils.StringUtils.commaSeparate;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;

import java.util.ArrayList;
import java.util.List;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;

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
 * @author chrisburrell
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
                final String[] split = commaSeparate(entry.getValue().toString());

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
