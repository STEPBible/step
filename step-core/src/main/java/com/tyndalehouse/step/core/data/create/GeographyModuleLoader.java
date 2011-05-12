package com.tyndalehouse.step.core.data.create;

import static org.apache.commons.lang.StringUtils.isEmpty;
import static org.apache.commons.lang.StringUtils.isNotEmpty;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.LineIterator;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
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
    private static final String OPENBIBLE_DATA = "geography/openbible.tab";
    private static final Logger LOG = LoggerFactory.getLogger(GeographyModuleLoader.class);
    private static final int IGNORE_LINES = 1;
    private final EbeanServer ebean;
    private final JSwordService jsword;

    /**
     * we need to persist object through an orm
     * 
     * @param ebean the persistence server
     * @param jsword the jsword service
     */
    @Inject
    public GeographyModuleLoader(final EbeanServer ebean, final JSwordService jsword) {
        this.ebean = ebean;
        this.jsword = jsword;
    }

    /**
     * loads up the timeline data
     */
    public void init() {
        final long currentTime = System.currentTimeMillis();

        final List<GeoPlace> geoPlaces = loadOpenBibleData();

        // finally persist to database
        this.ebean.save(geoPlaces);

        final long duration = System.currentTimeMillis() - currentTime;
        LOG.info("Took {}ms to load {} places", Long.valueOf(duration), geoPlaces.size());
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

            placeFileStream = getClass().getResourceAsStream(OPENBIBLE_DATA);
            lineIterator = IOUtils.lineIterator(placeFileStream, null);

            for (int ii = 0; ii < IGNORE_LINES && lineIterator.hasNext(); ii++) {
                lineIterator.next();
            }

            while (lineIterator.hasNext()) {
                final String geoLine = lineIterator.nextLine();
                final String[] geoFields = StringUtils.splitPreserveAllTokens(geoLine, '\t');

                final GeoPlace gp = new GeoPlace();
                gp.setEsvName(geoFields[0]);
                gp.setRoot(geoFields[1]);
                setCoordinates(gp, geoFields[2], geoFields[3]);
                final List<ScriptureReference> passageReferences = this.jsword
                        .getPassageReferences(geoFields[4].replace(',', ';').replace("Sng", "Song"));

                gp.setReferences(passageReferences);
                gp.setComment(geoFields[5]);

                LOG.trace("Adding [{}] [{}]", gp.getEsvName(), geoFields[4]);
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
            gp.setPrecision(GeoPrecision.UNKNOWN);
            return;
        }

        try {
            LOG.trace("Substring of [{}] and [{}]", ii, jj);
            final String coordinateSuffix = coordinate.substring(ii, jj + 1);

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
}
