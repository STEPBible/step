package com.tyndalehouse.step.core.guice.providers;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Provider;
import javax.inject.Singleton;

import com.google.inject.Provides;

/**
 * Provides a list of default versions that should be installed for the application
 * 
 * @author chrisburrell
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
        versions.add("ESV_th");
        versions.add("KJV");
        versions.add("Byz");
        return versions;
    }
}
