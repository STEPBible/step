/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.models;

/**
 * Outlines a list of options available in lookup
 * 
 * @author Chris Burrell
 * 
 */
public class EnrichedLookupOption {
    private final String displayName;
    private final String key;
    private final boolean enabledByDefault;

    /**
     * constructs an enriched version of the lookup option
     * 
     * @param displayName name to be displayed on the client
     * @param key the key to be used for communicating with the server
     * @param enabledByDefault true to signify the UI should enable the button by default
     */
    public EnrichedLookupOption(final String displayName, final String key, final boolean enabledByDefault) {
        this.displayName = displayName;
        this.key = key;
        this.enabledByDefault = enabledByDefault;
    }

    /**
     * @return the display name as should be shown on the screen
     */
    public String getDisplayName() {
        return this.displayName;
    }

    /**
     * @return The key to use to reference this item when sending it back to the server
     */
    public String getKey() {
        return this.key;
    }

    /**
     * @return the enabledByDefault
     */
    public boolean isEnabledByDefault() {
        return this.enabledByDefault;
    }
}
