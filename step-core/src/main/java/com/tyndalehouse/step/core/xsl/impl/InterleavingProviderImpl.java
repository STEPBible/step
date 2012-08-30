package com.tyndalehouse.step.core.xsl.impl;

import com.tyndalehouse.step.core.xsl.InterleavingProvider;

/**
 * Provides the headings for any interleaved passage
 * 
 * @author chrisburrell
 * 
 */
public class InterleavingProviderImpl implements InterleavingProvider {
    private final String[] versions;
    private int lastAccessed = 0;
    private boolean returnedOnce = false;
    private final boolean comparing;

    /**
     * @param versions versions to interleave
     * @param comparing true to indicate we need to duplicate the versions returned
     */
    public InterleavingProviderImpl(final String[] versions, final boolean comparing) {
        this.versions = versions;
        this.comparing = comparing;
    }

    @Override
    public String getNextVersion() {
        if (!this.comparing) {
            return returnAndIncrement();
        } else {
            if (this.lastAccessed == 0) {
                return returnAndIncrement();
            } else {
                // we're 1 or more, so if we've already returned once, then return a second time, but
                // increment this time
                if (this.returnedOnce) {
                    this.returnedOnce = false;
                    return returnAndIncrement();
                } else {
                    this.returnedOnce = true;
                    return this.versions[this.lastAccessed];
                }
            }
        }
    }

    private String returnAndIncrement() {
        final String nextVersion = this.versions[this.lastAccessed];
        this.lastAccessed = (this.lastAccessed + 1) % this.versions.length;
        return nextVersion;
    }
}
