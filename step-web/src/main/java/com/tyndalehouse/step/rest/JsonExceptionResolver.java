package com.tyndalehouse.step.rest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ModelAndView;

public class JsonExceptionResolver implements HandlerExceptionResolver {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    public ModelAndView resolveException(final HttpServletRequest request, final HttpServletResponse response,
            final Object handler, final Exception exception) {

        this.logger.error(exception.getMessage(), exception);

        final ModelAndView mav = new ModelAndView();
        mav.setViewName("MappingJacksonJsonView");
        mav.addObject("error", exception.getMessage());
        return mav;
    }
}
