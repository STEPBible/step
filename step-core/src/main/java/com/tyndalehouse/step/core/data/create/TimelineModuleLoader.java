package com.tyndalehouse.step.core.data.create;

import static com.tyndalehouse.step.core.data.common.PartialDate.parseDate;
import static com.tyndalehouse.step.core.utils.StepIOUtils.closeQuietly;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import au.com.bytecode.opencsv.CSVReader;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Inject;
import com.tyndalehouse.step.core.data.common.PartialDate;
import com.tyndalehouse.step.core.data.common.PrecisionType;
import com.tyndalehouse.step.core.data.entities.HotSpot;
import com.tyndalehouse.step.core.data.entities.ScriptureReference;
import com.tyndalehouse.step.core.data.entities.Timeband;
import com.tyndalehouse.step.core.data.entities.TimelineEvent;
import com.tyndalehouse.step.core.data.entities.reference.TimeUnitType;
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
    private static final String HOTSPOTS_CSV_DATA_FILE = "hotspot/hotspots.csv";
    private static final String TIMEBAND_CSV_DATA_FILE = "timeband/timebands.csv";

    // CHECKSTYLE:OFF column mappings, names could be different so turning checkstyle off
    private static final String TIMEBAND_SCALE_COLUMN = "scale";
    private static final String TIMEBAND_DESCRIPTION_COLUMN = "description";
    private static final String TIMEBAND_CODE_COLUMN = "code";
    private static final String HOTSPOT_SCALE_COLUMN = "scale";
    private static final String HOTSPOT_DESCRIPTION_COLUMN = "description";
    private static final String HOTSPOT_CODE_COLUMN = "code";
    private static final String HOTSPOT_TIMEBAND_COLUMN = "timeband";
    private static final String HOTSPOT_COLUMN_NAME = "Timeline";
    // CHECKSTYLE:ON

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

        final Map<String, Timeband> bands = loadTimebands();
        final Map<String, HotSpot> hotSpots = loadHotSpots(bands);
        final List<CsvData> timelineDataFiles = getTimelineDataFiles();
        final List<TimelineEvent> timelineEvents = loadTimelineEvents(hotSpots, timelineDataFiles);

        // finally persist to database
        this.ebean.save(timelineEvents);

        final long duration = System.currentTimeMillis() - currentTime;
        LOG.info("Took {}ms to load {} timeline events", Long.valueOf(duration), timelineEvents.size());

    }

    /**
     * Loads the hot spot data
     * 
     * @param bands the bands that represent the whole timeline, a hot spot is part of a specific band
     * 
     * @return a list of hot spots
     */
    private Map<String, HotSpot> loadHotSpots(final Map<String, Timeband> bands) {
        LOG.debug("Loading hot spot data");
        final Map<String, HotSpot> hotSpots = load(HOTSPOTS_CSV_DATA_FILE, new CsvDataMapper<HotSpot>() {
            @Override
            public HotSpot mapRow(final int rowNum, final CsvData data) {
                final HotSpot hs = new HotSpot();
                hs.setCode(data.getData(rowNum, HOTSPOT_CODE_COLUMN));
                hs.setDescription(data.getData(rowNum, HOTSPOT_DESCRIPTION_COLUMN));
                hs.setScale(TimeUnitType.valueOf(data.getData(rowNum, HOTSPOT_SCALE_COLUMN)));
                hs.setTimeband(bands.get(data.getData(rowNum, HOTSPOT_TIMEBAND_COLUMN)));
                return hs;
            }
        });

        return hotSpots;
    }

    /**
     * loads the timeband from file
     * 
     * @return the map of timebands loaded up.
     */
    private Map<String, Timeband> loadTimebands() {
        LOG.debug("Loading timeband data");
        final Map<String, Timeband> timebands = load(TIMEBAND_CSV_DATA_FILE, new CsvDataMapper<Timeband>() {
            @Override
            public Timeband mapRow(final int rowNum, final CsvData data) {
                final Timeband timeband = new Timeband();
                timeband.setCode(data.getData(rowNum, TIMEBAND_CODE_COLUMN));
                timeband.setDescription(data.getData(rowNum, TIMEBAND_DESCRIPTION_COLUMN));
                timeband.setScale(TimeUnitType.valueOf(data.getData(rowNum, TIMEBAND_SCALE_COLUMN)));
                return timeband;
            }
        });

        return timebands;
    }

    /**
     * Loads the timeline data from files
     * 
     * @param hotspots the hotspots loaded so far
     * @param csvDataFiles a set of csv data files that can be read
     * @return a set of timeline events
     * 
     */
    private List<TimelineEvent> loadTimelineEvents(final Map<String, HotSpot> hotspots,
            final List<CsvData> csvDataFiles) {
        LOG.debug("Loading timeline events data");
        final List<TimelineEvent> events = new ArrayList<TimelineEvent>();

        for (final CsvData data : csvDataFiles) {
            for (int ii = 0; ii < data.size(); ii++) {
                final TimelineEvent event = new TimelineEvent();
                final PartialDate from = parseDate(data.getData(ii, "From"));
                final PartialDate to = parseDate(data.getData(ii, "To"));

                event.setHotSpot(hotspots.get(data.getData(ii, HOTSPOT_COLUMN_NAME)));
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
