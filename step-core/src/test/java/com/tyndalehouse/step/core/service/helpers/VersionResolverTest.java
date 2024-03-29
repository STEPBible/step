/**
 * 
 */
package com.tyndalehouse.step.core.service.helpers;

import org.junit.Before;
import org.junit.Test;

import java.util.Properties;

import static org.junit.Assert.assertEquals;

public class VersionResolverTest {

    private VersionResolver resolver;

    /**
     * Sets the up with one version
     */
    @Before
    public void setUp() {
        final Properties properties = new Properties();
        properties.put(VersionResolver.APP_VERSIONS_PREFIX + "Antoniades", "Ant");
        this.resolver = new VersionResolver(properties);
    }

    /**
     * Test method for
     * {@link com.tyndalehouse.step.core.service.helpers.VersionResolver#getShortName(java.lang.String)}.
     */
    @Test
    public void testGetShortName() {
        assertEquals("Ant", this.resolver.getShortName("Antoniades"));
        assertEquals("KJV", this.resolver.getShortName("KJV"));
    }

    /**
     * Test method for
     * {@link com.tyndalehouse.step.core.service.helpers.VersionResolver#getLongName(java.lang.String)}.
     */
    @Test
    public void testGetLongName() {
        assertEquals("Antoniades", this.resolver.getLongName("Ant"));
        assertEquals("KJV", this.resolver.getLongName("KJV"));
    }
}
