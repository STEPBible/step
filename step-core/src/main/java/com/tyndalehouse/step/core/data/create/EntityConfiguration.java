package com.tyndalehouse.step.core.data.create;

import java.util.Map;

/**
 * A configuration of the entity, include the list of fields, etc.
 * 
 * @author chrisburrell
 * 
 */
public class EntityConfiguration {
    private String name;
    private Map<String, FieldConfig> luceneFieldConfiguration;
    private String analyzerClass;
    private String postParsingClaas;

}
