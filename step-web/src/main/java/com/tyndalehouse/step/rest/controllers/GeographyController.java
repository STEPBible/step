/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119package com.tyndalehouse.step.rest.controllers;

//pt20201119import static com.tyndalehouse.step.core.exceptions.UserExceptionType.CONTROLLER_INITIALISATION_ERROR;
//pt20201119import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
//pt20201119import static com.tyndalehouse.step.core.utils.ValidateUtils.notEmpty;
//pt20201119import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;
//pt20201119
//pt20201119import java.util.ArrayList;
//pt20201119import java.util.List;
//pt20201119
//pt20201119import com.google.inject.Inject;
//pt20201119import com.google.inject.Singleton;
//pt20201119import com.tyndalehouse.step.core.data.EntityDoc;

//pt20201119import com.tyndalehouse.step.core.service.GeographyService;
//pt20201119import com.tyndalehouse.step.models.Place;

//pt20201119/**
//pt20201119 * Getting some geographical data to display
//pt20201119 *
//pt20201119 * @author chrisburrell
//pt20201119 *
//pt20201119 */
//pt20201119@Singleton
//pt20201119public class GeographyController {

//pt20201119    private final GeographyService geoService;

//pt20201119    /**
//pt20201119     * Constructs a simple geography service
//pt20201119     *
//pt20201119     * @param geoService the geo lookup service
//pt20201119     */
//pt20201119    @Inject
//pt20201119    public GeographyController(final GeographyService geoService) {
//pt20201119        notNull(geoService, "Failed to initialise Geography Controller", CONTROLLER_INITIALISATION_ERROR);
//pt20201119        this.geoService = geoService;
//pt20201119
//pt20201119    }

//pt20201119    /**
//pt20201119     * returns all places that are within a passage reference
//pt20201119     *
//pt20201119     * @param reference the biblical reference
//pt20201119     * @return the list of places (lat/long/precisions)
//pt20201119     */
//pt20201119    public List<Place> getPlaces(final String reference) {
//pt20201119        notEmpty(reference, "reference_for_maps", USER_MISSING_FIELD);
//pt20201119        final EntityDoc[] placeDocs = this.geoService.getPlaces(reference);
//pt20201119
//pt20201119        final List<Place> places = new ArrayList<Place>(placeDocs.length);
//pt20201119        for (final EntityDoc d : placeDocs) {
//pt20201119            places.add(new Place(d));
//pt20201119        }
//pt20201119        return places;
//pt20201119    }

//pt20201119}
