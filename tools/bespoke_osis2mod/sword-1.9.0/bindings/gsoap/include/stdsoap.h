/*	stdsoap.h

	Copyright (C) 2001 Robert A. van Engelen, Florida State University.
	All rights reserved.
*/

#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <ctype.h>
#include <limits.h>
#include <sys/types.h>
#ifndef WIN32
#include <netinet/tcp.h>	/* for TCP_NODELAY */
#include <arpa/inet.h>
#endif

#ifdef WITH_OPENSSL
#include <openssl/ssl.h>
#include <openssl/err.h>
#ifndef ALLOW_OLD_VERSIONS
#if (OPENSSL_VERSION_NUMBER < 0x00905100L)
#error "Must use OpenSSL 0.9.6 or later"
#endif
#endif
#endif

#include <math.h>	/* for isnan(): remove if NAN and INF support is not required */
#include <time.h>	/* for time_t (xsd:dateTime) support, remove if not required */

#ifndef _MATH_H
#define isnan(_) (0)
#else
extern struct soap_double_nan { int n1, n2; } soap_double_nan;
#endif

#ifndef STDSOAP
#define STDSOAP

#ifndef WIN32
#define LONG64 long long
#define ULONG64 unsigned long long
#endif

/* #define DEBUG */ /* Uncomment to debug sending (in file SENT.log) receiving (in file RECV.log) and messages (in file TEST.log) */

#define SOAP_BUFLEN    8192 /* buffer length for socket packets */
#define SOAP_MAXLEN     256 /* maximum length of buffer to hold XML number representations */
#define SOAP_PTRHASH   1024 /* size of pointer analysis hash table (must be power of 2) */
#define SOAP_IDHASH      16 /* size of hash table for element id's */
#define SOAP_BLKLEN     256 /* size of blocks to collect long strings */
#define SOAP_TAGLEN     256 /* maximum length of XML tag/element names + 1 */

typedef long wchar; /* for compatibility */

#ifndef FLT_NAN
#ifdef _MATH_H
#define FLT_NAN (*(float*)&soap_double_nan)
#else
#define FLT_NAN	(0.0)
#endif
#endif
#ifndef FLT_PINFTY
#ifdef HUGE_VAL
#define FLT_PINFTY (float)HUGE_VAL
#else
#ifdef FLT_MAX
#define FLT_PINFTY FLT_MAX
#else
#ifdef FLOAT_MAX
#define FLT_PINFTY FLOAT_MAX
#else
#define FLT_PINFTY (3.40282347e+38)
#endif
#endif
#endif
#endif
#ifndef FLT_NINFTY
#define FLT_NINFTY (-FLT_PINFTY)
#endif

#ifndef DBL_NAN
#ifdef _MATH_H
#define DBL_NAN (*(double*)&soap_double_nan)
#else
#define DBL_NAN (0.0)
#endif
#endif
#ifndef DBL_PINFTY
#ifdef HUGE_VAL
#define DBL_PINFTY (double)HUGE_VAL
#else
#ifdef DBL_MAX
#define DBL_PINFTY DBL_MAX
#else
#ifdef DOUBLE_MAX
#define DBL_PINFTY DOUBLE_MAX
#else
#define DBL_PINFTY (1.7976931348623157e+308)
#endif
#endif
#endif
#endif
#ifndef DBL_NINFTY
#define DBL_NINFTY (-DBL_PINFTY)
#endif

extern int (*soap_fpost)(const char*, const char*, const char*, const char*, size_t);
extern int (*soap_fresponse)(int, size_t);
extern int (*soap_fparse)();
extern int (*soap_fopen)(const char*, const char*, int);
extern int (*soap_fclose)();
extern int (*soap_fsend)(const char*, size_t);
extern size_t (*soap_frecv)(char*, size_t);
extern int (*soap_fignore)(const char*);

extern const char *soap_float_format;	/* points to user-definable format string */
extern const char *soap_double_format;	/* points to user-definable format string */

extern const char *soap_http_version;	/* default = "1.0" */
extern const char *soap_encodingStyle;	/* default = NULL which means that SOAP encoding is used for marshalling */
extern const char *soap_defaultNamespace;	/* default = NULL which means that no default namespace is used */
extern int soap_disable_href;		/* when !=0, disables hrefs so objects are duplicated on the output */
extern int soap_enable_embedding;	/* when !=0, enable hrefs within embedded elements */
extern int soap_enable_null;		/* when !=0, always sends null elements */
extern int soap_enable_utf_string;	/* when !=0, assume strings are UTF8/16 encoded and just emit them */
extern int soap_disable_request_count;	/* when !=0, do not include HTTP Content-Length in request */
extern int soap_disable_response_count;	/* when !=0, do not include HTTP Content-Length in service response (normally calculated by the Web server in case CGI is used so disabling saves time) */
extern int soap_enable_array_overflow;	/* when !=0, allows ignoring remaining elements that do not fit in a fixed-size array */
extern int soap_keep_alive;	/* when !=0, set SO_KEEPALIVE socket and do not close sockets, unless new host/port is accessed */

extern const char *soap_proxy_host;
extern int soap_proxy_port;

#ifdef WITH_OPENSSL
extern SSL_CTX *soap_ssl_ctx;
extern BIO *soap_bio;
extern SSL *soap_ssl;
extern int soap_require_server_auth;
extern const char *soap_keyfile;
extern const char *soap_password;
extern const char *soap_dhfile;
extern const char *soap_cafile;
#endif

#ifdef WIN32
#include <io.h>
#include <winsock.h>
#else
#include <sys/socket.h>
#include <netdb.h>
#include <netinet/in.h>
#include <unistd.h>
#define closesocket(n) close(n)
#endif

int soap_serve();

extern void soap_serializeheader();
extern void soap_putheader();
extern int soap_getheader();
extern void soap_serializefault();
extern void soap_putfault();
extern int soap_getfault();
extern void soap_putindependent();
extern int soap_getindependent();

int soap_bind(const char *hostname, int port, int backlog);
int soap_accept();
int soap_ssl_accept();

struct Namespace {const char *id, *ns, *in;};
extern struct Namespace namespaces[];

static FILE * fdebug;

struct soap_entry
{ int id;
  void *entry;
  int type;
  short marked1;
  short marked2;
  struct soap_entry *next;
};

extern char soap_tag[SOAP_TAGLEN];	/* used by soap_element_begin_in */
extern char soap_id[SOAP_TAGLEN];	/* set by soap_element_begin_in */
extern char soap_href[SOAP_TAGLEN];	/* set by soap_element_begin_in */
extern char soap_type[SOAP_TAGLEN];
extern char soap_arrayType[SOAP_TAGLEN];
extern char soap_arraySize[SOAP_TAGLEN];
extern char soap_xmlns_name[SOAP_TAGLEN];
extern char soap_xmlns_value[SOAP_TAGLEN];
extern char soap_offset[SOAP_TAGLEN];		/* ditto */
extern int soap_position;		/* ditto */
extern int soap_positions[32];		/* ditto */
extern int soap_null;		/* ditto */
extern int soap_counting;
extern int soap_level;
extern int soap_is_in_header;

/* Defining the std soap error codes */

#define SOAP_OK 0
#define SOAP_CLI_FAULT 1
#define SOAP_SVR_FAULT 2
#define SOAP_TAG_MISMATCH 3
#define SOAP_TYPE_MISMATCH 4
#define SOAP_SYNTAX_ERROR 5
#define SOAP_NO_TAG 6
#define SOAP_IOB 7
#define SOAP_MUSTUNDERSTAND 8
#define SOAP_NAMESPACE 9
#define SOAP_OBJ_MISMATCH 10
#define SOAP_FATAL_ERROR 11
#define SOAP_FAULT 12
#define SOAP_NO_METHOD 13
#define SOAP_EOM 14
#define SOAP_NULL 15
#define SOAP_MULTI_ID 16
#define SOAP_MISSING_ID 17
#define SOAP_HREF 18
#define SOAP_TCP_ERROR 19
#define SOAP_HTTP_ERROR 20
#define SOAP_SSL_ERROR 21
#define SOAP_EOF EOF

extern int soap_error ;

/* DEBUG macros */

#ifdef DEBUG
#define DBGLOG(DBGFILE, DBGCMD) \
{\
	fdebug = fopen(#DBGFILE".log", "a");\
	DBGCMD;\
	fclose(fdebug);\
}
#else
#define DBGLOG(DBGFILE, DBGCMD)
#endif  

struct soap_class
{ void *ptr;
  int type;
  int size;
  struct soap_class *next;
};

extern struct soap_class *soap_class_chain;

struct soap_stack
{       struct soap_stack *next;
        char    *id;
        int     i;
        int     level;
};

/*	Hash table (temporarily replaced by array indexing) */

extern struct soap_entry *soap_ptr[SOAP_PTRHASH];

/*int sock;*/
extern int soap_socket;
extern int soap_recvfd;
extern int soap_sendfd;
extern int soap_buffering;
extern unsigned long soap_ip;	/* IP address of connecting party after soap_accept() */

/* send routine */
int soap_send(const char *buf);

int soap_send_hex(int);
int soap_send_base64(const unsigned char *, size_t);

int soap_gethex();
unsigned char *soap_getbase64(int *, int);

extern int errmode ;

int	soap_pointer_lookup(const void *p, int t,struct soap_entry **np1);
int	soap_array_pointer_lookup(const void *p, int n, int t, struct soap_entry **np1);
int	soap_pointer_lookup_id(void *p, int t,struct soap_entry **np1);
int	soap_pointer_enter(const void *p, int t,struct soap_entry **np1);
int	soap_array_pointer_enter(const void *p, int t, struct soap_entry **np1);
void	soap_pointer_dump();
void soap_begin_count();
void soap_begin_send();
int soap_end_send();

void	soap_embedded(const void *p, int t);
int	soap_reference(const void *p, int t);
int	soap_array_reference(const void *p, int n, int t);
int	soap_embedded_id(int id, const void *p, int t);
int	soap_is_embedded(struct soap_entry *);
int	soap_is_single(struct soap_entry *);
int	soap_is_multi(struct soap_entry *);
void	soap_set_embedded(struct soap_entry *);

int	soap_begin_recv();
int	soap_end_recv();
int	soap_getline(char *, int);

void	soap_send_namespaces();

#ifdef WIN32
#define atoll atoi
#else
extern void itoa(int, char*);
#endif

/* The hash table to hold IDs needs entries of the form: */
struct soap_hash_entry
{ int type;
  size_t size;
  void *link; 
  void *copy; 
  void *ptr; 
  int level; 
  struct soap_hash_entry *next;
  char s[4]; 
};

extern struct soap_hash_entry *soap_hash[SOAP_IDHASH];

extern int soap_alloced ;	/* keep this info so we know that object must be init'ed */
extern void *soap_malloc_chain ;

void *	soap_malloc(size_t n);
void soap_dealloc(void *p);

int  	soap_lookup_type(const char *id);

void * 	soap_id_lookup(const char *id, void **p, int t, size_t n, int k);

void *	soap_id_forward(const char *id, void *p, int t, size_t n);

void *	soap_id_enter(const char *id, void *p, int t, size_t n, int k);
void *	soap_class_id_enter(const char *id, void *p, int t, const char *type);

extern int soap_size(const int *, int);
extern int soap_getoffsets(const char *, const int *, int *, int);
extern int soap_getsize(const char *, const char *, int *);
extern int soap_getsizes(const char *, int *, int);
extern int soap_getposition(const char *, int *);
extern char * soap_putsize(const char *, int);
extern char * soap_putsizesoffsets(const char *, const int *, const int *, int);
extern char * soap_putsizes(const char *, const int *, int);
extern char * soap_putoffset(int);
extern char * soap_putoffsets(const int *, int);
extern char * soap_putposition();
 
extern int soap_peeked ;
extern int soap_body;

/*	Support routines (library) */
int soap_ignore_element();

int soap_closesock();

void	soap_init();
void	soap_begin();

int	soap_match_tag(const char*, const char *);

int	soap_match_array(const char*);

void	soap_end();
void	soap_free();
void	soap_destroy();

void	soap_element_begin_out(const char *tag, int id, const char *type);
void	soap_array_begin_out(const char *tag, int id, const char *type, const char *offset);

void	soap_element_end_out(const char *tag);

void	soap_element_ref(const char *tag, int id, int href);

void	soap_element_null(const char *tag, int id, const char *type);

int	soap_element_begin_in(const char *tag);

int	soap_element_end_in(const char *tag);

int	soap_peek_element();
void	soap_revert();

int	soap_ignore_element();

void	soap_convert_string_out(const char *s);

int soap_match_namespace(const char*, const char*, int, int);

void soap_pop_namespace();
int soap_push_namespace(const char *,const char *);

extern int soap_block_size;
extern int soap_new_block();
extern void *soap_push_block(size_t);
extern void soap_pop_block();
extern void soap_store_block(char *);

void	*soap_instantiate(int t, const char *);
void	soap_delete(void *, int, int);

void	soap_outint(const char *tag, int id, const int *p, const char *, int);
int *	soap_inint(const char *tag, int *p, const char *, int);

void	soap_outbyte(const char *tag, int id, const char *p, const char *, int);
char *	soap_inbyte(const char *tag, char *p, const char *, int);

void	soap_outlong(const char *tag, int id, const long *p, const char *, int);
long *	soap_inlong(const char *tag, long *p, const char *, int);

void	soap_outLONG64(const char *tag, int id, const LONG64 *p, const char *, int);
LONG64 *	soap_inLONG64(const char *tag, LONG64 *p, const char *, int);

void	soap_outshort(const char *tag, int id, const short *p, const char *, int);
short *	soap_inshort(const char *tag, short *p, const char *, int);

void	soap_outfloat(const char *tag, int id, const float *p, const char *, int);
float *	soap_infloat(const char *tag, float *p, const char *, int);

void	soap_outdouble(const char *tag, int id, const double *p, const char *, int);
double * soap_indouble(const char *tag, double *p, const char *, int);

void	soap_outunsignedByte(const char *tag, int id, const unsigned char *p, const char *, int);
unsigned char *	soap_inunsignedByte(const char *tag, unsigned char *p, const char *, int);

void	soap_outunsignedShort(const char *tag, int id, const unsigned short *p, const char *, int);
unsigned short * soap_inunsignedShort(const char *tag, unsigned short *p, const char *, int);

void	soap_outunsignedInt(const char *tag, int id, const unsigned int *p, const char *, int);
unsigned int *	soap_inunsignedInt(const char *tag, unsigned int *p, const char *, int);

void	soap_outunsignedLong(const char *tag, int id, const unsigned long *p, const char *, int);
unsigned long *	soap_inunsignedLong(const char *tag, unsigned long *p, const char *, int);

void	soap_outunsignedLONG64(const char *tag, int id, const ULONG64 *p, const char *, int);
ULONG64 *	soap_inunsignedLONG64(const char *tag, ULONG64 *p, const char *, int);

void	soap_outstring(const char *tag, int id, char *const*p, const char *, int);
char **	soap_instring(const char *tag, char **p, const char *, int);

void	soap_outwstring(const char *tag, int id, wchar_t *const*p, const char *, int);
wchar_t **soap_inwstring(const char *tag, wchar_t **p, const char *, int);

void	soap_outliteral(const char *tag, char *const*p);
char **soap_inliteral(const char *tag, char **p);

void	soap_outwliteral(const char *tag, wchar_t *const*p);
wchar_t **soap_inwliteral(const char *tag, wchar_t **p);

#ifdef _TIME_H
void	soap_outdateTime(const char *tag, int id, const time_t *p, const char *, int);
time_t *soap_indateTime(const char *tag, time_t *p, const char *, int);
#endif

char *soap_value();

wchar soap_skip();

/*	1. generate the prototypes and encode all types (base types are defined above) */

void soap_envelope_begin_out();
void soap_envelope_end_out();

int soap_envelope_begin_in();
int soap_envelope_end_in();

void soap_body_begin_out();
void soap_body_end_out();

int soap_body_begin_in();
int soap_body_end_in();

int soap_recv_header();

int soap_connect(const char *URL, const char *action);

int soap_response();

/* Methods dealing with the fault struct*/

int soap_send_fault();

int soap_recv_fault();

extern void soap_print_fault(FILE*);
extern void soap_print_fault_location(FILE*);

#endif
