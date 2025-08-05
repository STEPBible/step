/*****************************************************************************
 *
 *  curlhttpt.cpp -	CURLHTTPTransport
 *
 * $Id: curlhttpt.cpp 3822 2020-11-03 18:54:47Z scribe $
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

#include <vector>
#include <cctype>

#include <curl/curl.h>
#include <curl/easy.h>

#include <swlog.h>
#include <filemgr.h>
#include <curlhttpt.h>

using std::vector;


SWORD_NAMESPACE_START

namespace {

	struct FtpFile {
		const char *filename;
		int fd;
		SWBuf *destBuf;
	};


	static int my_httpfwrite(void *buffer, size_t size, size_t nmemb, void *stream) {
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


	static int my_httpfprogress(void *clientp, double dltotal, double dlnow, double ultotal, double ulnow) {
		if (clientp) {
			if (dltotal < 0) dltotal = 0;
			if (dlnow < 0) dlnow = 0;
			if (dlnow > dltotal) dlnow = dltotal;
			((StatusReporter *)clientp)->update(dltotal, dlnow);
		}
		return 0;
	}


	static int myhttp_trace(CURL *handle, curl_infotype type, unsigned char *data, size_t size, void *userp) {
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
SWLOGD("CURLHTTPTransport: %s: %s", header.c_str(), text.c_str());
		return 0;
	}
}


CURLHTTPTransport::CURLHTTPTransport(const char *host, StatusReporter *sr) : RemoteTransport(host, sr) {
	session = (CURL *)curl_easy_init();
}


CURLHTTPTransport::~CURLHTTPTransport() {
	curl_easy_cleanup(session);
}


char CURLHTTPTransport::getURL(const char *destPath, const char *sourceURL, SWBuf *destBuf) {
	signed char retVal = 0;
	struct FtpFile ftpfile = {destPath, 0, destBuf};

	CURLcode res;

	if (session) {
		curl_easy_setopt(session, CURLOPT_URL, sourceURL);

		SWBuf credentials = u + ":" + p;
		curl_easy_setopt(session, CURLOPT_USERPWD, credentials.c_str());
		curl_easy_setopt(session, CURLOPT_WRITEFUNCTION, my_httpfwrite);
		if (!passive)
			curl_easy_setopt(session, CURLOPT_FTPPORT, "-");
		curl_easy_setopt(session, CURLOPT_NOPROGRESS, 0);
		curl_easy_setopt(session, CURLOPT_FAILONERROR, 1);
		curl_easy_setopt(session, CURLOPT_PROGRESSDATA, statusReporter);
		curl_easy_setopt(session, CURLOPT_PROGRESSFUNCTION, my_httpfprogress);
		curl_easy_setopt(session, CURLOPT_DEBUGFUNCTION, myhttp_trace);
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

		/* Disable checking host certificate */
		if (isUnverifiedPeerAllowed()) {
			curl_easy_setopt(session, CURLOPT_SSL_VERIFYPEER, false);
		}

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

		if(CURLE_OK != res) {
			if (CURLE_OPERATION_TIMEDOUT == res
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


// we need to find the 2nd "<td" & then find the ">" after that.  The size starts with the next non-space char
const char *findSizeStart(const char *buffer) {
	const char *listing = buffer;
	const char *pEnd;
	
	pEnd = strstr(listing, "<td");
	if(pEnd == NULL) {
		return NULL;
	}
	listing = pEnd+2;
	pEnd = strstr(listing, "<td");
	if(pEnd == NULL)
		return NULL;
	listing = pEnd+2;
	pEnd = strchr(listing, '>');
	if(pEnd == NULL)
		return NULL;

	return pEnd+1;
}


vector<struct DirEntry> CURLHTTPTransport::getDirList(const char *dirURL) {
	
	vector<struct DirEntry> dirList;
	
	SWBuf dirBuf;
	const char *pBuf;
	char *pBufRes;
	SWBuf possibleName;
	double fSize;
	int possibleNameLength = 0;
	
	if (!getURL("", dirURL, &dirBuf)) {
		pBuf = strstr(dirBuf, "<a href=\"");//Find the next link to a possible file name.
		while (pBuf != NULL) {
			pBuf += 9;//move to the start of the actual name.
			pBufRes = (char *)strchr(pBuf, '\"');//Find the end of the possible file name
			if (!pBufRes)
				break;
			possibleNameLength = (int)(pBufRes - pBuf);
			possibleName.setFormatted("%.*s", possibleNameLength, pBuf);
			if (isalnum(possibleName[0])) {
SWLOGD("getDirListHTTP: Found a file: %s", possibleName.c_str());
				pBuf = pBufRes;
				pBufRes = (char *)findSizeStart(pBuf);
				fSize = 0;
				if(pBufRes != NULL) {
					pBuf = pBufRes;
					fSize = strtod(pBuf, &pBufRes);
					if (pBufRes[0] == 'K')
						fSize *= 1024;
					else if (pBufRes[0] == 'M')
						fSize *= 1048576;
					pBuf = pBufRes;
				}
				struct DirEntry i;
				i.name = possibleName;
				i.size = (long unsigned int)fSize;
				i.isDirectory = possibleName.endsWith("/");
				dirList.push_back(i);
			} else {
				pBuf += possibleNameLength;
			}
			pBuf++;
			pBuf = strstr(pBuf, "<a href=\"");//Find the next link to a possible file name.
		}
	}
	else
	{
		SWLog::getSystemLog()->logWarning("FTPURLGetDir: failed to get dir %s\n", dirURL);
	}
	return dirList;
}

SWORD_NAMESPACE_END

