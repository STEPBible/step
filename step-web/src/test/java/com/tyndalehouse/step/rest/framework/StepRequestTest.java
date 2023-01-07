package com.tyndalehouse.step.rest.framework;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * Tests that cache keys are constructed correctly
 */
public class StepRequestTest {
    private static final String UTF_8_ENCODING = "UTF-8";
    private static final String[] TEST_ARGS = new String[] { "arg1", "arg2", "arg3" };
    private static final String TEST_CONTROLLER_NAME = "Controller";
    private static final String TEST_METHOD_NAME = "method";
    private static final String TEST_URI = "uri/ControllerController/method/arg1/arg2/arg3";

    /**
     * a method key should not contain arguments, but contain controller name and method name
     */
    @Test
    public void testMethodKey() {
        final StepRequest stepRequest = getTestStepRequest();
        final String methodKey = stepRequest.getCacheKey().getMethodKey();
        assertTrue(methodKey.contains(TEST_CONTROLLER_NAME));
        assertTrue(methodKey.contains(TEST_METHOD_NAME));
        for (final String s : TEST_ARGS) {
            assertFalse(methodKey.contains(s));
        }
    }

    /**
     * A result key should contain controller, method and arguments
     */
    @Test
    public void testResultKey() {
        final StepRequest stepRequest = getTestStepRequest();
        final String resultsKey = stepRequest.getCacheKey().getResultsKey();
        assertTrue(resultsKey.contains(TEST_CONTROLLER_NAME));
        assertTrue(resultsKey.contains(TEST_METHOD_NAME));
        for (final String s : TEST_ARGS) {
            assertTrue(resultsKey.contains(s));
        }
    }

    /**
     * helper factory method
     * 
     * @return a step request
     */
    private StepRequest getTestStepRequest() {
        return new StepRequest(TEST_URI, TEST_CONTROLLER_NAME, TEST_METHOD_NAME, TEST_ARGS);
    }
}
