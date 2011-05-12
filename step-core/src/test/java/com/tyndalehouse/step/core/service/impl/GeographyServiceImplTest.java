package com.tyndalehouse.step.core.service.impl;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.data.common.GeoPrecision;
import com.tyndalehouse.step.core.data.entities.GeoPlace;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;

/**
 * tests the geography data retrieval queries
 * 
 * @author Chris
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class GeographyServiceImplTest extends DataDrivenTestExtension {
    /**
     * Tests the successful path of registering a user
     */
    @Test
    public void testGetPlace() {
        // create a place
        final List<ScriptureReference> references = new ArrayList<ScriptureReference>();
        final ScriptureReference r = new ScriptureReference();
        r.setStartVerseId(10);
        r.setEndVerseId(10);
        references.add(r);

        final GeoPlace gp = new GeoPlace();
        gp.setEsvName("ESV Name");
        gp.setLatitude(10.0);
        gp.setLongitude(20.0);
        gp.setPrecision(GeoPrecision.EXACT);
        gp.setReferences(references);

        // save place
        super.getEbean().save(gp);

        // get place from reference, we check persistence-cascading worked correctly
        final List<GeoPlace> geoPlaces = super.getEbean().find(GeoPlace.class).findList();
        assertEquals(1, geoPlaces.size());
        assertEquals(1, geoPlaces.get(0).getReferences().size());

        final GeographyServiceImpl geo = new GeographyServiceImpl(getEbean(), new JSwordServiceImpl(null));
        final List<GeoPlace> places = geo.getPlaces("Genesis 1:1-15");

        assertEquals("ESV Name", places.get(0).getEsvName());
    }
}
