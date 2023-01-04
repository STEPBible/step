package com.tyndalehouse.step.models.timeline.simile;

import static com.tyndalehouse.step.core.utils.ConversionUtils.epochMinutesStringToLocalDateTime;

import java.util.ArrayList;
import java.util.List;

import org.joda.time.LocalDateTime;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.models.TimelineTranslator;
import com.tyndalehouse.step.models.timeline.DigestableTimeline;

/**
 * provides a way of
 */
public class SimileTimelineTranslatorImpl implements TimelineTranslator {
    private static final String SIMILE_DEFAULT_TIME_FORMAT = "iso8601";

    @Override
    public DigestableTimeline toDigestableForm(final EntityDoc[] events, final LocalDateTime suggestedDate) {
        final SimileTimelineImpl timeline = new SimileTimelineImpl();

        timeline.setLegend(getLegendItems());

        timeline.setDateTimeFormat(SIMILE_DEFAULT_TIME_FORMAT);

        final List<SimileEvent> eventList = new ArrayList<SimileEvent>();
        for (final EntityDoc te : events) {
            final SimileEvent e = translateEvent(te);
            eventList.add(e);
        }

        timeline.setEvents(eventList);

        if (suggestedDate != null) {
            timeline.setSuggestedDate(suggestedDate.toString());
        }
        return timeline;
    }

    private List<LegendItem> getLegendItems() {
        final List<LegendItem> legendItems = new ArrayList<>();
        add(legendItems, "A something", "triangle_orange.png");
        add(legendItems, "B something", "square_gray.png");
        add(legendItems, "CD", "triangle_yellow.png");
        add(legendItems, "D", "triangle_green.png");
        add(legendItems, "E", "circle_green.png");
        add(legendItems, "F", "square_blue.png");
        add(legendItems, "G", "circle_blue.png");
        add(legendItems, "H", "circle_purple.png");

        return legendItems;
    }

    private void add(final List<LegendItem> legendItems, final String s, final String s1) {
        LegendItem t = new LegendItem();
        t.setTitle(s);
        t.setIcon(s1);
        legendItems.add(t);
    }

    @Override
    public SimileEvent translateEvent(final EntityDoc te) {
        final SimileEvent e = new SimileEvent();
        final String name = te.get("name");
        e.setTitle(name);
        e.setDescription(name);
        e.setStart(epochMinutesStringToLocalDateTime(te.get("fromDate")).toString());
        e.setEventId(te.get("id"));
        e.setCertainty(te.get("certainty"));
        e.setFlags(te.get("flags"));

        e.setStartPrecision(te.get("fromPrecision"));

        final String toDate = te.get("toDate");
        if (toDate != null) {
            final LocalDateTime dt = epochMinutesStringToLocalDateTime(toDate);
            e.setEnd(dt.toString());
            e.setEndPrecision(te.get("toPrecision"));
            e.setDuration(true);
        } else {
            e.setDuration(false);
        }
        return e;
    }
}
