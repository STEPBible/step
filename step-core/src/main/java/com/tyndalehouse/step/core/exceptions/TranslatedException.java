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
package com.tyndalehouse.step.core.exceptions;

/**
 * The default exception to be thrown throughout the application. It is of type {@link RuntimeException} so
 * that it does not require explicit catching
 * 
 * @author chrisburrell
 * 
 */
public class TranslatedException extends StepInternalException {
    private static final long serialVersionUID = -1083871793637352613L;
    private final String message;
    private final String[] args;

    /**
     * creates the generic step internal exception to be used on the server.
     * 
     * @param t the cause of the exception
     * @param message the message for the exception
     * @param args the args to the localised message key
     */
    public TranslatedException(final Throwable t, final String message, final String... args) {
        super(t.getMessage(), t);
        this.message = message;
        this.args = args;
    }

    /**
     * creates the generic runtime exception to be used on the server.
     * 
     * @param message the message
     * @param args the args to the localised message key
     */
    public TranslatedException(final String message, final String... args) {
        super(message);
        this.message = message;
        this.args = args;
    }

    /**
     * @return the message
     */
    @Override
    public String getMessage() {
        final StringBuilder sb = new StringBuilder();
        sb.append(this.message);
        for(String a : args) {
            sb.append(a);
            sb.append(", ");
        }
        return this.message;
    }

    /**
     * @return the args
     */
    public Object[] getArgs() {
        return this.args;
    }
}
