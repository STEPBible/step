#ifndef _RENDERCALLBACK_H
#define _RENDERCALLBACK_H
#include <swbuf.h>
#include <swmodule.h>
#include <swkey.h>
#include <swbasicfilter.h>
#include <utilxml.h>
#include <osishtmlhref.h>
#include <thmlhtmlhref.h>

#define FAILED 0
#define SUCCEEDED 1
#define INHERITED 2

using namespace sword;

class ReturnSuccess 
{
public:
	ReturnSuccess(): data(""), success(FAILED) {}
	ReturnSuccess(const char* data, int success): data(data), success(success) {}
	virtual ~ReturnSuccess() {}
	const char* data;
	int success;
};


class RenderCallback {
public:
	virtual ~RenderCallback() {;}

	virtual ReturnSuccess run(sword::SWBuf& x, const char * token, 
			sword::BasicFilterUserData* userData) 
	{
		ReturnSuccess nullm("", INHERITED);
		return nullm;
	}
};

// Forward declarations
class OSISData;
class ThMLData;


class PyOSISHTMLHREF: public sword::OSISHTMLHREF 
{
private:
	RenderCallback* _callback;

public:
	// Create a class which can be inherited externally
#ifndef SWIG
	using sword::OSISHTMLHREF::MyUserData;
	class MyOsisUserData : public MyUserData {
		public:
		MyOsisUserData(const SWModule *module, const SWKey *key):
			MyUserData(module, key) {};
	};
#endif
	
	using sword::OSISHTMLHREF::removeTokenSubstitute;
	using sword::OSISHTMLHREF::addTokenSubstitute;
	using sword::OSISHTMLHREF::addAllowedEscapeString;
	using sword::OSISHTMLHREF::removeAllowedEscapeString;
		
	PyOSISHTMLHREF(RenderCallback* callback)
	{
		_callback=callback;
	}

	static OSISData* getData(sword::BasicFilterUserData* f)
	{
		return (OSISData*) f;
	}
			
	virtual ~PyOSISHTMLHREF() 
	{ 
		delCallback();
	} 
	
	void delCallback() 
	{
		delete _callback;
		_callback = 0;
	}
	
	void setCallback(RenderCallback *cb)
	{
		delCallback();
		_callback = cb;
	}

	ReturnSuccess call(sword::SWBuf &buf, const char *token, sword::BasicFilterUserData *userData)
	{ 
		if (_callback) return _callback->run(buf, token, userData); 
		else 
		{
			ReturnSuccess nullm("", INHERITED);
			return nullm;
		}
	}

protected:
	virtual bool handleToken(sword::SWBuf &buf, const char *token, sword::BasicFilterUserData *userData)
	{
		SWBuf scratch;
		bool sub = (userData->suspendTextPassThru) ? substituteToken(scratch, token) : substituteToken(buf, token);
		if(sub) return true;

		ReturnSuccess result = call(buf, token, userData);
		switch(result.success)
		{
			case INHERITED:
				return sword::OSISHTMLHREF::handleToken(buf, token, userData);
			case FAILED: 		 
				return false;
			case SUCCEEDED:
				buf += result.data;
				return true;
		}		

		return true;
	}
};


class PyThMLHTMLHREF : public ThMLHTMLHREF {
private:
	RenderCallback* _callback;
public:
	// Create a class which can be inherited externally
#ifndef SWIG
	using sword::ThMLHTMLHREF::MyUserData;
	class MyThmlUserData : public MyUserData {
		public:
		MyThmlUserData(const SWModule *module, const SWKey *key):
			MyUserData(module, key) {};
	};
#endif

	using sword::ThMLHTMLHREF::removeTokenSubstitute;	
	using sword::ThMLHTMLHREF::addTokenSubstitute;
	using sword::ThMLHTMLHREF::addAllowedEscapeString;
	using sword::ThMLHTMLHREF::removeAllowedEscapeString;	
	PyThMLHTMLHREF(RenderCallback* callback)
	{
		_callback=callback;
	}

	static ThMLData* getData(sword::BasicFilterUserData* f)
	{
		return (ThMLData*) f;
	}
	
	virtual ~PyThMLHTMLHREF() 
	{ 
		delCallback();
	} 
	
	void delCallback() 
	{
		delete _callback;
		_callback = 0;
	}
	
	void setCallback(RenderCallback *cb)
	{
		delCallback();
		_callback = cb;
	}

	ReturnSuccess call(sword::SWBuf &buf, const char *token, sword::BasicFilterUserData *userData)		  
	{ 
		if (_callback) return _callback->run(buf, token, userData); 
		else 
		{
			ReturnSuccess nullm("", INHERITED);
			return nullm;
		}
	}
protected:
	virtual bool handleToken(sword::SWBuf &buf, const char *token, sword::BasicFilterUserData *userData)
	{
		SWBuf scratch;
		bool sub = (userData->suspendTextPassThru) ? substituteToken(scratch, token) : substituteToken(buf, token);
		if(sub) return true;
		
		ReturnSuccess result = call(buf, token, userData);
		switch(result.success)
		{
			case INHERITED:
				return sword::ThMLHTMLHREF::handleToken(buf, token, userData);
			case FAILED: 		 
				return false;
		case SUCCEEDED:
			buf += result.data;
			return true;
		}		

		return true;
	}
};

class OSISData : 
#ifndef SWIG
public PyOSISHTMLHREF::MyOsisUserData {
public:
	OSISData(const SWModule *module, const SWKey *key):
	PyOSISHTMLHREF::MyOsisUserData(module, key) {};
#else
// trick SWIG into thinking this is not inherited from an inner class...
public sword::BasicFilterUserData 
{
public:
	bool osisQToTick;
	bool inBold;
	bool inXRefNote;
	bool isBiblicalText;
	int suspendLevel;
	SWBuf wordsOfChristStart;
	SWBuf wordsOfChristEnd;
	SWBuf lastTransChange;
	SWBuf w;
	SWBuf fn;
	SWBuf version;

#endif //!SWIG
};

class ThMLData : 
#ifndef SWIG
public PyThMLHTMLHREF::MyThmlUserData {
	public:
	ThMLData(const SWModule *module, const SWKey *key):
		PyThMLHTMLHREF::MyThmlUserData(module, key) {};

#else
// trick SWIG into thinking this is not inherited from an inner class...
public sword::BasicFilterUserData 
{
public:
	SWBuf inscriptRef;
	bool inSecHead;
	bool isBiblicalText;
	SWBuf version;
	XMLTag startTag;	

#endif //!SWIG
};

#endif // _RENDERCALLBACK_H
