package com.tyndalehouse.step.core.data.entities.impl;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.Directory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * Memory only lucene indexes...
 */
public class TestEntityIndexReaderImpl extends EntityIndexReaderImpl {
    private static final Logger LOGGER = LoggerFactory.getLogger(TestEntityIndexReaderImpl.class);
    private final EntityConfiguration config;

    /**
     * Memory only reader
     * 
     * @param config the configuration
     */
    public TestEntityIndexReaderImpl(final EntityConfiguration config) {
        super(config);
        this.config = config;

        initMemoryIndex();
    }

    /**
     * sets the directory up
     */
    private void initMemoryIndex() {
        final Directory d = TestLuceneIndexDirectory.getEntityDirectory(this.config.getName());
        try {
            super.setSearcher(new IndexSearcher(d, true));
        } catch (final IOException e) {
            LOGGER.warn(
                    "Unable to read index [{}], continuing because tests may not need this index to work",
                    this.config.getName());
        }
    }
}
