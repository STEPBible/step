package com.tyndalehouse.step.core.data.entities.impl;

import java.io.Closeable;
import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;

/**
 * @author chrisburrell
 * 
 */
@Singleton
public class EntityManagerImpl implements Closeable, EntityManager {
    private final Map<String, EntityConfiguration> configs = new HashMap<String, EntityConfiguration>();
    private final boolean memoryMapped;
    private final String indexPath;
    private Map<String, EntityIndexReader> indexReaders = new HashMap<String, EntityIndexReader>();

    /**
     * Constructs the entity manager
     * 
     * @param memoryMapped true to indicate indexes should be stored in memory
     * @param indexPath path to index
     */
    @Inject
    public EntityManagerImpl(@Named("app.index.memoryMapped") final boolean memoryMapped,
            @Named("app.index.path") final String indexPath) {
        this.memoryMapped = memoryMapped;
        this.indexPath = indexPath;
    }

    @Override
    public EntityConfiguration getConfig(final String entityName) {
        EntityConfiguration entityConfiguration = this.configs.get(entityName);

        if (entityConfiguration == null) {
            entityConfiguration = new EntityConfiguration(this.indexPath, entityName);
            this.configs.put(entityName, entityConfiguration);
        }
        return entityConfiguration;
    }

    @Override
    public void refresh(final String entity) {
        final EntityIndexReader entityIndexReader = this.indexReaders.get(entity);
        if (entityIndexReader != null) {
            entityIndexReader.refresh();
        }
    }

    @Override
    public EntityIndexReader getReader(final String entity) {
        EntityIndexReader entityIndexReader = this.indexReaders.get(entity);
        if (entityIndexReader == null) {
            entityIndexReader = new EntityIndexReaderImpl(getConfig(entity), this.memoryMapped);
            this.indexReaders.put(entity, entityIndexReader);
        }
        return entityIndexReader;
    }

    @Override
    public EntityIndexWriterImpl getNewWriter(final String entity) {
        return new EntityIndexWriterImpl(this, entity);
    }

    @Override
    public void close() {
        for (final EntityIndexReader reader : this.indexReaders.values()) {
            reader.close();
        }
    }

    /**
     * @param indexReaders the indexReaders to set
     */
    void setIndexReaders(final Map<String, EntityIndexReader> indexReaders) {
        this.indexReaders = indexReaders;
    }
}
