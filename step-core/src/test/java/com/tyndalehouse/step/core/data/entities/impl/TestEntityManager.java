package com.tyndalehouse.step.core.data.entities.impl;

import com.google.inject.Binder;
import com.google.inject.Guice;
import com.google.inject.Module;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

import java.util.HashMap;
import java.util.Map;

/**
 * a test entity manager, which gives us indexes in memory
 */
public class TestEntityManager extends EntityManagerImpl {
    private final Map<String, EntityIndexReader> indexReaders;

    /**
     * constructs a memory mapped entity manager
     */
    public TestEntityManager() {
        super(true, "test/step/entities/", Guice.createInjector(new Module() {

            @Override
            public void configure(final Binder binder) {
                binder.bind(JSwordPassageService.class).to(MockJSwordPassageServiceImpl.class);
            }
        }));
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
    @Override
    public EntityIndexWriterImpl getNewWriter(final String entity) {
        return new TestEntityIndexWriterImpl(this, entity);
    }
}
