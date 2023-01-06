package com.tyndalehouse.step.core.data.entities.impl;

import com.google.inject.Injector;
import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import java.io.Closeable;
import java.util.HashMap;
import java.util.Map;

@Singleton
public class EntityManagerImpl implements Closeable, EntityManager {
    private final Map<String, EntityConfiguration> configs = new HashMap<String, EntityConfiguration>();
    private final boolean memoryMapped;
    private final String indexPath;
    private Map<String, EntityIndexReader> indexReaders = new HashMap<String, EntityIndexReader>();
    private final Injector injector;

    /**
     * Constructs the entity manager.
     * 
     * @param memoryMapped true to indicate indexes should be stored in memory
     * @param indexPath path to index
     * @param injector the injector
     */
    @Inject
    public EntityManagerImpl(@Named("app.index.memoryMapped") final boolean memoryMapped,
            @Named("app.index.path") final String indexPath, final Injector injector) {
        this.memoryMapped = memoryMapped;
        this.indexPath = indexPath;
        this.injector = injector;
    }

    @Override
    public EntityConfiguration getConfig(final String entityName) {
        EntityConfiguration entityConfiguration = this.configs.get(entityName);

        if (entityConfiguration == null) {
            entityConfiguration = new EntityConfiguration(this.indexPath, entityName, this.injector);
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
