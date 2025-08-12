%{
#include "zld.h"
%}

%include "zld.h"

%extend sword::zLD {
	static sword::zLD *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::zLD*>(o);
	}
}
