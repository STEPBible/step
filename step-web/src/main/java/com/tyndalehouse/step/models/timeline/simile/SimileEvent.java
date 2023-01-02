package com.tyndalehouse.step.models.timeline.simile;

import com.tyndalehouse.step.models.timeline.DigestableTimeline;

import java.io.Serializable;
import java.util.Random;

/**
 * This represents the following fragment:
 * <p/>
 * <pre>
 *      {'start': '-1262',
 *       'title': 'Barfusserkirche',
 *         'description': 'by Lyonel Feininger, American/German Painter, 1871-1956',
 *         'image': 'http://images.allposters.com/images/AWI/NR096_b.jpg',
 *         'link': 'http://www.allposters.com/-sp/Barfusserkirche-1924-Posters_i1116895_.htm'
 *         },
 * </pre>
 *
 * @author chrisburrell
 */
public class SimileEvent implements DigestableTimeline, Serializable {
    private static final long serialVersionUID = -7725905171349065886L;
    private String start;
    private String end;
    private boolean duration;
    private String title;
    private String description;
    private int hotSpotId;
    private String eventId;

    private String image;
    private String link;
    private String startPrecision;
    private String endPrecision;
    private String certainty;
    private String flags;

    public String getStartdate() {
        return this.start;
    }

    public String getDate_display() {
        if ("YEAR".equalsIgnoreCase(certainty)) {
            return "ye";
        } else if ("MONTH".equalsIgnoreCase(certainty)) {
            return "mo";
        } else {
            return "da";
        }
    }

    public String getIcon() {
        int r = new Random().nextInt() % 7;
        switch (r) {
            case 0:
                return "triangle_orange.png";
            case 1:
                return "square_gray.png";
            case 2:
                return "triangle_yellow.png";
            case 3:
                return "triangle_green.png";
            case 4:
                return "square_blue.png";
            case 5:
                return "circle_blue.png";
            case 6:
                return "circle_purple.png";
        }

        return "circle_purple.png";
    }

    public String getId() {
        return getEventId();
    }

    public String getImportance() {
        return "50";
    }

    public int getHigh_threshold() {
        return 50;
    }

    /**
     * @return the start
     */
    public String getStart() {
        return this.start;
    }

    /**
     * @param start the start to set
     */
    public void setStart(final String start) {
        this.start = start;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return this.title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(final String title) {
        this.title = title;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * @return the image
     */
    public String getImage() {
        return this.image;
    }

    /**
     * @param image the image to set
     */
    public void setImage(final String image) {
        this.image = image;
    }

    /**
     * @return the link
     */
    public String getLink() {
        return this.link;
    }

    /**
     * @param link the link to set
     */
    public void setLink(final String link) {
        this.link = link;
    }

    /**
     * @return the end
     */
    public String getEnd() {
        return this.end;
    }

    /**
     * @param end the end to set
     */
    public void setEnd(final String end) {
        this.end = end;
    }

    /**
     * @return the duration
     */
    public boolean isDuration() {
        return this.duration;
    }

    /**
     * @param duration the duration to set
     */
    public void setDuration(final boolean duration) {
        this.duration = duration;
    }

    /**
     * @return the hotspotId
     */
    public int getHotSpotId() {
        return this.hotSpotId;
    }

    /**
     * @param hotSpotId the hotSpotId to set
     */
    public void setHotSpotId(final int hotSpotId) {
        this.hotSpotId = hotSpotId;
    }

    /**
     * @return the eventId
     */
    public String getEventId() {
        return this.eventId;
    }

    /**
     * @param eventId the eventId to set
     */
    public void setEventId(final String eventId) {
        this.eventId = eventId;
    }

    /**
     * @return the startPrecision
     */
    public String getStartPrecision() {
        return this.startPrecision;
    }

    /**
     * @param startPrecision the startPrecision to set
     */
    public void setStartPrecision(final String startPrecision) {
        this.startPrecision = startPrecision;
    }

    /**
     * @return the endPrecision
     */
    public String getEndPrecision() {
        return this.endPrecision;
    }

    /**
     * @param endPrecision the endPrecision to set
     */
    public void setEndPrecision(final String endPrecision) {
        this.endPrecision = endPrecision;
    }

    /**
     * @return the certainty
     */
    public String getCertainty() {
        return this.certainty;
    }

    /**
     * @param certainty the certainty to set
     */
    public void setCertainty(final String certainty) {
        this.certainty = certainty;
    }

    /**
     * @return the flags
     */
    public String getFlags() {
        return this.flags;
    }

    /**
     * @param flags the flags to set
     */
    public void setFlags(final String flags) {
        this.flags = flags;
    }
}
