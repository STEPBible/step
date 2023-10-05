package com.tyndalehouse.step.rest.framework;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.inject.Provider;
import javax.inject.Singleton;

@Singleton
public class ObjectMapperProvider implements Provider<ObjectMapper> {
    private static ObjectMapper objectMapper;
    
    @Override
    public ObjectMapper get() {
        if(objectMapper == null) {
            synchronized(ObjectMapperProvider.class) {
                if(objectMapper == null) {
                    objectMapper = new ObjectMapper();
                    objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
                }
            }
        }
        
        return objectMapper;
    }
}
