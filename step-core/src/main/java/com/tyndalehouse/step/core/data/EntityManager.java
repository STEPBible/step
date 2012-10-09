package com.tyndalehouse.step.core.data;

import java.io.Closeable;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

/**
 * @author chrisburrell
 * 
 */
@Singleton
public class EntityManager implements Closeable {
    private final Map<String, EntityConfiguration> configs = new HashMap<String, EntityConfiguration>();
    private final Map<String, EntityIndexReader> indexReaders = new HashMap<String, EntityIndexReader>();
    private final boolean memoryMapped;
    private final String indexPath;

    /**
     * Constructs the entity manager
     * 
     * @param memoryMapped true to indicate indexes should be stored in memory
     */
    @Inject
    public EntityManager(@Named("app.index.memoryMapped") final boolean memoryMapped,
            @Named("app.index.path") final String indexPath) {
        this.memoryMapped = memoryMapped;
        this.indexPath = indexPath;
    }

    /**
     * @param entityName the name of the entity
     * @return the configuration for the entity
     */
    public EntityConfiguration getConfig(final String entityName) {
        EntityConfiguration entityConfiguration = this.configs.get(entityName);

        if (entityConfiguration == null) {
            entityConfiguration = new EntityConfiguration(this.indexPath, entityName);
            this.configs.put(entityName, entityConfiguration);
        }
        return entityConfiguration;
    }

    /**
     * @param entity the name of the entity to refresh
     */
    public void refresh(final String entity) {
        final EntityIndexReader entityIndexReader = this.indexReaders.get(entity);
        if (entityIndexReader != null) {
            entityIndexReader.refresh();
        }
    }

    /**
     * @param entity the name of the entity
     * @return the reader of the index
     */
    public EntityIndexReader getReader(final String entity) {
        EntityIndexReader entityIndexReader = this.indexReaders.get(entity);
        if (entityIndexReader == null) {
            entityIndexReader = new EntityIndexReader(getConfig(entity), this.memoryMapped);
            this.indexReaders.put(entity, entityIndexReader);
        }
        return entityIndexReader;
    }

    @Override
    public void close() throws IOException {
        for (final EntityIndexReader reader : this.indexReaders.values()) {
            reader.close();
        }
    }
}
