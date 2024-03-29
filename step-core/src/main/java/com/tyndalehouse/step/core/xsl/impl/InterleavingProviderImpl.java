package com.tyndalehouse.step.core.xsl.impl;

import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.xsl.InterleavingProvider;

import java.util.ArrayList;
import java.util.List;

/**
 * Provides the headings for any interleaved passage
 */
public class InterleavingProviderImpl implements InterleavingProvider {
    private String[] versions;
    private int lastAccessed = 0;
    private final boolean comparing;
    private final JSwordVersificationService versificationService;

    /**
     * Instantiates a new interleaving provider impl.
     *
     * @param versificationService the versification service
     * @param versions versions to interleave
     * @param comparing true to indicate we need to duplicate the versions returned
     */
    public InterleavingProviderImpl(final JSwordVersificationService versificationService,
            final String[] versions, final boolean comparing) {
        this.versificationService = versificationService;
        this.versions = versions.clone();
        this.comparing = comparing;
        computeVersions();

    }

    /**
     * Computes the list of versions
     */
    private void computeVersions() {
        if (this.comparing) {
            computeComparingVersions();
        } else {
            computeNormalversions();
        }
    }

    /**
     * When comparing, things get a bit more tricky. We are interested in the order, but if versions are not
     * the same language then we don't output a difference, and therefore, it skips a column.
     * We also skip if the version is exactly the same
     */
    private void computeComparingVersions() {
        if (this.versions.length == 0) {
            return;
        }

        final String masterVersion = this.versions[0];
        final String masterLanguage = getLanguageForVersion(0);

        final List<String> newVersions = new ArrayList<String>();
        for (int ii = 0; ii < this.versions.length - 1; ii++) {

            // if not last
            if (ii + 1 < this.versions.length) {
                final String nextLanguage = getLanguageForVersion(ii + 1);

                // if this language and next are equal, add the pair, since we will compare them
                if (!masterVersion.equals(versions[ii+1]) && masterLanguage.equals(nextLanguage)) {
                    newVersions.add(masterVersion);
                    newVersions.add(this.versions[ii + 1]);
                }
                // if not equal, then we're not going to compare them, so no need to add them
            }
        }

        this.versions = newVersions.toArray(new String[] {});
    }

    /**
     * @param ii the index of the version to be looked up
     * @return the language code
     */
    private String getLanguageForVersion(final int ii) {
        return this.versificationService.getBookFromVersion(this.versions[ii]).getBookMetaData()
                .getLanguage().getCode();
    }

    /**
     * method stub to parse when normal versions. In this case, we want what the user has input any way
     */
    private void computeNormalversions() {
        // do nothing
    }

    @Override
    public String getNextVersion() {
        return returnAndIncrement();
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

    /**
     * @return the versions
     */
    public String[] getVersions() {
        return this.versions;
    }
}
