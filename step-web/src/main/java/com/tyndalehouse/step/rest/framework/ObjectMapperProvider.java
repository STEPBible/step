package com.tyndalehouse.step.rest.framework;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.annotate.JsonSerialize;

import javax.inject.Provider;
import javax.inject.Singleton;

/**
 * @author chrisburrell
 */
@Singleton
public class ObjectMapperProvider implements Provider<ObjectMapper> {
    private static ObjectMapper objectMapper;
    
    @Override
    public ObjectMapper get() {
        if(objectMapper == null) {
            synchronized(ObjectMapperProvider.class) {
                if(objectMapper == null) {
                    objectMapper = new ObjectMapper();
                    objectMapper.setSerializationInclusion(JsonSerialize.Inclusion.NON_NULL);
                }
            }
        }
        
        return objectMapper;
    }
}
