package com.tyndalehouse.step.rest.framework;

import java.sql.Timestamp;

import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import com.avaje.ebeaninternal.server.text.json.DefaultJsonValueAdapter;

/**
 * we override the default JSON value adapter to provide custom serialisation for dates
 * 
 * @author Chris
 * 
 */
public class StepJsonValueAdapter extends DefaultJsonValueAdapter {
    private final DateTimeFormatter iso8601 = DateTimeFormat.forPattern("\"yyyy-MM-dd'T'HH:mm:ss.SSS\"");

    @Override
    public String jsonFromTimestamp(final Timestamp date) {
        return this.iso8601.print(date.getTime());
    }
}
