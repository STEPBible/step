%{
#include "listkey.h"
%}

%ignore sword::ListKey::operator<<;
%ignore sword::ListKey::ClearList;
%ignore sword::ListKey::Count;
%ignore sword::ListKey::Remove;
%ignore sword::ListKey::SetToElement;
%ignore sword::ListKey::GetElement;

%include "listkey.h"

/*
%extend {
	virtual char SetToElement(int element) {
		return self->SetToElement(element, TOP);
	};
}
*/

%extend sword::ListKey {
	static sword::ListKey *castTo(sword::SWKey *o) {
		return dynamic_cast<sword::ListKey*>(o);
	}
}
