package com.tyndalehouse.step.core.xsl;

/**
 * Defines the methods useful for xsl transforms when interleaving
 */
public interface InterleavingProvider {

    /**
     * @return the next version name
     */
    String getNextVersion();

}
