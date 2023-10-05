package com.tyndalehouse.step.models;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

/**
 * A POJO to hold properties
 */
@Singleton
public class UiDefaults {
    private final String defaultVersion1;
    private final String defaultVersion2;
    private final String defaultReference1;
    private final String defaultReference2;

    /**
     * injecting the defaults from property files
     * 
     * @param defaultVersion1 the default version for column 1
     * @param defaultReference1 the default reference for column 1
     * @param defaultVersion2 the default version for column 2
     * @param defaultReference2 the default reference for column 2
     */
    @Inject
    public UiDefaults(@Named("app.ui.defaults.1.version") final String defaultVersion1,
            @Named("app.ui.defaults.1.reference") final String defaultReference1,
            @Named("app.ui.defaults.2.version") final String defaultVersion2,
            @Named("app.ui.defaults.2.reference") final String defaultReference2) {
        this.defaultVersion1 = defaultVersion1;
        this.defaultReference1 = defaultReference1;
        this.defaultVersion2 = defaultVersion2;
        this.defaultReference2 = defaultReference2;
    }

    /**
     * @return the defaultVersion1
     */
    public String getDefaultVersion1() {
        return this.defaultVersion1;
    }

    /**
     * @return the defaultVersion2
     */
    public String getDefaultVersion2() {
        return this.defaultVersion2;
    }

    /**
     * @return the defaultReference1
     */
    public String getDefaultReference1() {
        return this.defaultReference1;
    }

    /**
     * @return the defaultReference2
     */
    public String getDefaultReference2() {
        return this.defaultReference2;
    }
}
