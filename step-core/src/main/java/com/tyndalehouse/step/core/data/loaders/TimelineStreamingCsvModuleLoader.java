//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119package com.tyndalehouse.step.core.data.loaders;
//pt20201119
//pt20201119import static com.tyndalehouse.step.core.data.common.PartialDate.parseDate;
//pt20201119
//pt20201119import com.tyndalehouse.step.core.data.common.PartialDate;
//pt20201119import com.tyndalehouse.step.core.data.common.PrecisionType;
//pt20201119import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
//pt20201119import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Loads all historical data
 * 
 * @author chrisburrell
 * 
 */
//pt20201119public class TimelineStreamingCsvModuleLoader extends StreamingCsvModuleLoader {
//pt20201119    private final JSwordPassageService jsword;
//pt20201119
//pt20201119    /**
//pt20201119     * sets up for reading a timeline event
//pt20201119     *
//pt20201119     * @param writer the index writer
//pt20201119     * @param resourcePath the path to the resource
//pt20201119     * @param jsword access to jsword for populating references
//pt20201119     */
//pt20201119    public TimelineStreamingCsvModuleLoader(final EntityIndexWriterImpl writer, final String resourcePath,
//pt20201119            final JSwordPassageService jsword) {
//pt20201119        super(writer, resourcePath);
//pt20201119        this.jsword = jsword;
//pt20201119    }
//pt20201119
//pt20201119    @Override
//pt20201119    protected void processFields(final String[] line, final String[] headerLine) {
//pt20201119        getWriter().addFieldToCurrentDocument("id", line[0]);
//pt20201119        getWriter().addFieldToCurrentDocument("name", line[1]);
//pt20201119        doPartialDate(line[2], "fromDate", "fromPrecision");
//pt20201119        doPartialDate(line[3], "toDate", "toPrecision");
//pt20201119        getWriter().addFieldToCurrentDocument("certainty", line[7]);
//pt20201119        getWriter().addFieldToCurrentDocument("flags", line[8]);
//pt20201119
//pt20201119        // do references
//pt20201119        getWriter().addFieldToCurrentDocument("storedReferences", line[12]);
//pt20201119        getWriter().addFieldToCurrentDocument("references", this.jsword.getAllReferences(line[12], "ESV_th"));
//pt20201119    }
//pt20201119
//pt20201119    /**
//pt20201119     * processes a partial date and adds as dateKey and precisionKey into document
//pt20201119     *
//pt20201119     * @param value the value
//pt20201119     * @param dateKey the key for the date field
//pt20201119     * @param precisionKey the key for the precision field
//pt20201119     */
//pt20201119    private void doPartialDate(final String value, final String dateKey, final String precisionKey) {
//pt20201119        final PartialDate partialDate = parseDate(value);
//pt20201119        if (partialDate.getPrecision() != PrecisionType.NONE) {
//pt20201119            getWriter().addFieldToCurrentDocument(dateKey, partialDate.getDate());
//pt20201119            getWriter().addFieldToCurrentDocument(precisionKey, partialDate.getPrecision().name());
//pt20201119        }
//pt20201119    }
//pt20201119}
