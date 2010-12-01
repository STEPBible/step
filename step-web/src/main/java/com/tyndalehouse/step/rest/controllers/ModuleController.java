package com.tyndalehouse.step.rest.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.tyndalehouse.step.core.service.ModuleService;

@RequestMapping(value = "/module", method = RequestMethod.GET)
@Controller
public class ModuleController {
    @Autowired
    private ModuleService moduleDefintions;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * a REST method that returns version of the Bible that are available
     * 
     * @param reference a reference for a module to lookup
     * @return all versions of modules that are considered to be Bibles.
     */
    @RequestMapping(value = "/definitions/{reference}")
    public @ResponseBody
    String getDefinition(@PathVariable final String reference) {
        this.logger.debug("Getting definition for {}", reference);
        return this.moduleDefintions.getDefinition(reference).getExplanation();
    }
}
