package com.tyndalehouse.step.core.data.entities.impl;

import static com.tyndalehouse.step.core.utils.StringUtils.isBlank;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriter.MaxFieldLength;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.store.RAMDirectory;
import org.joda.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.EntityConfiguration;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.FieldConfig;
import com.tyndalehouse.step.core.data.create.PostProcessor;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Reads a file and creates the equivalent Lucene index for it. This class is not thread safe.
 * 
 * @author chrisburrell
 * 
 */
public class EntityIndexWriterImpl {
    private static final Logger LOGGER = LoggerFactory.getLogger(EntityIndexWriterImpl.class);
    private final Directory ramDirectory;
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
    // we specifically allow a method to be overridden for testing purposes.
    @SuppressWarnings("PMD")
    public EntityIndexWriterImpl(final EntityManager entityManager, final String entityName) {
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

        this.ramDirectory = getNewRamDirectory();
        try {
            this.writer = new IndexWriter(this.ramDirectory, this.config.getAnalyzerInstance(),
                    MaxFieldLength.UNLIMITED);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to initialise creation of index", e);
        }
    }

    /**
     * @return a new ram directory
     */
    Directory getNewRamDirectory() {
        return new RAMDirectory();
    }

    /**
     * writes the index to the relevant file location
     * 
     * @return the number of entries in the index
     */
    public int close() {
        final int numEntries = getNumEntriesInIndex();
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
     * @return the writer of the index into RAM
     */
    IndexWriter getRamWriter() {
        return this.writer;
    }

    /**
     * @return the number of entries in index
     */
    int getNumEntriesInIndex() {
        return this.writer.maxDoc();
    }

    /**
     * Adds a field to the current document
     * 
     * @param fieldName the field name
     * @param fieldValue the field value
     */
    public void addFieldToCurrentDocument(final String fieldName, final Number fieldValue) {
        if (fieldValue == null) {
            return;
        }

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
    public void addFieldToCurrentDocument(final String fieldName, final LocalDateTime fieldValue) {
        if (fieldValue == null) {
            return;
        }

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
        if (isBlank(fieldValue)) {
            return;
        }

        ensureNewDocument();



        final FieldConfig fieldConfig = this.luceneFieldConfigurationByRaw.get(fieldName);
        if (fieldConfig == null) {
            LOGGER.trace("Skipping field: [{}]", fieldName);
            return;
        }

        //check if we've got the field already...
        //if so, then we'll simply append to the existing data, as we don't want
        //to be storing stuff in different fields...
        Field existingValue = this.doc.getField(fieldConfig.getName());
        if(existingValue != null && fieldConfig.isAppend()) {
            existingValue.setValue(existingValue.stringValue() + " " + fieldValue);
            return;
        }

        //otherwise, either add for the first time, or add multiple times
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
    @SuppressWarnings("PMD")
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

    /**
     * @return the entity name
     */
    String getEntityName() {
        return this.config.getName();
    }

}
