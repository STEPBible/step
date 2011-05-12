package com.tyndalehouse.step.core.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.service.GeographyService;
import com.tyndalehouse.step.core.service.JSwordService;

/**
 * Returns geography data
 * 
 * @author cjburrell
 * 
 */
public class GeographyServiceImpl implements GeographyService {
    private static final Logger LOG = LoggerFactory.getLogger(GeographyServiceImpl.class);
    private final EbeanServer ebean;
    private final JSwordService jsword;

    /**
     * creates a new Geography service implementation
     * 
     * @param ebean ebean server
     * @param jsword the jsword service for access to Crosswire functionality
     */
    @Inject
    public GeographyServiceImpl(final EbeanServer ebean, final JSwordService jsword) {
        this.ebean = ebean;
        this.jsword = jsword;
    }

    @Override
    public List<GeoPlace> getPlaces(final String reference) {
        LOG.debug("Returning places for reference [{}]", reference);
        final List<ScriptureReference> passageReferences = this.jsword.getPassageReferences(reference);
        final List<GeoPlace> placesInScope = new ArrayList<GeoPlace>();

        final String rawQuery = "t0.id in (select geo_place_id from scripture_reference "
                + "where start_verse_id <= %s and end_verse_id >= %s and geo_place_id is not null)";

        for (final ScriptureReference sr : passageReferences) {
            placesInScope.addAll(this.ebean.find(GeoPlace.class).where().raw(
                    String.format(rawQuery, sr.getEndVerseId(), sr.getStartVerseId())).findList());
        }

        return placesInScope;
    }
}
