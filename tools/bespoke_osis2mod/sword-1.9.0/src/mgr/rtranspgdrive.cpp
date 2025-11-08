/*****************************************************************************
 *
 *  rtranspgdrive.cpp -	RTransportGDrive
 *
 * $Id$
 *
 * Copyright 2004-2013 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ  85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 */

#include <rtranspgdrive.h>

#include <fcntl.h>

#include <swlog.h>


SWORD_NAMESPACE_START

namespace {

	struct FtpFile {
		const char *filename;
		FILE *stream;
		SWBuf *destBuf;
	};


	// initialize/cleanup SYSTEMWIDE library with life of this static.
	static class RTransportGDrive_init {
	public:
		RTransportGDrive_init() {
		}

		~RTransportGDrive_init() {
		}
	} _rTransportGDrive_init;


	static int my_fwrite(void *buffer, size_t size, size_t nmemb, void *stream) {
		struct FtpFile *out=(struct FtpFile *)stream;
		if (out && !out->stream && !out->destBuf) {
			/* open file for writing */
			out->stream=fopen(out->filename, "wb");
			if (!out->stream)
				return -1; /* failure, can't open file to write */
		}
		if (out->destBuf) {
			int s = (int)out->destBuf->size();
			out->destBuf->size(s+(size*nmemb));
			memcpy(out->destBuf->getRawData()+s, buffer, size*nmemb);
			return (int)nmemb;
		}
		return (int)fwrite(buffer, size, nmemb, out->stream);
	}


	struct MyProgressData {
		StatusReporter *sr;
		bool *term;
	};


	static int my_fprogress(void *clientp, double dltotal, double dlnow, double ultotal, double ulnow) {
		if (clientp) {
			MyProgressData *pd = (MyProgressData *)clientp;
SWLOGD("RTransportGDrive report progress: totalSize: %ld; xfered: %ld\n", (long)dltotal, (long)dlnow);
			if (pd->sr) {
				if (dltotal < 0) dltotal = 0;
				if (dlnow < 0) dlnow = 0;
				if (dlnow > dltotal) dlnow = dltotal;
				pd->sr->update(dltotal, dlnow);
			}
			if (*(pd->term)) return 1;
		}
		return 0;
	}
}


RTransportGDrive::RTransportGDrive(const char *host, StatusReporter *sr) : RemoteTransport(host, sr) {
	// session open
}


RTransportGDrive::~RTransportGDrive() {
	// session cleanup
}


char RTransportGDrive::putURL(const char *destURL, const char *sourcePath, SWBuf *sourceBuf) {
	return RemoteTransport::putURL(destURL, sourcePath, sourceBuf);
}
char RTransportGDrive::getURL(const char *destPath, const char *sourceURL, SWBuf *destBuf) {
	signed char retVal = 0;
	struct FtpFile ftpfile = {destPath, 0, destBuf};
#if 0
	
	if (session) {

		CURLcode res;

		struct MyProgressData pd;
		pd.sr = statusReporter;
		pd.term = &term;

		curl_easy_setopt(session, CURLOPT_URL, sourceURL);
	
		SWBuf credentials = u + ":" + p;
		curl_easy_setopt(session, CURLOPT_USERPWD, credentials.c_str());
		curl_easy_setopt(session, CURLOPT_WRITEFUNCTION, my_fwrite);
		if (!passive)
			curl_easy_setopt(session, CURLOPT_FTPPORT, "-");
		curl_easy_setopt(session, CURLOPT_NOPROGRESS, 0);
		curl_easy_setopt(session, CURLOPT_PROGRESSDATA, &pd);
		curl_easy_setopt(session, CURLOPT_PROGRESSFUNCTION, my_fprogress);
		curl_easy_setopt(session, CURLOPT_DEBUGFUNCTION, my_trace);
		/* Set a pointer to our struct to pass to the callback */
		curl_easy_setopt(session, CURLOPT_FILE, &ftpfile);

		/* Switch on full protocol/debug output */
		curl_easy_setopt(session, CURLOPT_VERBOSE, true);
		curl_easy_setopt(session, CURLOPT_CONNECTTIMEOUT, 45);
		
		/* FTP connection settings */

#if (LIBCURL_VERSION_MAJOR > 7) || \
   ((LIBCURL_VERSION_MAJOR == 7) && (LIBCURL_VERSION_MINOR > 10)) || \
   ((LIBCURL_VERSION_MAJOR == 7) && (LIBCURL_VERSION_MINOR == 10) && (LIBCURL_VERSION_PATCH >= 5))
#      define EPRT_AVAILABLE 1
#endif

#ifdef EPRT_AVAILABLE
		curl_easy_setopt(session, CURLOPT_FTP_USE_EPRT, 0);
SWLOGD("***** using CURLOPT_FTP_USE_EPRT\n");
#endif

		
SWLOGD("***** About to perform curl easy action. \n");
SWLOGD("***** destPath: %s \n", destPath);
SWLOGD("***** sourceURL: %s \n", sourceURL);
		res = curl_easy_perform(session);
SWLOGD("***** Finished performing curl easy action. \n");

		// it seems CURL tries to use this option data later for some reason, so we unset here
		curl_easy_setopt(session, CURLOPT_PROGRESSDATA, (void*)NULL);

		if(CURLE_OK != res) {
			retVal = -1;
		}
	}
#endif

	if (ftpfile.stream)
		fclose(ftpfile.stream); /* close the local file */

	return retVal;
}


SWORD_NAMESPACE_END

