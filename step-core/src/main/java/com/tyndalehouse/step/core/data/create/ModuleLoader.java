package com.tyndalehouse.step.core.data.create;

/**
 * A simple interface for all module loaders to implement
 * 
 * @author cjburrell
 * 
 */
public interface ModuleLoader {
    /**
     * loads up the data
     * 
     * @param mainLoader the loader to which to write updates
     */
    void init(Loader mainLoader);

}
