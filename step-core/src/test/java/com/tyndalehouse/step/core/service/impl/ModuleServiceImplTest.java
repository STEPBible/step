package com.tyndalehouse.step.core.service.impl;

import static junit.framework.Assert.assertEquals;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

/**
 * A simple test for the module service
 * 
 * @author Chris
 * 
 */
public class ModuleServiceImplTest {
    /**
     * tests that different definitions references resolve to the right module by default
     */
    @Test
    public void testGetLookupModule() {
        final Map<String, String> defaultModules = new HashMap<String, String>();
        defaultModules.put("key:", "module");
        final ModuleServiceImpl msi = new ModuleServiceImpl(defaultModules, null);

        assertEquals("module", msi.getLookupModule("key:H2929"));
    }
}
