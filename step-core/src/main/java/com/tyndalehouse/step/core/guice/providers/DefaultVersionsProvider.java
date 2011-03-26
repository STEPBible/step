package com.tyndalehouse.step.core.guice.providers;

import java.util.ArrayList;
import java.util.List;

import com.google.inject.Provider;
import com.google.inject.Provides;
import com.google.inject.Singleton;

/**
 * Provides a list of default versions that should be installed for the application
 * 
 * @author Chris
 * 
 */
@Singleton
public class DefaultVersionsProvider implements Provider<List<String>> {

    /**
     * @return the list of default versions to be installed on a STEP installation
     * 
     */
    @Provides
    @Override
    public List<String> get() {
        final List<String> versions = new ArrayList<String>();
        versions.add("ESV");
        versions.add("KJV");
        versions.add("StrongsHebrew");
        versions.add("StrongsGreek");
        versions.add("Byz");
        return versions;
    }
}
