package com.tyndalehouse.step.core.data.create;


/**
 * A simple interface for all module loaders to implement
 * 
 * @author cjburrell
 * 
 */
public interface ModuleLoader {
    /**
     * loads up the timeline data
     * 
     * @param scriptureReferences the scripture references that might be found as part of the loading
     */
    void init();

}
