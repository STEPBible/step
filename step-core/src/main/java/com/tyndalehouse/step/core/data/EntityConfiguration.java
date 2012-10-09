package com.tyndalehouse.step.core.data;

import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static com.tyndalehouse.step.core.utils.StringUtils.split;
import static org.apache.lucene.util.Version.LUCENE_30;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.Fieldable;
import org.apache.lucene.util.Version;
import org.crosswire.common.util.CWProject;

import com.tyndalehouse.step.core.data.create.PostProcessor;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.utils.IOUtils;

/**
 * A configuration of the entity, include the list of fields, etc.
 * 
 * @author chrisburrell
 * 
 */
public class EntityConfiguration {
    private static final String ENTITY_FIELDS_PREFIX = "entity.fields.";
    private final String name;
    private Map<String, FieldConfig> luceneFieldConfiguration;
    private Analyzer analyzerInstance;
    private PostProcessor postProcessorInstance;
    private String path;
    private final String entityHome;

    /**
     * Creates an entity configuration from a file
     * 
     * @param entityName the resource
     */
    public EntityConfiguration(final String path, final String entityName) {
        this.entityHome = path;
        this.name = entityName;
        final Properties properties = loadProperties(entityName);
        parseProperties(properties);
    }

    /**
     * parses the properties related to an entity configuration
     * 
     * @param properties the set of properties
     */
    private void parseProperties(final Properties properties) {
        try {
            final String analyzerProperty = properties.getProperty("entity.analyzer");
            if (isNotBlank(analyzerProperty)) {
                // try the default constructor
                final Class<Analyzer> analyzerClass = (Class<Analyzer>) Class.forName(analyzerProperty);
                try {
                    this.analyzerInstance = analyzerClass.newInstance();
                } catch (final InstantiationException exception) {
                    this.analyzerInstance = analyzerClass.getConstructor(Version.class).newInstance(
                            Version.LUCENE_30);
                }
            } else {
                this.analyzerInstance = new StandardAnalyzer(LUCENE_30);
            }

            final String processor = properties.getProperty("entity.postProcessor");
            if (isNotBlank(processor)) {
                this.postProcessorInstance = (PostProcessor) Class.forName(processor).newInstance();
            }
        } catch (final Exception e) {
            throw new StepInternalException("Unable to parse configuration file", e);
        }

        parseFieldConfigs(properties);
    }

    /**
     * Parses all field configuration
     * 
     * @param properties the set of properties attached to an entity
     */
    private void parseFieldConfigs(final Properties properties) {
        int initialCapacity = properties.size() - 3;
        initialCapacity = initialCapacity > 0 ? initialCapacity : 0;
        this.luceneFieldConfiguration = new HashMap<String, FieldConfig>(initialCapacity);

        for (final Entry<Object, Object> p : properties.entrySet()) {
            if (p.getKey() instanceof String) {
                final String key = (String) p.getKey();
                if (key.startsWith(ENTITY_FIELDS_PREFIX)) {
                    parseFieldConfig(key.substring(ENTITY_FIELDS_PREFIX.length()), (String) p.getValue());
                }
            }
        }
    }

    /**
     * parses a single field configuration
     * 
     * @param fieldName the name of the field
     * @param value value of the field
     */
    private void parseFieldConfig(final String fieldName, final String value) {
        final String[] parts = split(value, ",");
        final String[] rawFieldMappings = split(parts[0], "\\|");
        final FieldConfig fieldConfig = new FieldConfig(fieldName, rawFieldMappings,
                Field.Store.valueOf(parts[1]), Field.Index.valueOf(parts[2]));
        this.luceneFieldConfiguration.put(fieldName, fieldConfig);
    }

    /**
     * Loads the properties from file
     * 
     * @param entityName the name of the entity
     * @return the set of properties
     */
    private Properties loadProperties(final String entityName) {
        InputStream resourceAsStream = null;
        try {
            resourceAsStream = getClass().getResourceAsStream(entityName + ".properties");
            final Properties properties = new Properties();
            properties.load(resourceAsStream);
            return properties;
        } catch (final IOException e) {
            throw new StepInternalException("Unable to load entity configuration " + entityName, e);
        } finally {
            IOUtils.closeQuietly(resourceAsStream);
        }
    }

    /**
     * @return the location at which the index is stored
     */
    public URI getLocation() {
        try {
            return CWProject.instance().getWriteableProjectSubdir(getPath(), true);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to create step directory", e);
        }
    }

    /**
     * @return the relative path to the entity
     */
    private String getPath() {
        if (this.path == null) {
            this.path = this.entityHome + this.name;
        }
        return this.path;
    }

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * @param fieldName the field name
     * @return the configuration of this field
     */
    public FieldConfig getField(final String fieldName) {
        return this.luceneFieldConfiguration.get(fieldName);
    }

    /**
     * @return the luceneFieldConfiguration
     */
    public Map<String, FieldConfig> getLuceneFieldConfiguration() {
        return this.luceneFieldConfiguration;
    }

    /**
     * @return the analyzerInstance
     */
    public Analyzer getAnalyzerInstance() {
        return this.analyzerInstance;
    }

    /**
     * @return the postProcessorInstance
     */
    public PostProcessor getPostProcessorInstance() {
        return this.postProcessorInstance;
    }

    public Fieldable getField(final String fieldName, final String fieldValue) {
        return this.luceneFieldConfiguration.get(fieldName).getField(fieldValue);
    }
}
