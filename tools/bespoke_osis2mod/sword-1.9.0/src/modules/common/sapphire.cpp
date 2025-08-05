/******************************************************************************
 *
 *  sapphire.cpp -	the Saphire II stream cipher class
 *
 * $Id: sapphire.cpp 3786 2020-08-30 11:35:14Z scribe $
 * 
 * Copyright 1999-2013 CrossWire Bible Society (http://www.crosswire.org)
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

/******************************************************************************
 *
 * Original license notice & credits:
 * Dedicated to the Public Domain the author and inventor:
 * (Michael Paul Johnson).  This code comes with no warranty.
 * Use it at your own risk.
 * Ported from the Pascal implementation of the Sapphire Stream
 * Cipher 9 December 1994.
 * Added hash pre- and post-processing 27 December 1994.
 * Modified initialization to make index variables key dependent,
 * made the output function more resistant to cryptanalysis,
 * and renamed to Sapphire II 2 January 1995
 *
 */

#include <string.h>

#include "sapphire.h"

SWORD_NAMESPACE_START

unsigned char Sapphire::keyrand(int limit,
                                unsigned char *user_key,
                                unsigned char keysize,
                                unsigned char *rsum,
                                unsigned *keypos)
    {
    unsigned u,             // Value from 0 to limit to return.
        retry_limiter,      // No infinite loops allowed.
        mask;               // Select just enough bits.

    if (!limit) return 0;   // Avoid divide by zero error.
    retry_limiter = 0;
    mask = 1;               // Fill mask with enough bits to cover
    while (mask < (unsigned)limit)    // the desired range.
        mask = (mask << 1) + 1;
    do
        {
        *rsum = cards[*rsum] + user_key[(*keypos)++];
        if (*keypos >= keysize)
            {
            *keypos = 0;            // Recycle the user key.
            *rsum += keysize;   // key "aaaa" != key "aaaaaaaa"
            }
        u = mask & *rsum;
        if (++retry_limiter > 11)
            u %= limit;     // Prevent very rare long loops.
        }
    while (u > (unsigned)limit);
    return u;
    }

void Sapphire::initialize(unsigned char *key, unsigned char keysize)
    {
    // Key size may be up to 256 bytes.
    // Pass phrases may be used directly, with longer length
    // compensating for the low entropy expected in such keys.
    // Alternatively, shorter keys hashed from a pass phrase or
    // generated randomly may be used. For random keys, lengths
    // of from 4 to 16 bytes are recommended, depending on how
    // secure you want this to be.

    int i;
    unsigned char toswap, swaptemp, rsum;
    unsigned keypos;

    // If we have been given no key, assume the default hash setup.

    if (keysize < 1)
        {
        hash_init();
        return;
        }

    // Start with cards all in order, one of each.

    for (i=0;i<256;i++)
        cards[i] = i;

    // Swap the card at each position with some other card.

    toswap = 0;
    keypos = 0;         // Start with first byte of user key.
    rsum = 0;
    for (i=255;i>=0;i--)
        {
        toswap = keyrand(i, key, keysize, &rsum, &keypos);
        swaptemp = cards[i];
        cards[i] = cards[toswap];
        cards[toswap] = swaptemp;
        }

    // Initialize the indices and data dependencies.
    // Indices are set to different values instead of all 0
    // to reduce what is known about the state of the cards
    // when the first byte is emitted.

    rotor = cards[1];
    ratchet = cards[3];
    avalanche = cards[5];
    last_plain = cards[7];
    last_cipher = cards[rsum];

    toswap = swaptemp = rsum = 0;
    keypos = 0;
    }

void Sapphire::hash_init(void)
    {
    // This function is used to initialize non-keyed hash
    // computation.

    int i, j;

    // Initialize the indices and data dependencies.

    rotor = 1;
    ratchet = 3;
    avalanche = 5;
    last_plain = 7;
    last_cipher = 11;

    // Start with cards all in inverse order.

    for (i=0, j=255;i<256;i++,j--)
        cards[i] = (unsigned char) j;
    }

Sapphire::Sapphire(unsigned char *key, unsigned char keysize)
    {
    if (key && keysize)
        initialize(key, keysize);
    }

void Sapphire::burn(void)
    {
    // Destroy the key and state information in RAM.
    memset(cards, 0, 256);
    rotor = ratchet = avalanche = last_plain = last_cipher = 0;
    }

Sapphire::~Sapphire()
    {
    burn();
    }

unsigned char Sapphire::encrypt(unsigned char b)
    {
    // Picture a single enigma rotor with 256 positions, rewired
    // on the fly by card-shuffling.

    // This cipher is a variant of one invented and written
    // by Michael Paul Johnson in November, 1993.

    unsigned char swaptemp;

    // Shuffle the deck a little more.

    ratchet += cards[rotor++];
    swaptemp = cards[last_cipher];
    cards[last_cipher] = cards[ratchet];
    cards[ratchet] = cards[last_plain];
    cards[last_plain] = cards[rotor];
    cards[rotor] = swaptemp;
    avalanche += cards[swaptemp];

    // Output one byte from the state in such a way as to make it
    // very hard to figure out which one you are looking at.

    last_cipher = b^cards[(cards[ratchet] + cards[rotor]) & 0xFF] ^
                  cards[cards[(cards[last_plain] +
                               cards[last_cipher] +
                               cards[avalanche])&0xFF]];
    last_plain = b;
    return last_cipher;
    }

unsigned char Sapphire::decrypt(unsigned char b)
    {
    unsigned char swaptemp;

    // Shuffle the deck a little more.

    ratchet += cards[rotor++];
    swaptemp = cards[last_cipher];
    cards[last_cipher] = cards[ratchet];
    cards[ratchet] = cards[last_plain];
    cards[last_plain] = cards[rotor];
    cards[rotor] = swaptemp;
    avalanche += cards[swaptemp];

    // Output one byte from the state in such a way as to make it
    // very hard to figure out which one you are looking at.

    last_plain = b^cards[(cards[ratchet] + cards[rotor]) & 0xFF] ^
                   cards[cards[(cards[last_plain] +
                                cards[last_cipher] +
                                cards[avalanche])&0xFF]];
    last_cipher = b;
    return last_plain;
    }

void Sapphire::hash_final(unsigned char *hash,      // Destination
                          unsigned char hashlength) // Size of hash.
    {
    int i;

    for (i=255;i>=0;i--)
        encrypt((unsigned char) i);
    for (i=0;i<hashlength;i++)
        hash[i] = encrypt(0);
    }

SWORD_NAMESPACE_END
