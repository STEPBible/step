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
package com.tyndalehouse.step.core.data.create.loaders.translations;

import static com.tyndalehouse.step.core.utils.EntityUtils.fillInTargetType;
import static com.tyndalehouse.step.core.utils.StringUtils.isEmpty;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotEmpty;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.common.GeoPrecision;
import com.tyndalehouse.step.core.data.create.loaders.CsvData;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.reference.TargetType;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Translates from {@link CsvData} to {@link GeoPlace}
 * 
 * @author chrisburrell
 */
public class OpenBibleDataTranslation implements CsvTranslation<GeoPlace> {
    private static final Logger LOG = LoggerFactory.getLogger(OpenBibleDataTranslation.class);
    private final JSwordPassageService jsword;

    /**
     * @param jsword the jsword service to be able to lookup the relevant references
     */
    public OpenBibleDataTranslation(final JSwordPassageService jsword) {
        this.jsword = jsword;
    }

    @Override
    public List<GeoPlace> parseAll(final CsvData data) {
        final List<GeoPlace> places = new ArrayList<GeoPlace>(data.size());
        for (int ii = 0; ii < data.size(); ii++) {

            final GeoPlace gp = new GeoPlace();
            gp.setName(data.getData(ii, "ESV"));
            gp.setRoot(data.getData(ii, "Root"));
            setCoordinates(gp, data.getData(ii, "Lat"), data.getData(ii, "Lon"));

            final List<ScriptureReference> passageReferences = this.jsword.resolveReferences(
                    data.getData(ii, "Verses").replace(',', ';').replace("Sng", "Song"), "KJV");

            fillInTargetType(passageReferences, TargetType.GEO_PLACE);

            gp.setReferences(passageReferences);
            gp.setComment(data.getData(ii, "Comment"));

            LOG.trace("Adding [{}] [{}]", gp.getId(), gp.getName());
            places.add(gp);
            LOG.trace("Added [{}] [{}]", gp.getId(), gp.getName());
        }
        return places;
    }

    /**
     * A helper to set the coordinates and an indication of how precise things are...
     * 
     * @param gp the place
     * @param latitude latitude
     * @param longitude longitude
     */
    private void setCoordinates(final GeoPlace gp, final String latitude, final String longitude) {
        setCoordinate(gp, latitude, true);
        setCoordinate(gp, longitude, false);
    }

    /**
     * sets a coordinate
     * 
     * @param gp the place
     * @param coordinate the number value, e.g. ~25.40
     * @param isLatitude whether the coordinate is a latitude (true), or longitude (false)
     */
    private void setCoordinate(final GeoPlace gp, final String coordinate, final boolean isLatitude) {
        if (isEmpty(coordinate)) {
            // unknown
            gp.setPrecision(GeoPrecision.UNKNOWN);
            return;
        }

        final String coordinateSuffix = getCoordinateFromString(coordinate, gp);
        try {

            if (isNotEmpty(coordinateSuffix)) {
                final Double coordValue = Double.parseDouble(coordinateSuffix);
                if (isLatitude) {
                    gp.setLatitude(coordValue);
                } else {
                    gp.setLongitude(coordValue);
                }
            } else {
                // set to unknown
                gp.setPrecision(GeoPrecision.UNKNOWN);
            }
        } catch (final NumberFormatException e) {
            LOG.error("Unable to parse number: " + coordinate, e);
        }
    }

    /**
     * Gets the right part of the string for further conversion into a decimal value
     * 
     * @param coordinate the coordinate string
     * @param gp the geo place, in case we need to set the approximation
     * @return the coordinate
     */
    private String getCoordinateFromString(final String coordinate, final GeoPlace gp) {
        // advance to first digit
        int ii = 0;
        final int coordLength = coordinate.length();
        LOG.trace("Parsing value coordinate [{}]", coordinate);
        while (ii < coordLength && !Character.isDigit(coordinate.charAt(ii))) {
            // do something with the characters we find
            ii++;
        }

        // check last character, and remove
        int jj = coordinate.length() - 1;
        while (jj > 0 && !Character.isDigit(coordinate.charAt(jj))) {
            if (coordinate.charAt(jj) == '?') {
                gp.setPrecision(GeoPrecision.APPROXIMATE);
            }

            jj--;
        }

        if (jj <= ii) {
            // then we have only dodgy characters indicating unknown
            return null;
        }

        LOG.trace("Substring of [{}] and [{}]", ii, jj);
        return coordinate.substring(ii, jj + 1);
    }

}
