package com.tyndalehouse.step.rest.controllers;

import static org.apache.commons.lang.Validate.notEmpty;
import static org.apache.commons.lang.Validate.notNull;

import java.util.List;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.service.GeographyService;

/**
 * Getting some geographical data to display
 * 
 * @author Chris
 * 
 */
@Singleton
public class GeographyController {

    private final GeographyService geoService;

    /**
     * Constructs a simple geography service
     * 
     * @param geoService the geo lookup service
     */
    @Inject
    public GeographyController(final GeographyService geoService) {
        notNull(geoService, "Failed to initialise Geography Controller");
        this.geoService = geoService;

    }

    /**
     * returns all places that are within a passage reference
     * 
     * @param reference the biblical reference
     * @return the list of places (lat/long/precisions)
     */
    public List<GeoPlace> getPlaces(final String reference) {
        notEmpty("A reference is required for looking up geography modules");
        return this.geoService.getPlaces(reference);
    }

}
