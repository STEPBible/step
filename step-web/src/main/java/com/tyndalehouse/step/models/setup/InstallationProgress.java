package com.tyndalehouse.step.models.setup;

import java.util.List;

/**
 * Encapsulates the response sent to the user - contains a log (useful for debugging)
 * and the total progress
 */
public class InstallationProgress {
    private final List<String> explanation;
    private int progress;

    /**
     * @param explanation the explanation of what has happened so far
     * @param progress    the amount of progress so far.
     */
    public InstallationProgress(final List<String> explanation, int progress) {
        this.explanation = explanation;
        this.progress = progress;
    }

    /**
     * @return a log of what has happened so far....
     */
    public List<String> getExplanation() {
        return explanation;
    }

    /**
     * @return the amount of progress so far
     */
    public int getProgress() {
        return progress;
    }
}
