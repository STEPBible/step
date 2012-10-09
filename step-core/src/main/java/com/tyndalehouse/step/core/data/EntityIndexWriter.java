package com.tyndalehouse.step.core.data;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriter.MaxFieldLength;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.store.RAMDirectory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.create.PostProcessor;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Reads a file and creates the equivalent Lucene index for it. This class is not thread safe.
 * 
 * @author chrisburrell
 * 
 */
public class EntityIndexWriter {
    private static final Logger LOGGER = LoggerFactory.getLogger(EntityIndexWriter.class);
    private final RAMDirectory ramDirectory;
    private IndexWriter writer;
    private final Map<String, FieldConfig> luceneFieldConfigurationByRaw;
    private final EntityConfiguration config;

    private Document doc;
    private final EntityManager manager;

    /**
     * Responsible for writing items to an index.
     * 
     * @param entityManager the configuration for that entity
     * @param entityName the name of the entity
     */
    public EntityIndexWriter(final EntityManager entityManager, final String entityName) {
        this.manager = entityManager;
        this.config = entityManager.getConfig(entityName);

        final Map<String, FieldConfig> luceneFieldConfiguration = this.config.getLuceneFieldConfiguration();
        this.luceneFieldConfigurationByRaw = new HashMap<String, FieldConfig>(luceneFieldConfiguration.size());

        // key the map by its data fields
        final Set<Entry<String, FieldConfig>> entrySet = luceneFieldConfiguration.entrySet();
        for (final Entry<String, FieldConfig> entry : entrySet) {
            final String[] rawDataField = entry.getValue().getRawDataField();
            for (final String rawDString : rawDataField) {
                this.luceneFieldConfigurationByRaw.put(rawDString, entry.getValue());
            }
        }

        this.ramDirectory = new RAMDirectory();
        try {
            this.writer = new IndexWriter(this.ramDirectory, this.config.getAnalyzerInstance(),
                    MaxFieldLength.UNLIMITED);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to initialise creation of index", e);
        }
    }

    /**
     * writes the index to the relevant file location
     * 
     * @return the number of entries in the index
     */
    public int close() {
        final int numEntries = this.writer.maxDoc();
        final File file = new File(this.config.getLocation());
        Directory destination;
        try {
            // we've finished writing entries now, so close our writer
            this.writer.close();

            // open up a location on disk
            destination = FSDirectory.open(file);

            final IndexWriter fsWriter = new IndexWriter(destination, this.config.getAnalyzerInstance(),
                    true, IndexWriter.MaxFieldLength.UNLIMITED);
            fsWriter.addIndexesNoOptimize(new Directory[] { this.ramDirectory });
            fsWriter.optimize();
            fsWriter.close();
            destination.close();
            this.ramDirectory.close();
            this.manager.refresh(this.config.getName());
        } catch (final IOException e) {
            throw new StepInternalException("Unable to write index", e);
        }
        return numEntries;
    }

    /**
     * Adds a field to the current document
     * 
     * @param fieldName the field name
     * @param fieldValue the field value
     */
    public void addFieldToCurrentDocument(final String fieldName, final Number fieldValue) {
        ensureNewDocument();
        final FieldConfig fieldConfig = this.luceneFieldConfigurationByRaw.get(fieldName);

        if (fieldConfig == null) {
            LOGGER.trace("Skipping field: [{}]", fieldName);
            return;
        }

        this.doc.add(fieldConfig.getField(fieldValue));
    }

    /**
     * Adds a field to the current document
     * 
     * @param fieldName the field name
     * @param fieldValue the field value
     */
    public void addFieldToCurrentDocument(final String fieldName, final String fieldValue) {
        ensureNewDocument();
        final FieldConfig fieldConfig = this.luceneFieldConfigurationByRaw.get(fieldName);

        if (fieldConfig == null) {
            LOGGER.trace("Skipping field: [{}]", fieldName);
            return;
        }

        this.doc.add(fieldConfig.getField(fieldValue));
    }

    /** Creates a document if it doesn't already exist */
    private void ensureNewDocument() {
        if (this.doc == null) {
            this.doc = new Document();
        }
    }

    /**
     * saves the current document, by running the processor and adding it to the index
     */
    public void save() {
        final PostProcessor postProcessorInstance = this.config.getPostProcessorInstance();
        if (postProcessorInstance != null && this.doc != null) {
            postProcessorInstance.process(this.config, this.doc);
        }
        addDocument();
    }

    /**
     * adds a document to the index
     */
    private void addDocument() {
        try {
            if (this.doc != null) {
                this.writer.addDocument(this.doc);
                this.doc = null;
            }
        } catch (final IOException e) {
            throw new StepInternalException("Unable to write document", e);
        }
    }
}
