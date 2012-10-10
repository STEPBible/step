package com.tyndalehouse.step.core.utils;

import com.tyndalehouse.step.core.data.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.data.impl.TestEntityManager;

/**
 * static utilities for testing, creating entities, etc.
 * 
 * @author chrisburrell
 * 
 */
public final class TestUtils {
    /**
     * no op
     */
    private TestUtils() {
        // no op
    }

    /**
     * writes entities to the index
     * 
     * @param entityName the name of the entity
     * @param fields the fields in the entity
     */
    public static void createEntities(final String entityName, final String... fields) {
        final TestEntityManager manager = new TestEntityManager();
        final EntityIndexWriterImpl newWriter = manager.getNewWriter(entityName);

        for (int ii = 0; ii < fields.length; ii = ii + 2) {
            newWriter.addFieldToCurrentDocument(fields[ii], fields[ii + 1]);
        }
        newWriter.save();
        newWriter.close();
        manager.close();
    }
}
