/******************************************************************************
 *
 * defs.h -	Global defines, mostly platform-specific stuff
 *
 * $Id: defs.h 3823 2020-11-03 23:20:40Z scribe $
 *
 * Copyright 2000-2013 CrossWire Bible Society (http://www.crosswire.org)
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
// ----------------------------------------------------------------------------
// 
// ----------------------------------------------------------------------------
#ifndef SWORDDEFS_H
#define SWORDDEFS_H

// support for compilers with no namespace support
// TODO: What is this? jansorg, why does NO_SWORD_NAMESPACE still define
// a C++ namespace, and then force using it?  This makes no sense to me.
// see commit 1195
#ifdef NO_SWORD_NAMESPACE
 #define SWORD_NAMESPACE_START namespace sword {
 #define SWORD_NAMESPACE_END }; using namespace sword;
#elif defined(__cplusplus)
 #define SWORD_NAMESPACE_START namespace sword {
 #define SWORD_NAMESPACE_END }
#else
 #define SWORD_NAMESPACE_START 
 #define SWORD_NAMESPACE_END 
#endif

SWORD_NAMESPACE_START


// support for compilers with no RTTI
#define SWDYNAMIC_CAST(className, object) dynamic_cast<className *>(object)

#ifdef NODYNCAST
// avoid redefined warnings
#undef SWDYNAMIC_CAST
#define SWDYNAMIC_CAST(className, object) (className *)((object)?((object->getClass()->isAssignableFrom(#className))?object:0):0)
#endif


// support for compilers with no exception support
#define SWTRY try
#define SWCATCH(x) catch (x)

#ifdef _WIN32_WCE
#define SWTRY
#define SWCATCH(x) if (0)
#define GLOBCONFPATH "/Program Files/sword/sword.conf"
#endif

#ifdef ANDROID
#define _NO_IOSTREAM_
#undef SWTRY
#undef SWCATCH
#define SWTRY
#define SWCATCH(x) if (0)
#endif

// support for export / import of symbols from shared objects
// _declspec works in BC++ 5 and later, as well as VC++
#if defined(_MSC_VER)

#  ifdef SWMAKINGDLL
#    define SWDLLEXPORT _declspec( dllexport )
#    define SWDLLEXPORT_DATA(type) _declspec( dllexport ) type
#    define SWDLLEXPORT_CTORFN
#  elif defined(SWUSINGDLL)
#    define SWDLLEXPORT _declspec( dllimport )
#    define SWDLLEXPORT_DATA(type) _declspec( dllimport ) type
#    define SWDLLEXPORT_CTORFN
#  else
#    define SWDLLEXPORT
#    define SWDLLEXPORT_DATA(type) type
#    define SWDLLEXPORT_CTORFN
#  endif

// support for deprecated annotation
#  define SWDEPRECATED __declspec(deprecated("** WARNING: deprecated method **"))


#elif defined(__SWPM__)

#  ifdef SWMAKINGDLL
#    define SWDLLEXPORT _Export
#    define SWDLLEXPORT_DATA(type) _Export type
#    define SWDLLEXPORT_CTORFN
#  elif defined(SWUSINGDLL)
#    define SWDLLEXPORT _Export
#    define SWDLLEXPORT_DATA(type) _Export type
#    define SWDLLEXPORT_CTORFN
#  else
#    define SWDLLEXPORT
#    define SWDLLEXPORT_DATA(type) type
#    define SWDLLEXPORT_CTORFN
#  endif

#  define SWDEPRECATED


#elif defined(__GNUWIN32__)

#  ifdef SWMAKINGDLL
#    define SWDLLEXPORT __declspec( dllexport )
#    define SWDLLEXPORT_DATA(type) __declspec( dllexport ) type
#    define SWDLLEXPORT_CTORFN
#  elif defined(SWUSINGDLL)
#    define SWDLLEXPORT __declspec( dllimport )
#    define SWDLLEXPORT_DATA(type) __declspec( dllimport ) type
#    define SWDLLEXPORT_CTORFN
#  else
#    define SWDLLEXPORT
#    define SWDLLEXPORT_DATA(type) type
#    define SWDLLEXPORT_CTORFN
#  endif

#  define SWDEPRECATED  __attribute__((__deprecated__))


#elif defined(__BORLANDC__)
#define NOVARMACS
#  ifdef SWMAKINGDLL
#    define SWDLLEXPORT _export
#    define SWDLLEXPORT_DATA(type) __declspec( dllexport ) type
#    define SWDLLEXPORT_CTORFN
#  elif defined(SWUSINGDLL)
#    define SWDLLEXPORT __declspec( dllimport )
#    define SWDLLEXPORT_DATA(type) __declspec( dllimport ) type
#    define SWDLLEXPORT_CTORFN
#  else
#    define SWDLLEXPORT
#    define SWDLLEXPORT_DATA(type) type
#    define SWDLLEXPORT_CTORFN
#  endif


#define COMMENT SLASH(/)
#define SLASH(s) /##s
/* Use the following line to comment out all deprecation declarations so you
 * get "no such method" errors in your code when you want to find them.
 * Use the next line to put them back in.
 */
//#  define SWDEPRECATED COMMENT
#  define SWDEPRECATED
#define va_copy(dest, src) (dest = src)
#define unorm2_getNFKDInstance(x) unorm2_getInstance(NULL, "nfkc", UNORM2_DECOMPOSE, x)


#elif defined(__GNUC__)
#  define SWDLLEXPORT
#  define SWDLLEXPORT_DATA(type) type
#  define SWDLLEXPORT_CTORFN
#  define SWDEPRECATED  __attribute__((__deprecated__))


#else
#  define SWDLLEXPORT
#  define SWDLLEXPORT_DATA(type) type
#  define SWDLLEXPORT_CTORFN
#  define SWDEPRECATED
#endif


// For ostream, istream ofstream
#if defined(__BORLANDC__) && defined( _RTLDLL )
#  define SWDLLIMPORT __import
#else
#  define SWDLLIMPORT
#endif

#ifndef NOVARMACS
#ifndef STRIPLOGD
#define SWLOGD(...) SWLog::getSystemLog()->logDebug(__VA_ARGS__)
#else
#define SWLOGD(...) (void)0
#endif

#ifndef STRIPLOGI
#define SWLOGI(...) SWLog::getSystemLog()->logInformation(__VA_ARGS__)
#define SWLOGTI(...) SWLog::getSystemLog()->logTimedInformation(__VA_ARGS__)
#else
#define SWLOGI(...) (void)0
#define SWLOGTI(...) (void)0
#endif
#else
#ifndef STRIPLOGD
#define SWLOGD SWLog::getSystemLog()->logDebug
#else
#define SWLOGD COMMENT
#endif

#ifndef STRIPLOGI
#define SWLOGI SWLog::getSystemLog()->logInformation
#define SWLOGTI SWLog::getSystemLog()->logTimedInformation
#else
#define SWLOGI COMMENT
#define SWLOGTI COMMENT
#endif
#endif


SWORD_NAMESPACE_END
#endif //SWORDDEFS_H
