package com.tyndalehouse.step.rest.framework;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Locale;

import com.avaje.ebeaninternal.server.text.json.DefaultJsonValueAdapter;

/**
 * we override the default JSON value adapter to provide custom serialisation for dates
 * 
 * @author Chris
 * 
 */
public class StepJsonValueAdapter extends DefaultJsonValueAdapter {
    @Override
    public String jsonFromTimestamp(final Timestamp date) {
        final SimpleDateFormat sdf = new SimpleDateFormat("\"EEE, d MMM yyyy HH:mm:ss Z\"",
                Locale.getDefault());
        return sdf.format(date);
    }
}
