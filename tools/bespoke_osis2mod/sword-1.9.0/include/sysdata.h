/******************************************************************************
 *
 * sysdata.h -	definitions that help SWORD work the same on different systems
 *
 * $Id: sysdata.h 3789 2020-09-11 15:24:25Z scribe $
 * 
 * Copyright 2001-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#ifndef SIZEDTYPES_H
#define SIZEDTYPES_H
/*
 * __xx is apparently not ok: it does pollute the POSIX namespace, changed to SW_xx. Use these in the
 * header files exported to user space
 */
#ifdef USE_AUTOTOOLS
#include "config.h"
#endif


typedef signed char SW_s8;
typedef unsigned char SW_u8;

typedef signed short SW_s16;
typedef unsigned short SW_u16;

typedef signed int SW_s32;
typedef unsigned int SW_u32;

#ifdef OS_ANDROID
__extension__ typedef __signed__ long long SW_s64;
__extension__ typedef unsigned long long SW_u64;
//typedef __s64 SW_s64;
//typedef __u64 SW_u64;
#elif defined(__GNUC__)
__extension__ typedef __signed__ long long SW_s64;
__extension__ typedef unsigned long long SW_u64;
#elif defined(__BORLANDC__)
typedef signed __int64 SW_s64;
typedef unsigned __int64 SW_u64;
#else
typedef signed long long SW_s64;
typedef unsigned long long SW_u64;
#endif

#undef __swswap16
#undef __swswap32
#undef __swswap64

#define __swswap16(x) \
	((SW_u16)( \
		(((SW_u16)(x) & (SW_u16)0x00ffU) << 8) | \
		(((SW_u16)(x) & (SW_u16)0xff00U) >> 8) ))

		
#define __swswap32(x) \
	((SW_u32)( \
		(((SW_u32)(x) & (SW_u32)0x000000ffUL) << 24) | \
		(((SW_u32)(x) & (SW_u32)0x0000ff00UL) <<  8) | \
		(((SW_u32)(x) & (SW_u32)0x00ff0000UL) >>  8) | \
		(((SW_u32)(x) & (SW_u32)0xff000000UL) >> 24) ))

		
#define __swswap64(x) \
	((SW_u64)( \
		(SW_u64)(((SW_u64)(x) & (SW_u64)0x00000000000000ffULL) << 56) | \
		(SW_u64)(((SW_u64)(x) & (SW_u64)0x000000000000ff00ULL) << 40) | \
		(SW_u64)(((SW_u64)(x) & (SW_u64)0x0000000000ff0000ULL) << 24) | \
		(SW_u64)(((SW_u64)(x) & (SW_u64)0x00000000ff000000ULL) <<  8) | \
		(SW_u64)(((SW_u64)(x) & (SW_u64)0x000000ff00000000ULL) >>  8) | \
		(SW_u64)(((SW_u64)(x) & (SW_u64)0x0000ff0000000000ULL) >> 24) | \
		(SW_u64)(((SW_u64)(x) & (SW_u64)0x00ff000000000000ULL) >> 40) | \
		(SW_u64)(((SW_u64)(x) & (SW_u64)0xff00000000000000ULL) >> 56) ))
		



#ifndef WORDS_BIGENDIAN

#define swordtoarch16(x) (x)
#define swordtoarch32(x) (x)
#define swordtoarch64(x) (x)
#define archtosword16(x) (x)
#define archtosword32(x) (x)
#define archtosword64(x) (x)

#else 

#define swordtoarch16(x) __swswap16(x)
#define swordtoarch32(x) __swswap32(x)
#define swordtoarch64(x) __swswap64(x)
#define archtosword16(x) __swswap16(x)
#define archtosword32(x) __swswap32(x)
#define archtosword64(x) __swswap64(x)


#endif


#endif
