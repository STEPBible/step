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

import static com.tyndalehouse.step.core.utils.StepIOUtils.closeQuietly;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

import org.joda.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVReader;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.entities.HotSpot;
import com.tyndalehouse.step.core.data.entities.reference.TimeUnitType;
import com.tyndalehouse.step.core.exceptions.StepInternalException;

/**
 * Loads anything related to the timeline
 * 
 * @author Chris
 * 
 */
public class HotSpotModuleLoader extends AbstractCsvModuleLoader implements ModuleLoader {
    private static final String HOTSPOT_DATA = "hotspot/hotspots.csv";
    private static final Logger LOG = LoggerFactory.getLogger(HotSpotModuleLoader.class);
    private final EbeanServer ebean;

    /**
     * we need to persist object through an orm
     * 
     * @param ebean the persistence server
     */
    @Inject
    public HotSpotModuleLoader(final EbeanServer ebean) {
        this.ebean = ebean;
    }

    @Override
    public void init() {
        LOG.debug("Loading hotspots");
        final long currentTime = System.currentTimeMillis();

        final CsvData timelineDataFiles = readHotSpotDataFile();
        final List<HotSpot> hotSpots = loadHotSpots(timelineDataFiles);

        // finally persist to database
        this.ebean.save(hotSpots);

        final long duration = System.currentTimeMillis() - currentTime;
        LOG.info("Took {}ms to load {} hotspots", Long.valueOf(duration), hotSpots.size());

    }

    /**
     * Loads the timeline data from files
     * 
     * @param data the hotspot csv data file
     * @return a set of timeline events
     * 
     */
    private List<HotSpot> loadHotSpots(final CsvData data) {
        LOG.debug("Loading hotspots data");

        final List<HotSpot> hotSpots = new ArrayList<HotSpot>();

        for (int ii = 0; ii < data.size(); ii++) {
            final HotSpot spot = new HotSpot();

            spot.setStart(LocalDateTime.parse(data.getData(ii, "Start")));
            spot.setEnd(LocalDateTime.parse(data.getData(ii, "End")));
            spot.setColor(data.getData(ii, "Color"));
            spot.setDescription(data.getData(ii, "Description"));
            spot.setScale(TimeUnitType.valueOf(data.getData(ii, "Scale")));
            spot.setMagnify(Double.parseDouble(data.getData(ii, "Magnify")));
            hotSpots.add(spot);
        }

        return hotSpots;
    }

    /**
     * Loads an individual file up.
     * 
     * @return a CSV wrapped data file
     */
    private CsvData readHotSpotDataFile() {
        LOG.debug("Reading hootspot file: ");

        // this uses a buffered reader internally
        CSVReader reader = null;
        Reader fileReader = null;
        try {
            final InputStream csvFile = getClass().getResourceAsStream(HOTSPOT_DATA);
            fileReader = new InputStreamReader(csvFile);

            reader = new CSVReader(fileReader);
            return new CsvData(reader.readAll());
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        } finally {
            closeQuietly(reader);
        }
    }
}
