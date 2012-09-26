/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project All rights
 * reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. Neither the name of the Tyndale House, Cambridge
 * (www.TyndaleHouse.com) nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
step.state.view = {
            storeDetail : function(level) {
                $.cookie("detailLevel", level);
            },

            getDetail : function() {
                var level = $.cookie("detailLevel");
                if (level != null || level == "") {
                    return parseInt(level);
                } else {
                    $.cookie("detailLevel", 0);
                }
            },

            getView : function() {
              var view = $.cookie("viewType");
              if(view == undefined || view == "") {
                  view = "SINGLE_COLUMN_VIEW";
                  this.storeView(view);
                  
              }
              return view;
            },
            
            storeView : function(viewName) { 
                $.cookie("viewType", viewName);
            },
            
            restore: function() {
                var current = this.getDetail();
                if(current == null) {
                    current = step.defaults.detailLevel;
                }
                
                step.menu.tickMenuItem($("li[menu-name = 'VIEW'] ul li a[level]").get(current));
                
                
                var view = this.getView();
                step.menu.tickMenuItem($("li[menu-name = 'VIEW'] ul li a[name='" + view + "']"));
            }
};
