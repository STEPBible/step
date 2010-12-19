package com.tyndalehouse.step.core.guice.providers;

import java.util.HashMap;
import java.util.Map;

import com.google.inject.Provider;
import com.google.inject.Provides;
import com.google.inject.Singleton;

/**
 * Provides the mappings between lexicon key references and the module initials that should be used.
 * 
 * @author Chris
 * 
 */
@Singleton
public class DefaultLexiconRefsProvider implements Provider<Map<String, String>> {

    /**
     * @return the list of default versions to be installed on a STEP installation
     * 
     */
    @Provides
    public Map<String, String> get() {
        final Map<String, String> moduleRefs = new HashMap<String, String>();
        moduleRefs.put("strong:H", "StrongsHebrew");
        moduleRefs.put("strong:G", "StrongsGreek");
        moduleRefs.put("robinson:", "Robinson");
        return moduleRefs;
    }
}
