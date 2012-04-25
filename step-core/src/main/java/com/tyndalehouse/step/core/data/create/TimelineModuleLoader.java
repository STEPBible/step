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

import static com.tyndalehouse.step.core.data.common.PartialDate.parseDate;
import static com.tyndalehouse.step.core.utils.StepIOUtils.closeQuietly;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVReader;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.common.PartialDate;
import com.tyndalehouse.step.core.data.common.PrecisionType;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.utils.StepIOUtils;

/**
 * Loads anything related to the timeline
 * 
 * @author Chris
 * 
 */
public class TimelineModuleLoader extends AbstractCsvModuleLoader implements ModuleLoader {
    private static final String TIMELINE_DIRECTORY = "timeline/";
    private static final Logger LOG = LoggerFactory.getLogger(TimelineModuleLoader.class);
    private final EbeanServer ebean;
    private final JSwordService jsword;

    /**
     * we need to persist object through an orm
     * 
     * @param ebean the persistence server
     * @param jsword the jsword service
     */
    @Inject
    public TimelineModuleLoader(final EbeanServer ebean, final JSwordService jsword) {
        this.ebean = ebean;
        this.jsword = jsword;
    }

    @Override
    public void init() {
        LOG.debug("Loading timeline events");
        final long currentTime = System.currentTimeMillis();

        final List<CsvData> timelineDataFiles = getTimelineDataFiles();
        final List<TimelineEvent> timelineEvents = loadTimelineEvents(timelineDataFiles);

        // finally persist to database
        this.ebean.save(timelineEvents);

        final long duration = System.currentTimeMillis() - currentTime;
        LOG.info("Took {}ms to load {} timeline events", Long.valueOf(duration), timelineEvents.size());

    }

    /**
     * Loads the timeline data from files
     * 
     * @param csvDataFiles a set of csv data files that can be read
     * @return a set of timeline events
     * 
     */
    private List<TimelineEvent> loadTimelineEvents(final List<CsvData> csvDataFiles) {
        LOG.debug("Loading timeline events data");
        final List<TimelineEvent> events = new ArrayList<TimelineEvent>();

        for (final CsvData data : csvDataFiles) {
            for (int ii = 0; ii < data.size(); ii++) {
                final TimelineEvent event = new TimelineEvent();
                final PartialDate from = parseDate(data.getData(ii, "From"));
                final PartialDate to = parseDate(data.getData(ii, "To"));

                event.setSummary(data.getData(ii, "Name"));
                if (from.getPrecision() != PrecisionType.NONE) {
                    event.setFromDate(from.getDate());
                    event.setFromPrecision(from.getPrecision());
                }

                if (to.getPrecision() != PrecisionType.NONE) {
                    event.setToDate(to.getDate());
                    event.setToPrecision(to.getPrecision());

                }
                // finally add any scripture reference required
                final List<ScriptureReference> passageReferences = this.jsword.getPassageReferences(data
                        .getData(ii, "Refs"));

                event.setReferences(passageReferences);

                events.add(event);
            }
        }

        return events;
    }

    /**
     * @return a list of files containing the timeline data
     */
    @SuppressWarnings("unchecked")
    private List<CsvData> getTimelineDataFiles() {
        // final File sourceDirectory;
        InputStream indexFile = null;
        List<String> indexChapters = null;
        try {
            indexFile = getClass().getResourceAsStream(TIMELINE_DIRECTORY + "index.txt");
            indexChapters = IOUtils.readLines(indexFile);
        } catch (final IOException e) {
            throw new StepInternalException(e.getMessage(), e);
        } finally {
            StepIOUtils.closeQuietly(indexFile);
        }

        final List<CsvData> csvDataFiles = new ArrayList<CsvData>();
        for (final String ic : indexChapters) {
            if (!ic.startsWith("--")) {
                csvDataFiles.add(readTimelineDataFile(ic));
            }
        }

        return csvDataFiles;
    }

    /**
     * Loads an individual file up.
     * 
     * @param timelineDataFile the timeline data file
     * @return a CSV wrapped data file
     */
    private CsvData readTimelineDataFile(final String timelineDataFile) {
        LOG.debug("Reading timeline file: [{}]", timelineDataFile);

        // this uses a buffered reader internally
        CSVReader reader = null;
        Reader fileReader = null;
        try {
            final InputStream csvFile = getClass().getResourceAsStream(TIMELINE_DIRECTORY + timelineDataFile);
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
