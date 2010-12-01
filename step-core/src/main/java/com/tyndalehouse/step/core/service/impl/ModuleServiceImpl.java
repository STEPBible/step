package com.tyndalehouse.step.core.service.impl;

import static org.apache.commons.lang.StringUtils.split;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.models.Definition;
import com.tyndalehouse.step.core.service.JSwordService;
import com.tyndalehouse.step.core.service.ModuleService;
import com.tyndalehouse.step.core.utils.StringConversionUtils;

/**
 * Looks up module information, for example lexicon definitions for particular references
 * 
 * @author Chris Burrell
 * 
 */
public class ModuleServiceImpl implements ModuleService {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private Map<String, String> defaultModuleLexicons;

    @Autowired
    private JSwordService jsword;

    public Definition getDefinition(final String reference) {
        final String lookupModule = getLookupModule(reference);
        if (lookupModule != null) {
            return new Definition(reference, this.jsword.getOsisText(lookupModule,
                    StringConversionUtils.getAnyKey(reference, false)));
        }

        this.logger.warn("No module could be found for [{}]", reference);
        return null;
    }

    public List<Definition> getDefinitions(final String references) {
        // first we split the definitions in separate parts
        final String[] refs = split(references);

        if (refs == null) {
            throw new StepInternalException("No references were provided");
        }

        final List<Definition> defs = new ArrayList<Definition>();
        for (final String r : refs) {
            this.logger.debug("Looking up {}", r);
            final Definition definition = getDefinition(r);
            if (definition != null) {
                defs.add(definition);
            }
        }

        return defs;
    }

    /**
     * TODO: later we can drive this with a dropdown on the UI Based on the reference provided, we determine the correct
     * module to lookup
     * 
     * @param reference the reference to base the lookup option on
     * @return the initials of the module to lookup
     */
    String getLookupModule(final String reference) {
        for (final Entry<String, String> e : this.defaultModuleLexicons.entrySet()) {
            if (reference.startsWith(e.getKey())) {
                return e.getValue();
            }
        }
        return null;
    }

    /**
     * @param defaultModuleLexicons the defaultModuleLexicons to set
     */
    public void setDefaultModuleLexicons(final Map<String, String> defaultModuleLexicons) {
        this.defaultModuleLexicons = defaultModuleLexicons;
    }

}
