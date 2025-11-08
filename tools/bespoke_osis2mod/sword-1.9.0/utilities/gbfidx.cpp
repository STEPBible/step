/*****************************************************************************
 *
 *  gbfidx.cpp -	This code reeks but works (at least for WEB).
 *			Good luck!
 *
 * $Id: gbfidx.cpp 3063 2014-03-04 13:04:11Z chrislit $
 *
 * Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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


#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#ifndef __GNUC__
#include <io.h>
#else
#include <unistd.h>
#endif

#include <fcntl.h>
#include <versekey.h>
#include <filemgr.h>

using namespace sword;

void writeidx(VerseKey &key1, VerseKey &key2, VerseKey &key3, long offset, short size);
char findbreak(int fp, long *offset, int *num1, int *num2, int *rangemax, short *size);
void openfiles(char *fname);
void checkparams(int argc, char **argv);


VerseKey key1, key2, key3;
int fp, vfp, cfp, bfp;
long chapoffset;
short chapsize;
char testmnt;


int main(int argc, char **argv)
{
	long pos, offset;
	int num1, num2, rangemax;
	char startflag = 0;
	short size;

	checkparams(argc, argv);

	openfiles(argv[1]);

	testmnt = key1.getTestament();
	num1 = key1.getChapter();
	num2 = key1.getVerse();
	pos  = 0;
	write(bfp, &pos, 4);  /* Book    offset for testament intros */
	pos = 4;
	write(cfp, &pos, 4);  /* Chapter offset for testament intro */


/*	Right now just zero out intros until parsing correctly */
	pos = 0;
	size = 0;
	write(vfp, &pos, 4);  /* Module intro */
	write(vfp, &size, 2);
	write(vfp, &pos, 4);  /* Testament intro */
	write(vfp, &size, 2);

	while(!findbreak(fp, &offset, &num1, &num2, &rangemax, &size)) {
		if (!startflag) {
			startflag = 1;
		}
		else {
			if (num2 < key2.getVerse()) {            // new chapter
				if (num1 <= key2.getChapter()) { // new book
					key2.setVerse(1);
					key2.setChapter(1);
					key2.setBook(key2.getBook()+1);
				}
				printf("Found Chapter Break: %d ('%s')\n", num1, (const char *)key2);
				chapoffset = offset;
				chapsize = size;
//				continue;
			}
		}
		key2.setVerse(1);
		key2.setChapter(num1);
		key2.setVerse(num2);

		key3 = key2;
//		key3 += (rangemax - key3.getVerse());

		writeidx(key1, key2, key3, offset, size);
	}
	close(vfp);
	close(cfp);
	close(bfp);
	close(fp);
	return 0;
}


/**************************************************************************
 * ENT:	key1	- current location of index
 * 	key2	- minimum keyval for which this offset is valid
 * 	key3	- maximum keyval for which this offset is valid
 */

void writeidx(VerseKey &key1, VerseKey &key2, VerseKey &key3, long offset, short size)
{
	long pos;
	short tmp;

	for (; ((key1 <= key3) && (key1.popError() != KEYERR_OUTOFBOUNDS) && (key1.getTestament() == testmnt)); key1+=1) {
		if (key1.getVerse() == 1) {	// new chapter
			if (key1.getChapter() == 1) {	// new book
				pos = lseek(cfp, 0, SEEK_CUR);
				write(bfp, &pos, 4);
				pos = lseek(vfp, 0, SEEK_CUR); /* Book intro (cps) */
				write(cfp, &pos, 4);
				write(vfp, &chapoffset, 4);  /* Book intro (vss)  set to same as chap for now(it should be chap 1 which usually contains the book into anyway)*/
				write(vfp, &chapsize, 2);
			}
			pos = lseek(vfp, 0, SEEK_CUR);
			write(cfp, &pos, 4);
			write(vfp, &chapoffset, 4);  /* Chapter intro */
			write(vfp, &chapsize, 2);
		}
		if (key1 >= key2) {
			write(vfp, &offset, 4);
			write(vfp, &size, 2);
		}
		else	{
			pos = 0;
			tmp = 0;
			write(vfp, &pos, 4);
			write(vfp, &tmp, 2);
		}
	}
}


char startchap(char *buf)
{
	if (buf[0] != '<')
		return 0;
	if (buf[1] != 'S')
		return 0;
	if (buf[2] != 'C')
		return 0;
/*
	if (!isdigit(buf[2]))
		return 0;
	for (loop = 3; loop < 7; loop++) {
		if (buf[loop] == ' ')
			break;
		if ((!isdigit(buf[loop])) && (buf[loop] != ',') && (buf[loop] != '-'))
			return 0;
	}
*/
	return 1;
}


char startentry(char *buf)
{
	if (buf[0] != '<')
		return 0;
	if (buf[1] != 'S')
		return 0;
	if (buf[2] != 'V')
		return 0;
/*
	if (!isdigit(buf[2]))
		return 0;
	for (loop = 3; loop < 7; loop++) {
		if (buf[loop] == ' ')
			break;
		if ((!isdigit(buf[loop])) && (buf[loop] != ',') && (buf[loop] != '-'))
			return 0;
	}
*/
	return 1;
}


char findbreak(int fp, long *offset, int *num1, int *num2, int *rangemax, short *size)
{
	char buf[7];
	int loop;
	long offset2;
	int ch2, vs2, rm2;
	bool flag;
	long chapstart = 0; 
	
	memset(buf, ' ', 7);

	while (1) {
		if (startchap(buf)) {
			chapstart = lseek(fp, 0, SEEK_CUR) - 7;
			memset(buf, ' ', 3);
			flag = false;
			for (loop = 3; loop < 6; loop++) {
				if (isdigit(buf[loop]))
					flag = true;
				else {
					buf[loop] = 0;
					break;
				}
			}
			if (flag) 
				*num1 = atoi(buf);
			else	(*num1)++;
		}
		if (startentry(buf)) {
			memset(buf, ' ', 3);
			flag = false;
			for (loop = 3; loop < 6; loop++) {
				if (isdigit(buf[loop]))
					flag = true;
				else {
					buf[loop] = 0;
					break;
				}
			if (flag)
				*num2 = atoi(buf);
			else	(*num2)++;
			}
			loop++;
			if (size)
				*offset = lseek(fp, 0, SEEK_CUR) - (7 - loop);
			else	*offset = (chapstart) ? chapstart : lseek(fp, 0, SEEK_CUR) - 7;
			if (size) {
				ch2 = *num1;
				vs2 = *num2;
				if (findbreak(fp, &offset2, &ch2, &vs2, &rm2, 0)) {
					*size = (short) (lseek(fp, 0, SEEK_END) - (*offset));
				}
				else {
					if (vs2) {
						*size = (offset2 - (*offset));
					}
				}
				lseek(fp, *offset, SEEK_SET);
			}
			return 0;
		}
		memmove(buf, &buf[1], 6);
		if (read(fp, &buf[6], 1) != 1)
			return 1;
	}
}


void openfiles(char *fname)
{
	SWBuf buf;

	if ((fp = FileMgr::openFileReadOnly(fname)) < 0) {
		fprintf(stderr, "Couldn't open file: %s\n", fname);
		exit(1);
	}

	buf.setFormatted("%s.vss", fname);
	if ((vfp = FileMgr::createPathAndFile(buf.c_str())) < 0) {
		fprintf(stderr, "Couldn't open file: %s\n", buf.c_str());
		exit(1);
	}

	buf.setFormatted("%s.cps", fname);
	if ((cfp = FileMgr::createPathAndFile(buf.c_str())) < 0) {
		fprintf(stderr, "Couldn't open file: %s\n", buf.c_str());
		exit(1);
	}

	buf.setFormatted("%s.bks", fname);
	if ((bfp = FileMgr::createPathAndFile(buf.c_str())) < 0) {
		fprintf(stderr, "Couldn't open file: %s\n", buf.c_str());
		exit(1);
	}
}


void checkparams(int argc, char **argv)
{
	if (argc < 2) {
		fprintf(stderr, "usage: %s <file to process> [nt - for new testmt file]\n", argv[0]);
		exit(1);
	}
	if (argc == 3)
		key1 = key2 = key3 = "Matthew 1:1";
	else	key1 = key2 = key3 = "Genesis 1:1";
}
