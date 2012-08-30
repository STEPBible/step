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
            // if the first or the last, we only output once
            if (this.lastAccessed == 0 || this.lastAccessed == this.versions.length - 1) {
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

    /**
     * @return true to indicate we are on version name number 1
     */
    public boolean isFirstVersion() {
        return this.lastAccessed == 0;
    }

    /**
     * increments our count and returns the version name
     * 
     * @return the version name
     */
    private String returnAndIncrement() {
        final String nextVersion = this.versions[this.lastAccessed];
        this.lastAccessed = (this.lastAccessed + 1) % this.versions.length;
        return nextVersion;
    }
}
