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

if(!step) {
    step = {};
}

step.firstTime = {
        complete : false,
        
        init : function() {
            var self = this;
            
            self.addProgressItem(__s.starting_installation);
            self.delayProgressUpdate();
            
            $.get(SETUP_INSTALL_FIRST_TIME, function(data) {
                //do nothing here
            });
        },
        
        delayProgressUpdate : function() {
          //now start a timer thread that updates the page regularly.
            setTimeout(function() {
                step.firstTime.updateProgress();
            }, 1000);            
        },
        
        updateProgress : function() {
            var self = this;
            if(!step.firstTime.complete) {
                $.get(SETUP_GET_PROGRESS, function(data) {
                    if(!data || data.length == 0) {
                        //add '.' to last entry
                        var lastEntry = $("#progressStatus li:last span");
                        lastEntry.html(lastEntry.html() + ".");
                        
                        //check if complete
                        step.firstTime.checkComplete();
                    } else {
                        $.each(data, function(i, item) {
                            self.addProgressItem(item);
                        });
                    }
                });
                step.firstTime.delayProgressUpdate();
            }
        },
        
        addProgressItem : function(text) {
            $("#progressStatus").append("<li><b style='color: #33339F'>" + new Date().toLocaleTimeString() + "</b> <span>" + text + "</span></li>");
            $("#progressStatus").parent().scrollTop($("#progressStatus").parent()[0].scrollHeight);
        },
        
        checkComplete : function(text) {
            //checks whether the process is finished
            $.get(SETUP_IS_COMPLETE, function(data) {
                if(data) {
                    step.firstTime.complete = true;
                    
                    //now redirect to setup page where a user can choose which bible to install
                    window.location.href="config.jsp";
                }
            });
        },
}

$(document).ready(function() {
	step.firstTime.init();
});

