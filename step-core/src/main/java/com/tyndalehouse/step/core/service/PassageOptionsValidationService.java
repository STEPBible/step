package com.tyndalehouse.step.core.service;

import com.tyndalehouse.step.core.models.AvailableFeatures;
import com.tyndalehouse.step.core.models.InterlinearMode;
import com.tyndalehouse.step.core.models.LookupOption;
import com.tyndalehouse.step.core.models.TrimmedLookupOption;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface PassageOptionsValidationService {
    /**
     * Translates the options provided over the HTTP interface to something palatable by the service layer
     *
     * @param options the list of options, comma-separated.
     * @return a list of {@link com.tyndalehouse.step.core.models.LookupOption}
     */
    List<LookupOption> getLookupOptions(String options);

    /**
     * Trims the options down to what is supported by the version.
     *
     * @param options              the options
     * @param version              the version that is being selected
     * @param extraVersions        the secondary selected versions
     * @param mode                 the display mode, because we remove some options depending on what is selected
     * @param trimmingExplanations can be null, if provided then it is populated with the reasons why an option has been
     *                             removed. If trimmingExplanations is not null, then it is assume that we do not want
     *                             to rewrite the displayMode
     * @return a new list of options where both list have been intersected.
     */
    Set<LookupOption> trim(List<LookupOption> options, String version, List<String> extraVersions,
                           InterlinearMode mode, List<TrimmedLookupOption> trimmingExplanations);


    /**
     * Similary to trim(), but provides the final display mode as well as the originating display mode
     *
     * @param options              the options
     * @param version              the version that is being selected
     * @param extraVersions        the secondary selected versions
     * @param mode                 the original display mode, because we remove some options depending on what is
     *                             selected
     * @param finalMode            the final display mode, because we remove some options depending on what is selected
     * @param trimmingExplanations can be null, if provided then it is populated with the reasons why an option has been
     *                             removed. If trimmingExplanations is not null, then it is assume that we do not want
     *                             to rewrite the displayMode
     * @return a new list of options where both list have been intersected.
     */
    Set<LookupOption> trim(List<LookupOption> options, String version, List<String> extraVersions,
                           InterlinearMode mode, InterlinearMode finalMode, List<TrimmedLookupOption> trimmingExplanations);

    /**
     * Determine display mode: which if NONE and there are interlinear options, we override to interlinear. If we're not
     * explaining options (but rather getting the full list of options), then we simply return the passed in display
     * mode.
     *
     * @param options  the options
     * @param mode     the mode
     * @param override true if overrides are allowed
     * @return the interlinear mode
     */
    InterlinearMode determineDisplayMode(List<LookupOption> options,
                                         InterlinearMode mode,
                                         boolean override);

    /**
     * Gets the available features for version.
     *
     * @param version          the version
     * @param displayMode      the display mode
     * @param finalDisplayMode the final mode as calculated
     * @return the available features for version
     */
    AvailableFeatures getAvailableFeaturesForVersion(String version, List<String> extraVersions,
                                                     String displayMode, InterlinearMode finalDisplayMode);

    /**
     * @param interlinearMode a selected interlinear mode
     * @return returns NONE if null, or the value of String as a InterlinearMode enumeration.
     */
    InterlinearMode getDisplayMode(String interlinearMode, String mainBook, List<String> extraVersions);

    /**
     * @param options the available features to this version
     * @return the options in coded form
     */
    String optionsToString(Collection<LookupOption> options);

}
