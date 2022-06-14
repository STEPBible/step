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
package com.tyndalehouse.step.rest.controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tyndalehouse.step.core.exceptions.StepInternalException;
import com.tyndalehouse.step.core.utils.IOUtils;

/**
 * Serves the images by downloading them from a remote source if they do not already exist.
 * 
 * @author chrisburrell
 * 
 */
@Singleton
public class ImageController extends HttpServlet {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 1721159652548642069L;

    /** The Constant LOGGER. */
    private static final Logger LOGGER = LoggerFactory.getLogger(ImageController.class);

    /** The local source. */
    private final String localSource;

    /** The remote source. */
    private final String remoteSource;

    /**
     * Instantiates a new image controller.
     * 
     * @param localSource a local place where files might be found
     * @param remoteSource a remote place where files might be found
     */
    @Inject
    public ImageController(@Named("app.images.localSource") final String localSource,
            @Named("app.images.remoteSource") final String remoteSource) {
        this.localSource = localSource;
        this.remoteSource = remoteSource;
    }

    @Override
    protected void doGet(final HttpServletRequest req, final HttpServletResponse response) {
        try {
            final String pathToImage = req.getRequestURI().substring(
                    req.getContextPath().length() + req.getServletPath().length());
            final File image = new File(this.localSource, pathToImage);
            if (!image.exists()) {
                // fetch from web and write out
                download(image, pathToImage, response);
                return;
            }

            LOGGER.trace("Returning image locally stored at: ", image.getAbsolutePath());
            writeImage(image, response);
        } catch (final StepInternalException ex) {
            LOGGER.warn("An exception has occurred - image cannot be sent back", ex);
        }
    }

    /**
     * Downloads the image locally from the server.
     * 
     * @param image the image file
     * @param pathToImage the path to the image
     * @param response the response for the user
     */
    private void download(final File image, final String pathToImage, final HttpServletResponse response) {
        final HttpGet get = new HttpGet(this.remoteSource + pathToImage);
        final HttpClient client = HttpClientBuilder.create().build();

        // two streams for downloading
        OutputStream fileOutput = null;
        InputStream inputStream = null;

        try {
            final HttpResponse remoteResponse = client.execute(get);
            if (remoteResponse.getStatusLine().getStatusCode() != 200) {
                response.setStatus(remoteResponse.getStatusLine().getStatusCode());
                throw new StepInternalException("Unable to obtain image remotely");
            }

            final HttpEntity entity = remoteResponse.getEntity();
            inputStream = entity.getContent();
            long contentLength = entity.getContentLength();
            if (contentLength < 0) {
                contentLength = Integer.MAX_VALUE;
            }

            // read the input from the external source
            final int imageDataLength = (int) contentLength;
            final byte[] imageData = new byte[imageDataLength];
            inputStream.read(imageData, 0, imageDataLength);

            // write to the file
            fileOutput = new FileOutputStream(image);
            fileOutput.write(imageData, 0, imageDataLength);

            // while we have the data, let's write it to the response
            prepareImageResponse(imageDataLength, image.getName(), response);
            response.getOutputStream().write(imageData, 0, imageDataLength);
        } catch (final IOException e) {
            throw new StepInternalException("Unable to obtain image remotely", e);
        } finally {
            IOUtils.closeQuietly(inputStream);
            IOUtils.closeQuietly(fileOutput);
        }
    }

    /**
     * writes the image to the response stream.
     * 
     * @param image the image
     * @param response the response stream
     */
    private void writeImage(final File image, final HttpServletResponse response) {
        FileInputStream fileInputStream = null;
        try {
            fileInputStream = new FileInputStream(image);

            writeResponse(image, response, fileInputStream);

        } catch (final IOException e) {
            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
            throw new StepInternalException("Failed to write image to output response stream", e);
        } finally {
            IOUtils.closeQuietly(fileInputStream);
        }
    }

    /**
     * Writes the content type, length and data to the response stream.
     * 
     * @param image the source image
     * @param response the response
     * @param bufferedInputStream the input stream
     * @throws IOException an exception while reading the file
     */
    private void writeResponse(final File image, final HttpServletResponse response,
            final InputStream bufferedInputStream) throws IOException {

        // set the content size and mime type
        prepareImageResponse(getValidImageSize(image, response), image.getName(), response);
        writeImageDataBuffer(bufferedInputStream, getValidImageSize(image, response),
                response.getOutputStream());

    }

    /**
     * sets content length and content type.
     * 
     * @param size the size of the file
     * @param path the path to the image, used to extract the file extension
     * @param response the user response
     */
    private void prepareImageResponse(final int size, final String path, final HttpServletResponse response) {
        response.setContentLength(size);
        response.setContentType("image/" + path.substring(path.lastIndexOf('.')));
    }

    /**
     * Checks the image size and returns.
     * 
     * @param image the image file
     * @param response the response
     * @return the size of the image, in bytes
     */
    private int getValidImageSize(final File image, final HttpServletResponse response) {
        final long imageSize = image.length();
        if (imageSize > Integer.MAX_VALUE) {
            // do something different
            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
            throw new StepInternalException("File is too big, not yet implemented: "
                    + image.getAbsolutePath());
        }

        return (int) imageSize;
    }

    /**
     * Write image data buffer.
     * 
     * @param bufferedInputStream an input stream to the image
     * @param imageSize the size of the image
     * @param outputStream an output stream response
     * @throws IOException any exception while reading
     */
    private void writeImageDataBuffer(final InputStream bufferedInputStream, final int imageSize,
            final OutputStream outputStream) throws IOException {
        final byte[] imageData = new byte[imageSize];
        bufferedInputStream.read(imageData, 0, imageSize);
        outputStream.write(imageData);
    }
}
