%{
#include "treekey.h"
%}

%ignore sword::TreeKey::getUserData(int *);
%ignore sword::TreeKey::setUserData(const char *, int);

%include <carrays.i>

//%pointer_class(unsigned char, BytePointer);
//%array_class(unsigned char, ByteArray);

%include "treekey.h"

%extend sword::TreeKey {
	static sword::TreeKey *castTo(sword::SWKey *o) {
		return dynamic_cast<sword::TreeKey*>(o);
	}
}

/*
%extend sword::TreeKey {

        const unsigned char *getUserData2() {
                return (const unsigned char*)(self->getUserData(0));
        }

        int getUserDataSize() {
                int s;
                self->getUserData(&s);
                return s;
        }

        void setUserData(unsigned char data[], int size) {
                self->setUserData(((const char*)(data)), size);
        }
};
*/
