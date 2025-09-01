%{
#include "swkey.h"
%}

%ignore sword::SWKey::userData;
%ignore sword::SWKey::Index;
%ignore sword::SWKey::Traversable;

%rename (getPosition) sword::SW_POSITION::operator char;

%include "swkey.h"

#ifndef SWIGPERL
%rename(__str__) sword::SWKey::operator const char *;
#endif
