package com.tyndalehouse.step.rest.framework;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

/**
 * Tests that cache keys are constructed correctly
 * 
 * @author Chris
 * 
 */
public class StepRequestTest {
    final String[] args = new String[] { "arg1", "arg2", "arg3" };
    String testControllerName = "Controller";
    String testMethodName = "method";

    /**
     * a method key should not contain arguments, but contain controller name and method name
     */
    @Test
    public void testMethodKey() {
        final StepRequest stepRequest = getTestStepRequest();
        final String methodKey = stepRequest.getCacheKey().getMethodKey();
        assertTrue(methodKey.contains(this.testControllerName));
        assertTrue(methodKey.contains(this.testMethodName));
        for (final String s : this.args) {
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
        assertTrue(resultsKey.contains(this.testControllerName));
        assertTrue(resultsKey.contains(this.testMethodName));
        for (final String s : this.args) {
            assertTrue(resultsKey.contains(s));
        }

    }

    /**
     * helper factory method
     * 
     * @return a step request
     */
    private StepRequest getTestStepRequest() {
        return new StepRequest(this.testControllerName, this.testMethodName, this.args);
    }
}
