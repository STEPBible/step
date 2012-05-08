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
package com.tyndalehouse.step.core.data.create;

import static com.tyndalehouse.step.core.data.entities.reference.TargetType.GEO_PLACE;
import static org.apache.commons.lang.StringUtils.isEmpty;
import static org.apache.commons.lang.StringUtils.isNotEmpty;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.LineIterator;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.google.inject.name.Named;
import com.tyndalehouse.step.core.data.common.GeoPrecision;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Loads anything related to the timeline
 * 
 * @author Chris
 * 
 */
public class GeographyModuleLoader implements ModuleLoader {
    private static final int PLACE_NAME_FIELD = 0;
    private static final int ROOT_FIELD = 1;
    private static final int LATITUDE_FIELD = 2;
    private static final int LONGITUDE_FIELD = 3;
    private static final int SCRIPTURE_FIELD = 4;
    private static final int COMMENT_FIELD = 5;
    private static final Logger LOG = LoggerFactory.getLogger(GeographyModuleLoader.class);
    private static final int IGNORE_LINES = 1;
    private final EbeanServer ebean;
    private final JSwordService jsword;
    private final String dataClasspath;

    /**
     * we need to persist object through an orm
     * 
     * @param ebean the persistence server
     * @param jsword the jsword service
     * @param dataClasspath classpath to data
     */
    @Inject
    public GeographyModuleLoader(final EbeanServer ebean, final JSwordService jsword,
            @Named("test.data.path.geography.openbible") final String dataClasspath) {
        this.ebean = ebean;
        this.jsword = jsword;
        this.dataClasspath = dataClasspath;
    }

    /**
     * loads up the timeline data
     * 
     * @return the number of items successfully added
     */
    public int init() {
        final long currentTime = System.currentTimeMillis();

        final List<GeoPlace> geoPlaces = loadOpenBibleData();

        // finally persist to database
        final int count = this.ebean.save(geoPlaces);

        final long duration = System.currentTimeMillis() - currentTime;
        LOG.info("Took {}ms to load {} places", Long.valueOf(duration), count);

        if (geoPlaces.size() != count) {
            LOG.warn("Loaded {} places but was trying to load [{}]", new Object[] { count, geoPlaces.size() });
        }

        return count;
    }

    /**
     * reads in the data and populates the scripture references
     * 
     * @return a list of places
     */
    private List<GeoPlace> loadOpenBibleData() {
        LOG.debug("Loading geography data");
        final List<GeoPlace> places = new ArrayList<GeoPlace>(2000);

        LineIterator lineIterator = null;
        InputStream placeFileStream = null;

        try {

            placeFileStream = getClass().getResourceAsStream(this.dataClasspath);
            lineIterator = IOUtils.lineIterator(placeFileStream, Charset.defaultCharset());

            for (int ii = 0; ii < IGNORE_LINES && lineIterator.hasNext(); ii++) {
                lineIterator.next();
            }

            while (lineIterator.hasNext()) {
                final String geoLine = lineIterator.nextLine();
                final String[] geoFields = StringUtils.splitPreserveAllTokens(geoLine, '\t');

                final GeoPlace gp = new GeoPlace();
                gp.setEsvName(geoFields[PLACE_NAME_FIELD]);
                gp.setRoot(geoFields[ROOT_FIELD]);
                setCoordinates(gp, geoFields[LATITUDE_FIELD], geoFields[LONGITUDE_FIELD]);
                final List<ScriptureReference> passageReferences = this.jsword
                        .getPassageReferences(
                                geoFields[SCRIPTURE_FIELD].replace(',', ';').replace("Sng", "Song"),
                                GEO_PLACE, "KJV");

                gp.setReferences(passageReferences);
                gp.setComment(geoFields[COMMENT_FIELD]);

                LOG.trace("Adding [{}] [{}]", gp.getEsvName(), geoFields[PLACE_NAME_FIELD]);
                places.add(gp);
                LOG.trace("Added [{}] [{}]", gp.getId(), gp.getEsvName());

            }
        } catch (final IOException e) {
            LOG.error("IO Exception while loading geography data", e);
        } finally {
            LineIterator.closeQuietly(lineIterator);
            IOUtils.closeQuietly(placeFileStream);
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
