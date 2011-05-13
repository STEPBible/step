package com.tyndalehouse.step.core.data.create;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVReader;

import com.tyndalehouse.step.core.data.entities.KeyedEntity;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.utils.StepIOUtils;

/**
 * provides functionality for parsing CSV files
 * 
 * @author cjburrell
 * 
 */
public class AbstractCsvModuleLoader {
    private static final Logger LOG = LoggerFactory.getLogger(AbstractCsvModuleLoader.class);

    /**
     * loads data from a csv file
     * 
     * @param resourceName the resource name to load
     * @param csvDataMapper the mapper that will be used to construct a entity
     * @param <K> a type representing the keyed entity
     * @return a map of entities loaded from the CSV file
     */
    protected <K extends KeyedEntity> Map<String, K> load(final String resourceName,
            final CsvDataMapper<K> csvDataMapper) {
        final Map<String, K> elements = new HashMap<String, K>();

        CSVReader reader = null;
        try {
            LOG.debug("Loading {}", resourceName);
            reader = new CSVReader(new InputStreamReader(getClass().getResourceAsStream(resourceName)));
            final CsvData data = new CsvData(reader.readAll());

            for (int ii = 0; ii < data.size(); ii++) {
                final K entity = csvDataMapper.mapRow(ii, data);
                elements.put(entity.getCode(), entity);
            }
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        } finally {
            StepIOUtils.closeQuietly(reader);
        }
        return elements;
    }
}
