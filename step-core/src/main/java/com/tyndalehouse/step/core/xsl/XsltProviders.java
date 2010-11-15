package com.tyndalehouse.step.core.xsl;

public enum XsltProviders {
    INTERLINEAR_PROVIDER("InterlinearProvider");

    private final String paramName;

    XsltProviders(final String paramName) {
        this.paramName = paramName;
    }

    public String getParamName() {
        return this.paramName;
    }
}
