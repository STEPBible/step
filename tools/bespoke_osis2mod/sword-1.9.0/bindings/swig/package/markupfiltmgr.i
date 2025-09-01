%{
#include <markupfiltmgr.h>
using namespace sword;
%}

%include "markupfiltmgr.h"


%extend sword::MarkupFilterMgr {
	static sword::MarkupFilterMgr *castTo(sword::SWFilterMgr *o) {
		return dynamic_cast<sword::MarkupFilterMgr*>(o);
	}
}
