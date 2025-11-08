#include <markupfiltmgr.h>
#include <swbuf.h>
#include <defs.h>
using namespace sword;

class MarkupCallback {
public:
	virtual ~MarkupCallback() { ;}
	virtual bool run(SWModule* x) {return false;}
};

class MyMarkup : public MarkupFilterMgr {
private:
	MarkupCallback* _callback;

public:
	MyMarkup(MarkupCallback* callback, char markup = FMT_THML, char encoding = ENC_UTF8) :
		MarkupFilterMgr(markup, encoding), _callback(callback) {}

	virtual ~MyMarkup() {
		delCallback();
	}

	void delCallback() {
		delete _callback; _callback = 0;
	}

	void setCallback(MarkupCallback *cb) {
		delCallback();
		_callback = cb;
	}

	bool call(SWModule* x) {
		if (_callback)
			return _callback->run(x);
		return false;
	}

protected:
	virtual void addRenderFilters(SWModule *module,
			ConfigEntMap &section) {
		if(!call(module)) {
			MarkupFilterMgr::addRenderFilters(module, section);
		}
	}
};
