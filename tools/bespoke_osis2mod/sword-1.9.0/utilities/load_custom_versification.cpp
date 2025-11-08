/* vim: set et ts=4
*
* Copyright (C) 2015-2021 the json-parser authors  All rights reserved.
* https://github.com/json-parser/json-parser
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions
* are met:
*
* 1. Redistributions of source code must retain the above copyright
*   notice, this list of conditions and the following disclaimer.
*
* 2. Redistributions in binary form must reproduce the above copyright
*   notice, this list of conditions and the following disclaimer in the
*   documentation and/or other materials provided with the distribution.
*
* THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
* OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
* HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
* LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
* OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
* SUCH DAMAGE.
*/


#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>

#include <json.h>
#include <versificationmgr.h>

SWORD_NAMESPACE_START

// Command line
// C:\tmp\osis2mod_work\en_NETSLXX\Sword\modules\texts\ztext\NETSLXX C:\tmp\osis2mod_work\en_NETSLXX\en_NETSLXX_osis.xml -b 4 -z -V C:\tmp\osis2mod_work\en_NETSLXX\canon_netslxx.json
//
extern "C"
{
	// Versification system: CUSTOM
	struct sbook *otbooks_custom;
	struct sbook *ntbooks_custom;

	// Maximum verses per chapter
	int *vm_custom;

	// sword mappings
	unsigned char *mappings_custom;

	// Finite state machine for parsing the Versification json
	typedef enum
	{
		IDLE,
		V11N_NAME,
		OTBOOKS,
		//OTBOOKSN,
		NTBOOKS,
		//NTBOOKSN,
		VM,
		MAPPINGS
	} processing_state;

	// Finite state machine for parsing the entry of each book
	typedef enum
	{
		BOOKNAME,
		OSIS,
		PREFABBREV,
		CHAPMAX,
		VERSEMAX,
	} sbook_state;

	processing_state state = IDLE;
	sbook_state book_state;

	char *custom_versification_name;
	int ot_book;
	int nt_book;
	int vm_offset;
	int mappings_offset;

	int trace = 0;

	static void print_depth_shift(int depth)
	{
		int j;
		for (j = 0; j < depth; j++) {
			printf(" ");
		}
	}

	static void process_value(json_value* value, int depth);

	static void process_object(json_value* value, int depth)
	{
		int length, x;
		if (value == NULL) {
			return;
		}
		length = value->u.object.length;
		for (x = 0; x < length; x++) {
			if (trace) print_depth_shift(depth);
			if (trace) printf("object[%d].name = %s\n", x, value->u.object.values[x].name);
			if (!strcmp(value->u.object.values[x].name, "v11nName")) state = V11N_NAME;
			else if (!strcmp(value->u.object.values[x].name, "otbooks")) state = OTBOOKS;
			else if (!strcmp(value->u.object.values[x].name, "ntbooks")) state = NTBOOKS;
			else if (!strcmp(value->u.object.values[x].name, "vm")) state = VM;
			else if (!strcmp(value->u.object.values[x].name, "mappings")) state = MAPPINGS;
			else if (!strcmp(value->u.object.values[x].name, "jsword_mappings")) state = IDLE;
			else if (!strcmp(value->u.object.values[x].name, "name")) {
				book_state = BOOKNAME;
				if (state == OTBOOKS)	ot_book++;
				else if (state == NTBOOKS)	nt_book++;
			}
			else if (!strcmp(value->u.object.values[x].name, "osis")) book_state = OSIS;
			else if (!strcmp(value->u.object.values[x].name, "prefAbbrev")) book_state = PREFABBREV;
			else if (!strcmp(value->u.object.values[x].name, "chapmax")) book_state = CHAPMAX;
			process_value(value->u.object.values[x].value, depth + 1);
		}
	}

	static void process_array(json_value* value, int depth)
	{
		int length, x;
		if (value == NULL) {
			return;
		}
		length = value->u.array.length;
		if (trace) printf("array\n");
		if (state == OTBOOKS)
		{
			otbooks_custom = (struct sbook*)calloc(length, sizeof(struct sbook));
			//state = OTBOOKSN;
			ot_book = -1;
		}
		else if (state == NTBOOKS)
		{
			ntbooks_custom = (struct sbook*)calloc(length, sizeof(struct sbook));
			//state = NTBOOKSN;
			nt_book = -1;
		}
		else if (state == VM)
		{
			vm_custom = (int*)calloc(length, sizeof(int));
			vm_offset = 0;
		}
		else if (state == MAPPINGS)
		{
			mappings_custom = (unsigned char*)calloc(length, sizeof(unsigned char));
			mappings_offset = 0;
		}
		for (x = 0; x < length; x++) {
			/*if (state == OTBOOKSN || state == NTBOOKSN)
			{
			switch (x){
			case 0: book_state = BOOKNAME; break;
			case 1: book_state = OSIS; break;
			case 2: book_state = PREFABBREV; break;
			case 3: book_state = CHAPMAX; break;
			case 4: book_state = VERSEMAX; break;
			}
			}*/
			process_value(value->u.array.values[x], depth);
		}
	}

	static void process_value(json_value* value, int depth)
	{
		if (value == NULL) {
			return;
		}
		if (value->type != json_object) {
			if (trace) print_depth_shift(depth);
		}
		switch (value->type) {
		case json_none:
			if (trace) printf("none\n");
			break;
		case json_null:
			if (trace) printf("null\n");
			break;
		case json_object:
			process_object(value, depth + 1);
			break;
		case json_array:
			process_array(value, depth + 1);
			break;
		case json_integer:
			sbook* book;
			if (state == OTBOOKS) book = otbooks_custom + ot_book;// *sizeof(struct sbook);
			else if (state == NTBOOKS) book = ntbooks_custom + nt_book;// *sizeof(struct sbook);

			if (state == OTBOOKS || state == NTBOOKS)
			{
				if (book_state == CHAPMAX) book->chapmax = (unsigned char)value->u.integer;
				//else if (book_state = VERSEMAX) book->versemax = (int)value->u.integer;
			}
			else if (state == VM)
			{
				vm_custom[vm_offset++] = (int)value->u.integer;
			}
			else if (state == MAPPINGS)
			{
				mappings_custom[mappings_offset++] = (unsigned char)value->u.integer;
			}

			if (trace) printf("int: %10ld\n", (long)value->u.integer);
			break;
		case json_double:
			if (trace) printf("double: %f\n", value->u.dbl);
			break;
		case json_string:
			if (state == V11N_NAME)
			{
				custom_versification_name = (char*)malloc(strlen(value->u.string.ptr) + 1);
				strcpy(custom_versification_name, value->u.string.ptr);
			}
			else if (state == OTBOOKS || state == NTBOOKS)
			{
				sbook* book;
				if (state == OTBOOKS) book = otbooks_custom + ot_book;// *sizeof(struct sbook);
				else if (state == NTBOOKS) book = ntbooks_custom + nt_book;// *sizeof(struct sbook);

				if (book_state == BOOKNAME)
				{
					char* name = (char*)malloc(strlen(value->u.string.ptr) + 1);
					strcpy(name, value->u.string.ptr);
					book->name = name;
				}
				if (book_state == OSIS)
				{
					char* osis = (char*)malloc(strlen(value->u.string.ptr) + 1);
					strcpy(osis, value->u.string.ptr);
					book->osis = osis;
				}
				if (book_state == PREFABBREV)
				{
					char* prefAbbrev = (char*)malloc(strlen(value->u.string.ptr) + 1);
					strcpy(prefAbbrev, value->u.string.ptr);
					book->prefAbbrev = prefAbbrev;
				}
			}

			if (trace) printf("string: %s\n", value->u.string.ptr);
			break;
		case json_boolean:
			if (trace) printf("bool: %d\n", value->u.boolean);
			break;
		}
	}

	int load_custom_versification(const char* filename)
	{
		FILE *fp;
		struct stat filestatus;
		int file_size;
		char* file_contents;
		json_char* json;
		json_value* value;


		if (stat(filename, &filestatus) != 0) {
			fprintf(stderr, "File %s not found\n", filename);
			return 1;
		}
		file_size = filestatus.st_size;
		file_contents = (char*)malloc(filestatus.st_size + 1);
		if (file_contents == NULL) {
			fprintf(stderr, "Memory error: unable to allocate %d bytes\n", file_size);
			return 1;
		}

		fp = fopen(filename, "rb");
		if (fp == NULL) {
			fprintf(stderr, "Unable to open %s\n", filename);
			fclose(fp);
			free(file_contents);
			return 1;
		}

		int res = fread(file_contents, file_size, 1, fp);
		if (res != 1) {
			fprintf(stderr, "Unable to read content of %s\n", filename);
			fclose(fp);
			free(file_contents);
			return 1;
		}
		fclose(fp);
		file_contents[file_size] = '\0';
		if (trace) printf("%s\n", file_contents);

		if (trace) printf("--------------------------------\n\n");

		json = (json_char*)file_contents;

		value = json_parse(json, file_size);

		if (value == NULL) {
			fprintf(stderr, "Unable to parse data\n");
			free(file_contents);
			exit(1);
		}

		process_value(value, 0);

		json_value_free(value);
		free(file_contents);
		return 0;
	}
}
SWORD_NAMESPACE_END