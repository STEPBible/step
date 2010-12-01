package com.tyndalehouse.step.core.service.impl;

import static junit.framework.Assert.assertEquals;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

public class ModuleServiceImplTest {
    /**
     * tests that different definitions references resolve to the right module by default
     */
    @Test
    public void testGetLookupModule() {
        final ModuleServiceImpl msi = new ModuleServiceImpl();
        final Map<String, String> defaultModules = new HashMap<String, String>();
        msi.setDefaultModuleLexicons(defaultModules);

        defaultModules.put("key:", "module");
        assertEquals("module", msi.getLookupModule("key:H2929"));
    }
}
