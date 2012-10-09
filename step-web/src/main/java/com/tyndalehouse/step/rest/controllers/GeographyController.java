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
package com.tyndalehouse.step.rest.controllers;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.CONTROLLER_INITIALISATION_ERROR;
import static com.tyndalehouse.step.core.exceptions.UserExceptionType.USER_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notEmpty;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notNull;

import java.util.ArrayList;
import java.util.List;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.service.GeographyService;
import com.tyndalehouse.step.models.Place;

/**
 * Getting some geographical data to display
 * 
 * @author chrisburrell
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
        notNull(geoService, "Failed to initialise Geography Controller", CONTROLLER_INITIALISATION_ERROR);
        this.geoService = geoService;

    }

    /**
     * returns all places that are within a passage reference
     * 
     * @param reference the biblical reference
     * @return the list of places (lat/long/precisions)
     */
    public List<Place> getPlaces(final String reference) {
        notEmpty(reference, "A reference is required for looking up geography modules", USER_MISSING_FIELD);
        final EntityDoc[] placeDocs = this.geoService.getPlaces(reference);

        final List<Place> places = new ArrayList<Place>(placeDocs.length);
        for (final EntityDoc d : placeDocs) {
            places.add(new Place(d));
        }
        return places;
    }

}
