package com.tyndalehouse.step.core.data.loaders;

import static com.tyndalehouse.step.core.data.common.PartialDate.parseDate;

import com.tyndalehouse.step.core.data.common.PartialDate;
import com.tyndalehouse.step.core.data.common.PrecisionType;
import com.tyndalehouse.step.core.data.entities.impl.EntityIndexWriterImpl;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;

/**
 * Loads all historical data
 * 
 * @author chrisburrell
 * 
 */
public class TimelineStreamingCsvModuleLoader extends StreamingCsvModuleLoader {
    private final JSwordPassageService jsword;

    /**
     * sets up for reading a timeline event
     * 
     * @param writer the index writer
     * @param resourcePath the path to the resource
     * @param jsword access to jsword for populating references
     */
    public TimelineStreamingCsvModuleLoader(final EntityIndexWriterImpl writer, final String resourcePath,
            final JSwordPassageService jsword) {
        super(writer, resourcePath);
        this.jsword = jsword;
    }

    @Override
    protected void processFields(final String[] line, final String[] headerLine) {
        getWriter().addFieldToCurrentDocument("id", line[0]);
        getWriter().addFieldToCurrentDocument("name", line[1]);
        doPartialDate(line[2], "fromDate", "fromPrecision");
        doPartialDate(line[3], "toDate", "toPrecision");
        getWriter().addFieldToCurrentDocument("certainty", line[7]);
        getWriter().addFieldToCurrentDocument("flags", line[8]);

        // do references
        getWriter().addFieldToCurrentDocument("storedReferences", line[12]);
        getWriter().addFieldToCurrentDocument("references", this.jsword.getAllReferences(line[12], "ESV_th"));
    }

    /**
     * processes a partial date and adds as dateKey and precisionKey into document
     * 
     * @param value the value
     * @param dateKey the key for the date field
     * @param precisionKey the key for the precision field
     */
    private void doPartialDate(final String value, final String dateKey, final String precisionKey) {
        final PartialDate partialDate = parseDate(value);
        if (partialDate.getPrecision() != PrecisionType.NONE) {
            getWriter().addFieldToCurrentDocument(dateKey, partialDate.getDate());
            getWriter().addFieldToCurrentDocument(precisionKey, partialDate.getPrecision().name());
        }
    }
}
