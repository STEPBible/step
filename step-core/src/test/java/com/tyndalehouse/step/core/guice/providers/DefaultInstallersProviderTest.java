package com.tyndalehouse.step.core.guice.providers;

import org.junit.Test;

import java.util.Properties;

import static org.junit.Assert.assertEquals;

/**
 * Test properties are loaded properly and construct a installer capable of downloading books off the internet
 */
public class DefaultInstallersProviderTest {
    /**
     * tests the main flows
     */
    @Test
    public void testDefaultInstaller() {
        final String i = "some name,www.crosswire.org,/ftpmirror/pub/sword/packages/rawzip,/ftpmirror/pub/sword/raw";
        final Properties p = new Properties();
        p.put("installer.1", i);

        final DefaultInstallersProvider defaultInstallersProvider = new DefaultInstallersProvider(p,
                "localhost", "8080");

        final String def = defaultInstallersProvider.get().get(0).getInstallerDefinition();

        assertEquals("www.crosswire.org,/ftpmirror/pub/sword/packages/rawzip,"
                + "/ftpmirror/pub/sword/raw,,localhost,8080", def);
    }
}
