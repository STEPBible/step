package com.tyndalehouse.step.core.data;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Fieldable;
import org.codehaus.jackson.annotate.JsonAnyGetter;
import org.codehaus.jackson.annotate.JsonIgnore;

/**
 * 
 * @author chrisburrell
 * 
 */
public class EntityDoc {
    private final Document doc;

    /**
     * If not otherwised specified, then we get all the fields
     * 
     * @param doc the underlying document
     */
    public EntityDoc(final Document doc) {
        this.doc = doc;
    }

    /**
     * @param fieldName the name of the field
     * @return a field value
     */
    @JsonIgnore
    public String get(final String fieldName) {
        return this.doc.get(fieldName);
    }

    /**
     * Returns all fields as a map
     * 
     * @return the map of values
     */
    @JsonAnyGetter
    public Map<String, String> getAllFields() {
        final List<Fieldable> fields = this.doc.getFields();
        final Map<String, String> allFields = new HashMap<String, String>(fields.size());
        for (final Fieldable field : fields) {
            allFields.put(field.name(), field.stringValue());

        }
        return allFields;
    }
}
