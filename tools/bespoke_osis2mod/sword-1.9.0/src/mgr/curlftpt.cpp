/*****************************************************************************
 *
 *  curlftpt.cpp -	CURLFTPTransport
 *
 * $Id: curlftpt.cpp 3822 2020-11-03 18:54:47Z scribe $
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

#include <curlftpt.h>

#include <filemgr.h>

#include <curl/curl.h>
#include <curl/easy.h>

#include <swlog.h>


SWORD_NAMESPACE_START

namespace {

	struct FtpFile {
		const char *filename;
		int fd;
		SWBuf *destBuf;
	};


	// initialize/cleanup SYSTEMWIDE library with life of this static.
	static class CURLFTPTransport_init {
	public:
		CURLFTPTransport_init() {
			curl_global_init(CURL_GLOBAL_DEFAULT);  // curl_easy_init automatically calls it if needed
		}

		~CURLFTPTransport_init() {
			curl_global_cleanup();
		}
	} _curlFTPTransport_init;


	static int my_fwrite(void *buffer, size_t size, size_t nmemb, void *stream) {
		struct FtpFile *out = (struct FtpFile *)stream;
		if (out && !out->fd && !out->destBuf) {
			/* open file for writing */
			out->fd = FileMgr::createPathAndFile(out->filename);
			if (out->fd < 0)
				return -1; /* failure, can't open file to write */
		}
		if (out->destBuf) {
			int s = (int)out->destBuf->size();
			out->destBuf->size(s+(size*nmemb));
			memcpy(out->destBuf->getRawData()+s, buffer, size*nmemb);
			return (int)nmemb;
		}
		return (int)FileMgr::write(out->fd, buffer, size * nmemb);
	}


	struct MyProgressData {
		StatusReporter *sr;
		bool *term;
	};


	static int my_fprogress(void *clientp, double dltotal, double dlnow, double ultotal, double ulnow) {
		if (clientp) {
			MyProgressData *pd = (MyProgressData *)clientp;
SWLOGD("CURLFTPTransport report progress: totalSize: %ld; xfered: %ld\n", (long)dltotal, (long)dlnow);
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


	static int my_trace(CURL *handle, curl_infotype type, unsigned char *data, size_t size, void *userp) {
		SWBuf header;
		(void)userp; /* prevent compiler warning */
		(void)handle; /* prevent compiler warning */

		switch (type) {
		case CURLINFO_TEXT: header = "TEXT"; break;
		case CURLINFO_HEADER_OUT: header = "=> Send header"; break;
		case CURLINFO_HEADER_IN: header = "<= Recv header"; break;
		
		// these we don't want to log (HUGE)
		case CURLINFO_DATA_OUT: header = "=> Send data";
		case CURLINFO_SSL_DATA_OUT: header = "=> Send SSL data";
		case CURLINFO_DATA_IN: header = "<= Recv data"; 
		case CURLINFO_SSL_DATA_IN: header = "<= Recv SSL data";
		default: /* in case a new one is introduced to shock us */
			return 0;
		}
		
		if (size > 120) size = 120;
		SWBuf text;
		text.size(size);
		memcpy(text.getRawData(), data, size);
SWLOGD("CURLFTPTransport: %s: %s", header.c_str(), text.c_str());
		return 0;
	}
}


CURLFTPTransport::CURLFTPTransport(const char *host, StatusReporter *sr) : RemoteTransport(host, sr) {
	session = (CURL *)curl_easy_init();
}


CURLFTPTransport::~CURLFTPTransport() {
	curl_easy_cleanup(session);
}


char CURLFTPTransport::getURL(const char *destPath, const char *sourceURL, SWBuf *destBuf) {
	signed char retVal = 0;
	struct FtpFile ftpfile = {destPath, 0, destBuf};

	CURLcode res;
	
	if (session) {

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
#ifndef OLDCURL
		curl_easy_setopt(session, CURLOPT_CONNECTTIMEOUT_MS, timeoutMillis);
		curl_easy_setopt(session, CURLOPT_TIMEOUT_MS, timeoutMillis);
#else
		curl_easy_setopt(session, CURLOPT_CONNECTTIMEOUT, timeoutMillis/1000);
		curl_easy_setopt(session, CURLOPT_TIMEOUT, timeoutMillis/1000);
#endif
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

		if (CURLE_OK != res) {
			if (CURLE_OPERATION_TIMEDOUT == res
// older CURL doesn't define this
#ifdef CURLE_FTP_ACCEPT_TIMEOUT
	               || CURLE_FTP_ACCEPT_TIMEOUT == res
#endif
               ) {
				retVal = -2;
			}
			else {
				retVal = -1;
			}
		}
	}

	if (ftpfile.fd > 0)
		FileMgr::closeFile(ftpfile.fd); /* close the local file */

	return retVal;
}


SWORD_NAMESPACE_END

