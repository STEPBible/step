package com.tyndalehouse.step.core.data.impl;

import java.io.IOException;

import org.apache.lucene.store.Directory;

import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * A test version
 * 
 * @author chrisburrell
 * 
 */
public class TestEntityIndexWriterImpl extends EntityIndexWriterImpl {

    /**
     * @param entityManager the manager
     * @param entityName the name of the entity
     */
    public TestEntityIndexWriterImpl(final EntityManager entityManager, final String entityName) {
        super(entityManager, entityName);
    }

    @Override
    Directory getNewRamDirectory() {
        return TestLuceneIndexDirectory.getEntityDirectory(getEntityName());
    }

    @Override
    public int close() {
        try {
            getRamWriter().close();
        } catch (final IOException e) {
            throw new StepInternalException("Unable to write to ram index", e);
        }
        return super.getNumEntriesInIndex();
    }
}
