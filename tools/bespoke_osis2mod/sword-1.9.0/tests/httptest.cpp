#include <curlhttpt.h>
#include <filemgr.h>
#include <vector>
#include <iostream>

using sword::RemoteTransport;
using sword::CURLHTTPTransport;
using sword::DirEntry;
using std::vector;
using std::cout;
using std::endl;

int main(int argc, char **argv) {
	RemoteTransport *t = new CURLHTTPTransport("crosswire");
	vector<DirEntry> x = t->getDirList("https://ftp.crosswire.org/ftpmirror/pub/sword/raw/");
//	auto x = t->getDirList("https://crosswire.org/ftpmirror/pub/sword/raw/");
	for (vector<DirEntry>::const_iterator i = x.begin(); i != x.end(); ++i) {
		cout << i->name << "\t" << i->size << "\t" << i->isDirectory << endl;
	}
	return 0;
}
