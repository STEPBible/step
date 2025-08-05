/******************************************************************************
 *
 *  lzssomprs.cpp -	LZSSCompress: a driver class that provides LZSS
 *			compression
 *		
 * $Id: lzsscomprs.cpp 3785 2020-08-30 11:12:34Z scribe $
 *
 * Copyright 1996-2013 CrossWire Bible Society (http://www.crosswire.org)
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

#include <stdlib.h>
#include <string.h>
#include <lzsscomprs.h>

// The following are constant sizes used by the compression algorithm.
//
//  N         - This is the size of the ring buffer.  It is set
//              to 4K.  It is important to note that a position
//              within the ring buffer requires 12 bits.  
//
//  F         - This is the maximum length of a character sequence
//              that can be taken from the ring buffer.  It is set
//              to 18.  Note that a length must be 3 before it is
//              worthwhile to store a position/length pair, so the
//              length can be encoded in only 4 bits.  Or, put yet
//              another way, it is not necessary to encode a length
//              of 0-18, it is necessary to encode a length of
//              3-18, which requires 4 bits.
//              
//  THRESHOLD - It takes 2 bytes to store an offset and
//              a length.  If a character sequence only
//              requires 1 or 2 characters to store 
//              uncompressed, then it is better to store
//              it uncompressed than as an offset into
//              the ring buffer.
//
// Note that the 12 bits used to store the position and the 4 bits
// used to store the length equal a total of 16 bits, or 2 bytes.

#define N		4096
#define F		18
#define THRESHOLD	3
#define NOT_USED	N


SWORD_NAMESPACE_START

class LZSSCompress::Private {
public:
	static unsigned char m_ring_buffer[N + F - 1];
	static short int m_match_position;
	static short int m_match_length;
	static short int m_lson[N + 1];
	static short int m_rson[N + 257];
	static short int m_dad[N + 1];
	void InitTree();
	void InsertNode(short int Pos);
	void DeleteNode(short int Node);
};

/******************************************************************************
 * LZSSCompress Statics
 */

// m_ring_buffer is a text buffer.  It contains "nodes" of
// uncompressed text that can be indexed by position.  That is,
// a substring of the ring buffer can be indexed by a position
// and a length.  When decoding, the compressed text may contain
// a position in the ring buffer and a count of the number of
// bytes from the ring buffer that are to be moved into the
// uncompressed buffer.  
//
// This ring buffer is not maintained as part of the compressed
// text.  Instead, it is reconstructed dynamically.  That is,
// it starts out empty and gets built as the text is decompressed.
//
// The ring buffer contain N bytes, with an additional F - 1 bytes
// to facilitate string comparison.

unsigned char LZSSCompress::Private::m_ring_buffer[N + F - 1];

// m_match_position and m_match_length are set by InsertNode().
//
// These variables indicate the position in the ring buffer 
// and the number of characters at that position that match
// a given string.

short int LZSSCompress::Private::m_match_position;
short int LZSSCompress::Private::m_match_length;

// m_lson, m_rson, and m_dad are the Japanese way of referring to
// a tree structure.  The dad is the parent and it has a right and
// left son (child).
//
// For i = 0 to N-1, m_rson[i] and m_lson[i] will be the right 
// and left children of node i.  
//
// For i = 0 to N-1, m_dad[i] is the parent of node i.
//
// For i = 0 to 255, rson[N + i + 1] is the root of the tree for 
// strings that begin with the character i.  Note that this requires 
// one byte characters.
//
// These nodes store values of 0...(N-1).  Memory requirements
// can be reduces by using 2-byte integers instead of full 4-byte
// integers (for 32-bit applications).  Therefore, these are 
// defined as "short ints."

short int LZSSCompress::Private::m_lson[N + 1];
short int LZSSCompress::Private::m_rson[N + 257];
short int LZSSCompress::Private::m_dad[N + 1];


/******************************************************************************
 * LZSSCompress Constructor - Initializes data for instance of LZSSCompress
 *
 */

LZSSCompress::LZSSCompress() : SWCompress() {
	p = new Private();
}


/******************************************************************************
 * LZSSCompress Destructor - Cleans up instance of LZSSCompress
 */

LZSSCompress::~LZSSCompress() {
	delete p;
}


/******************************************************************************
 * LZSSCompress::InitTree	- This function initializes the tree nodes to
 *							"empty" states. 
 */

void LZSSCompress::Private::InitTree(void) {
	int  i;

	// For i = 0 to N - 1, m_rson[i] and m_lson[i] will be the right
	// and left children of node i.  These nodes need not be
	// initialized.  However, for debugging purposes, it is nice to
	// have them initialized.  Since this is only used for compression
	// (not decompression), I don't mind spending the time to do it.
	//
	// For the same range of i, m_dad[i] is the parent of node i.
	// These are initialized to a known value that can represent
	// a "not used" state.
	
	for (i = 0; i < N; i++) {
		m_lson[i] = NOT_USED;
		m_rson[i] = NOT_USED;
		m_dad[i] = NOT_USED;
	}

	// For i = 0 to 255, m_rson[N + i + 1] is the root of the tree
	// for strings that begin with the character i.  This is why
	// the right child array is larger than the left child array.
	// These are also initialzied to a "not used" state.
	//
	// Note that there are 256 of these, one for each of the possible
	// 256 characters.

	for (i = N + 1; i <= (N + 256); i++) {
		m_rson[i] = NOT_USED;
	}
}


/******************************************************************************
 * LZSSCompress::InsertNode	- This function inserts a string from the ring
 *							buffer into one of the trees.  It loads the
 *							match position and length member variables
 *							for the longest match.
 *	
 *							The string to be inserted is identified by
 *							the parameter Pos, A full F bytes are
 *							inserted.  So,
 *							m_ring_buffer[Pos ... Pos+F-1]
 *							are inserted.
 *
 *							If the matched length is exactly F, then an
 *							old node is removed in favor of the new one
 *							(because the old one will be deleted
 *							sooner).
 *
 *							Note that Pos plays a dual role.  It is
 *							used as both a position in the ring buffer
 *							and also as a tree node.
 *							m_ring_buffer[Pos] defines a character that
 *							is used to identify a tree node.
 *
 * ENT:	pos	- position in the buffer
 */

void LZSSCompress::Private::InsertNode(short int Pos)
{
	short int i;
	short int p;
	int cmp;
	unsigned char * key;

/*
	ASSERT(Pos >= 0);
	ASSERT(Pos < N);
*/

	cmp = 1;
	key = &(m_ring_buffer[Pos]);

	// The last 256 entries in m_rson contain the root nodes for
	// strings that begin with a letter.  Get an index for the
	// first letter in this string.

	p = (short int) (N + 1 + key[0]);

	// Set the left and right tree nodes for this position to "not
	// used."

	m_lson[Pos] = NOT_USED;
	m_rson[Pos] = NOT_USED;

	// Haven't matched anything yet.

	m_match_length = 0;

	for ( ; ; ) {
		if (cmp >= 0) {
			if (m_rson[p] != NOT_USED) {
				p = m_rson[p];
			}
			else {
				m_rson[p] = Pos;
				m_dad[Pos] = p;
				return;
			}
		}
		else {
			if (m_lson[p] != NOT_USED) {
				p = m_lson[p];
			}
			else {
				m_lson[p] = Pos;
				m_dad[Pos] = p;
				return;
			}
		}

		// Should we go to the right or the left to look for the
		// next match?

		for (i = 1; i < F; i++) {
			cmp = key[i] - m_ring_buffer[p + i];
			if (cmp != 0)
				break;
		}

		if (i > m_match_length) {
			m_match_position = p;
			m_match_length = i;

			if (i >= F)
				break;
		}
	}

	m_dad[Pos] = m_dad[p];
	m_lson[Pos] = m_lson[p];
	m_rson[Pos] = m_rson[p];

	m_dad[ m_lson[p] ] = Pos;
	m_dad[ m_rson[p] ] = Pos;

	if (m_rson[ m_dad[p] ] == p) {
		m_rson[ m_dad[p] ] = Pos;
	}
	else {
		m_lson[ m_dad[p] ] = Pos;
	}

	// Remove "p"

	m_dad[p] = NOT_USED;
}


/******************************************************************************
 * LZSSCompress::DeleteNode	- This function removes the node "Node" from the
 *							tree.
 *
 * ENT:	node	- node to be removed
 */

void LZSSCompress::Private::DeleteNode(short int Node)
{
	short int  q;

/*
	ASSERT(Node >= 0);
	ASSERT(Node < (N+1));
*/

	if (m_dad[Node] == NOT_USED) { // not in tree, nothing to do
		return;
	}

	if (m_rson[Node] == NOT_USED) {
		q = m_lson[Node];
	}
	else if (m_lson[Node] == NOT_USED) {
		q = m_rson[Node];
	}
	else {
		q = m_lson[Node];
		if (m_rson[q] != NOT_USED) {
			do {
				q = m_rson[q];
			} while (m_rson[q] != NOT_USED);

			m_rson[ m_dad[q] ] = m_lson[q];
			m_dad[ m_lson[q] ] = m_dad[q];
			m_lson[q] = m_lson[Node];
			m_dad[ m_lson[Node] ] = q;
		}

		m_rson[q] = m_rson[Node];
		m_dad[ m_rson[Node] ] = q;
	}

	m_dad[q] = m_dad[Node];

	if (m_rson[ m_dad[Node] ] == Node) {
		m_rson[ m_dad[Node] ] = q;
	}
	else {
		m_lson[ m_dad[Node] ] = q;
	}

	m_dad[Node] = NOT_USED;
}


/******************************************************************************
 * LZSSCompress::encode	- This function "encodes" the input stream into the
 *						output stream.
 *						The getChars() and sendChars() functions are
 *						used to separate this method from the actual
 *						i/o.
 * 		NOTE:			must set zlen for parent class to know length of
 * 						compressed buffer.
 */

void LZSSCompress::encode(void)
{
	short int i;						// an iterator
	short int r;						// node number in the binary tree
	short int s;						// position in the ring buffer
	unsigned short int len;			 // len of initial string
	short int last_match_length;		// length of last match
	short int code_buf_pos;			 // position in the output buffer
	unsigned char code_buf[17];		 // the output buffer
	unsigned char mask;				 // bit mask for byte 0 of out buf
	unsigned char c;					// character read from string

	// Start with a clean tree.

	p->InitTree();
	direct = 0;	// set direction needed by parent [Get|Send]Chars()

	// code_buf[0] works as eight flags.  A "1" represents that the
	// unit is an unencoded letter (1 byte), and a "0" represents
	// that the next unit is a <position,length> pair (2 bytes).
	//
	// code_buf[1..16] stores eight units of code.  Since the best
	// we can do is store eight <position,length> pairs, at most 16 
	// bytes are needed to store this.
	//
	// This is why the maximum size of the code buffer is 17 bytes.

	code_buf[0] = 0;
	code_buf_pos = 1;

	// Mask iterates over the 8 bits in the code buffer.  The first
	// character ends up being stored in the low bit.
	//
	//  bit   8   7   6   5   4   3   2   1
	//		|						   |
	//		|			 first sequence in code buffer
	//		|
	//	  last sequence in code buffer		

	mask = 1;

	s = 0;
	r = (short int) N - (short int) F;

	// Initialize the ring buffer with spaces...

	// Note that the last F bytes of the ring buffer are not filled.
	// This is because those F bytes will be filled in immediately
	// with bytes from the input stream.

	memset(p->m_ring_buffer, ' ', N - F);
	
	// Read F bytes into the last F bytes of the ring buffer.
	//
	// This function loads the buffer with X characters and returns
	// the actual amount loaded.

	len = getChars((char *) &(p->m_ring_buffer[r]), F);

	// Make sure there is something to be compressed.

	if (len == 0)
		return;

	// Insert the F strings, each of which begins with one or more
	// 'space' characters.  Note the order in which these strings
	// are inserted.  This way, degenerate trees will be less likely
	// to occur.

	for (i = 1; i <= F; i++) {
		p->InsertNode((short int) (r - i));
	}

	// Finally, insert the whole string just read.  The
	// member variables match_length and match_position are set.

	p->InsertNode(r);

	// Now that we're preloaded, continue till done.

	do {

		// m_match_length may be spuriously long near the end of
		// text.

		if (p->m_match_length > len) {
			p->m_match_length = len;
		}

		// Is it cheaper to store this as a single character?  If so,
		// make it so.

		if (p->m_match_length < THRESHOLD) {
			// Send one character.  Remember that code_buf[0] is the
			// set of flags for the next eight items.

			p->m_match_length = 1;	 
			code_buf[0] |= mask;  
			code_buf[code_buf_pos++] = p->m_ring_buffer[r];
		}

		// Otherwise, we do indeed have a string that can be stored
		// compressed to save space.

		else {
			// The next 16 bits need to contain the position (12 bits)
			// and the length (4 bits).

			code_buf[code_buf_pos++] = (unsigned char) p->m_match_position;
			code_buf[code_buf_pos++] = (unsigned char) (
				((p->m_match_position >> 4) & 0xf0) | 
				(p->m_match_length - THRESHOLD) );
		}

		// Shift the mask one bit to the left so that it will be ready
		// to store the new bit.

		mask = (unsigned char) (mask << 1);

		// If the mask is now 0, then we know that we have a full set
		// of flags and items in the code buffer.  These need to be
		// output.

		if (!mask) {
			// code_buf is the buffer of characters to be output.
			// code_buf_pos is the number of characters it contains.

			sendChars((char *) code_buf, code_buf_pos);

			// Reset for next buffer...

			code_buf[0] = 0;
			code_buf_pos = 1;
			mask = 1;
		}

		last_match_length = p->m_match_length;

		// Delete old strings and read new bytes...

		for (i = 0; i < last_match_length; i++) {
			// Get next character...

			if (getChars((char *) &c, 1) != 1)
				break;

			// Delete "old strings"

			p->DeleteNode(s);

			// Put this character into the ring buffer.
			//		  
			// The original comment here says "If the position is near
			// the end of the buffer, extend the buffer to make
			// string comparison easier."
			//
			// That's a little misleading, because the "end" of the 
			// buffer is really what we consider to be the "beginning"
			// of the buffer, that is, positions 0 through F.
			//
			// The idea is that the front end of the buffer is duplicated
			// into the back end so that when you're looking at characters
			// at the back end of the buffer, you can index ahead (beyond
			// the normal end of the buffer) and see the characters
			// that are at the front end of the buffer wihtout having
			// to adjust the index.
			//
			// That is...
			//
			//	  1234xxxxxxxxxxxxxxxxxxxxxxxxxxxxx1234
			//	  |							   |  |
			//	  position 0		  end of buffer  |
			//										 |
			//				  duplicate of front of buffer

			p->m_ring_buffer[s] = c;

			if (s < F - 1) {
				p->m_ring_buffer[s + N] = c;
			}

			// Increment the position, and wrap around when we're at
			// the end.  Note that this relies on N being a power of 2.

			s = (short int) ( (s + 1) & (N - 1) );
			r = (short int) ( (r + 1) & (N - 1) );

			// Register the string that is found in 
			// m_ring_buffer[r..r+F-1].

			p->InsertNode(r);
		}

		// If we didn't quit because we hit the last_match_length,
		// then we must have quit because we ran out of characters
		// to process.

		while (i++ < last_match_length) {							  
			p->DeleteNode(s);

			s = (short int) ( (s + 1) & (N - 1) );
			r = (short int) ( (r + 1) & (N - 1) );

			// Note that len hitting 0 is the key that causes the
			// do...while() to terminate.  This is the only place
			// within the loop that len is modified.
			//
			// Its original value is F (or a number less than F for
			// short strings).

			if (--len) {
				p->InsertNode(r);	   /* buffer may not be empty. */
			}
		}

		// End of do...while() loop.  Continue processing until there
		// are no more characters to be compressed.  The variable
		// "len" is used to signal this condition.
	} while (len > 0);

	// There could still be something in the output buffer.  Send it
	// now.

	if (code_buf_pos > 1) {
		// code_buf is the encoded string to send.
		// code_buf_ptr is the number of characters.

		sendChars((char *) code_buf, code_buf_pos);
	}


	// must set zlen for parent class to know length of compressed buffer
	zlen = zpos;
}


/******************************************************************************
 * LZSSCompress::decode	- This function "decodes" the input stream into the
 *						output stream.
 *						The getChars() and sendChars() functions are
 *						used to separate this method from the actual
 *						i/o.
 */

void LZSSCompress::decode(void)
{
	int k;
	int r;							  // node number
	unsigned char c[F];				 // an array of chars
	unsigned char flags;				// 8 bits of flags
	int flag_count;					 // which flag we're on
	short int pos;					  // position in the ring buffer
	short int len;					  // number of chars in ring buffer
	unsigned long totalLen = 0;

	direct = 1;	// set direction needed by parent [Get|Send]Chars()

	// Initialize the ring buffer with a common string.
	//
	// Note that the last F bytes of the ring buffer are not filled.

	memset(p->m_ring_buffer, ' ', N - F);
	
	r = N - F;

	flags = (char) 0;
	flag_count = 0;

	for ( ; ; ) {

		// If there are more bits of interest in this flag, then
		// shift that next interesting bit into the 1's position.
		//
		// If this flag has been exhausted, the next byte must 
		// be a flag.

		if (flag_count > 0) {
			flags = (unsigned char) (flags >> 1);
			flag_count--;
		}
		else {
			// Next byte must be a flag.

			if (getChars((char *) &flags, 1) != 1)
				break;

			// Set the flag counter.  While at first it might appear
			// that this should be an 8 since there are 8 bits in the
			// flag, it should really be a 7 because the shift must
			// be performed 7 times in order to see all 8 bits.

			flag_count = 7;
		}

		// If the low order bit of the flag is now set, then we know
		// that the next byte is a single, unencoded character.

		if (flags & 1) {
			if (getChars((char *) c, 1) != 1)
				break;

			if (sendChars((char *) c, 1) != 1) {
				break;
			}
			totalLen++;

			// Add to buffer, and increment to next spot. Wrap at end.

			p->m_ring_buffer[r] = c[0];
			r = (short int) ( (r + 1) & (N - 1) );
		}

		// Otherwise, we know that the next two bytes are a
		// <position,length> pair.  The position is in 12 bits and
		// the length is in 4 bits.

		else {
			// Original code:
			//  if ((i = getc(infile)) == EOF)
			//	  break;
			//  if ((j = getc(infile)) == EOF)
			//	  break;
			//  i |= ((j & 0xf0) << 4);	
			//  j = (j & 0x0f) + THRESHOLD;
			//
			// I've modified this to only make one input call, and
			// have changed the variable names to something more
			// obvious.

			if (getChars((char *) c, 2) != 2)
				break;

			// Convert these two characters into the position and
			// length.  Note that the length is always at least
			// THRESHOLD, which is why we're able to get a length
			// of 18 out of only 4 bits.

			pos = (short int) ( c[0] | ((c[1] & 0xf0) << 4) );

			len = (short int) ( (c[1] & 0x0f) + THRESHOLD );

			// There are now "len" characters at position "pos" in
			// the ring buffer that can be pulled out.  Note that
			// len is never more than F.

			for (k = 0; k < len; k++) {
				c[k] = p->m_ring_buffer[(pos + k) & (N - 1)];

				// Add to buffer, and increment to next spot. Wrap at end.

				p->m_ring_buffer[r] = c[k];
				r = (short int) ( (r + 1) & (N - 1) );
			}

			// Add the "len" :characters to the output stream.

			if (sendChars((char *) c, len) != (unsigned int)len) {
				break;
			}
			totalLen += len;
		}
	}
	slen = totalLen;
}

SWORD_NAMESPACE_END
