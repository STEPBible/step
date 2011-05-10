package com.tyndalehouse.step.core.service.impl;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.data.DataDrivenTestExtension;
import com.tyndalehouse.step.core.service.TimelineService;

/**
 * tests the timeline service
 * 
 * @author Chris
 * 
 */
@RunWith(MockitoJUnitRunner.class)
public class TimelineServiceImplTest extends DataDrivenTestExtension {
    private static final Logger LOG = LoggerFactory.getLogger(FavouritesServiceImpl.class);
    private TimelineService ts;

    /**
     * sets up a few things to be able to test properly
     */
    @Before
    public void setUp() {
        this.ts = new TimelineServiceImpl(getEbean());
    }

    // /**
    // * tests that the syntax of the query is correct
    // */
    // @Test
    // public void testGetEventsInPeriodInRangePointInTime() {
    // final TimelineEvent inRange = createEventAndPersist(1000, "A");
    // final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(0),
    // new LocalDateTime(2000));
    //
    // LOG.debug("Event 1: [{}]", timelineEvents.get(0).getSummary());
    // LOG.debug("Event 2: [{}]", timelineEvents.get(1).getSummary());
    //
    // assertEquals(timelineEvents.size(), 1);
    // assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    // }
    //
    // /**
    // * tests that out of range events before/after do not get retrieved
    // */
    // @Test
    // public void testGetEventsInPeriodOutOfRangePointInTime() {
    // createEventAndPersist(1000, "A");
    // createEventAndPersist(2001, "B");
    // final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1001),
    // new LocalDateTime(2000));
    //
    // assertEquals(timelineEvents.size(), 0);
    // }
    //
    // /**
    // * tests that out of range events before/after do not get retrieved
    // */
    // @Test
    // public void testGetEventsInPeriodOverlapStartDuration() {
    // final TimelineEvent inRange = createEvent(500, 1100, "A");
    // final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
    // new LocalDateTime(2000));
    //
    // assertEquals(timelineEvents.size(), 1);
    // assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    // }
    //
    // /**
    // * tests that out of range events before/after do not get retrieved
    // */
    // @Test
    // public void testGetEventsInPeriodOverlapEndDuration() {
    // final TimelineEvent inRange = createEvent(1500, 2100, "A");
    // final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
    // new LocalDateTime(2000));
    //
    // assertEquals(timelineEvents.size(), 1);
    // assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    // }
    //
    // /**
    // * tests that out of range events before/after do not get retrieved
    // */
    // @Test
    // public void testGetEventsInPeriodContainedDuration() {
    // final TimelineEvent inRange = createEvent(1500, 1700, "A");
    // final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
    // new LocalDateTime(2000));
    //
    // assertEquals(timelineEvents.size(), 1);
    // assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    // }
    //
    // /**
    // * tests that out of range events before/after do not get retrieved
    // */
    // @Test
    // public void testGetEventsInPeriodOverflowDuration() {
    // final TimelineEvent inRange = createEvent(200, 2100, "A");
    // final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
    // new LocalDateTime(2000));
    //
    // assertEquals(timelineEvents.size(), 1);
    // assertEquals(timelineEvents.get(0).getSummary(), inRange.getSummary());
    // }
    //
    // /**
    // * tests that out of range events before/after do not get retrieved
    // */
    // @Test
    // public void testGetEventsOutOfRangeDuration() {
    // createEvent(200, 700, "A");
    // createEvent(2200, 2700, "B");
    // final List<TimelineEvent> timelineEvents = this.ts.getTimelineEvents(new LocalDateTime(1000),
    // new LocalDateTime(2000));
    //
    // assertEquals(timelineEvents.size(), 0);
    //
    // }
    //
    // /**
    // * creates a duration event
    // *
    // * @param startTime start of event
    // * @param endTime end of event
    // * @param summary summary of event
    // * @return a single timeline event
    // */
    // private TimelineEvent createEvent(final int startTime, final int endTime, final String summary) {
    // final TimelineEvent te = createEvent(startTime, summary);
    // te.setToDate(new LocalDateTime(endTime));
    // getEbean().save(te);
    // return te;
    // }
    //
    // /**
    // * a helper method to create an event
    // *
    // * @param startTime the time of creation
    // * @param summary the summary
    // * @return the event that was creates and persisted
    // */
    // private TimelineEvent createEventAndPersist(final int startTime, final String summary) {
    // final TimelineEvent te = createEvent(startTime, summary);
    // getEbean().save(te);
    // return te;
    // }
    //
    // /**
    // * creates the event without persisting
    // *
    // * @param startTime the start time of the event
    // * @param summary the summary
    // * @return the event created
    // */
    // private TimelineEvent createEvent(final int startTime, final String summary) {
    // final TimelineEvent te = new TimelineEvent();
    // te.setFromDate(new LocalDateTime(startTime));
    // te.setSummary(summary);
    // return te;
    // }

    @Test
    public void temporaryTest() {

    }
}
