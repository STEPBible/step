package com.tyndalehouse.step.core.service;

import java.util.List;

import com.tyndalehouse.step.core.data.entities.GeoPlace;

/**
 * Access to the geography module
 * 
 * @author cjburrell
 * 
 */
public interface GeographyService {
    /**
     * returns all places that are within a passage reference
     * 
     * @param reference the biblical reference
     * @return the list of places (lat/long/precisions)
     */
    List<GeoPlace> getPlaces(String reference);
}
