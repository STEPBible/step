package com.tyndalehouse.step.core.xsl.impl;

import java.util.HashSet;
import java.util.Set;

import javax.inject.Inject;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;

/**
 * Provides extra cross-references to be displayed next to the passage
 */
public class CrossReferenceProviderImpl {

    private final EntityIndexReader nave;

    /**
     * Instantiates a new cross reference provider impl.
     * 
     * @param manager the data manager
     */
    @Inject
    public CrossReferenceProviderImpl(final EntityManager manager) {
        this.nave = manager.getReader("nave");
    }

    /**
     * Gets the references.
     * 
     * @param osisID the osis id
     * @return the references that have been found
     */
    public Set<String> getReferences(final String osisID) {
        final EntityDoc[] results = this.nave.search("expandedReferences", osisID);
        final Set<String> refs = new HashSet<String>(results.length * 2);
        for (int i = 0; i < results.length; i++) {
            refs.add(results[i].get("references"));
        }
        return refs;
    }
}
