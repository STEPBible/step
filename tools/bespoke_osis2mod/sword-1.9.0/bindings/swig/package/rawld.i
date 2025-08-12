%{
#include "rawld.h"
%}

%include "rawld.h"

%extend sword::RawLD {
	static sword::RawLD *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::RawLD*>(o);
	}

}
