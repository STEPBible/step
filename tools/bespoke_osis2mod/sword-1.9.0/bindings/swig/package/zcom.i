%{
#include "zverse.h"
#include "zcom.h"
%}

%include "zcom.h"

%extend sword::zCom {
	static sword::zCom *castTo(sword::SWModule *o) {
		return dynamic_cast<sword::zCom*>(o);
	}
}
