package com.tyndalehouse.step.core.data.impl;

import java.util.HashMap;
import java.util.Map;

import com.tyndalehouse.step.core.data.EntityIndexReader;

/**
 * a test entity manager, which gives us indexes in memory
 * 
 * @author chrisburrell
 * 
 */
public class TestEntityManager extends EntityManagerImpl {
    private final Map<String, EntityIndexReader> indexReaders;

    /**
     * constructs a memory mapped entity manager
     */
    public TestEntityManager() {
        super(true, "test/step/entities/");
        this.indexReaders = new HashMap<String, EntityIndexReader>();
        super.setIndexReaders(this.indexReaders);
    }

    @Override
    public EntityIndexReader getReader(final String entity) {
        EntityIndexReader entityIndexReader = this.indexReaders.get(entity);
        if (entityIndexReader == null) {
            entityIndexReader = new TestEntityIndexReaderImpl(getConfig(entity));
            this.indexReaders.put(entity, entityIndexReader);
        }
        return entityIndexReader;
    }
    
    /**
     * @param entity the entity name
     * @return entity writer
     */
    public EntityIndexWriterImpl getNewWriter(final String entity) {
        return new TestEntityIndexWriterImpl(this, entity);
    }
}
