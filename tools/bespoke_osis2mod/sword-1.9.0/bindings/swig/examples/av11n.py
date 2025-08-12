#!/usr/bin/env python
#
# This does a very roughshod attempt to compare the osisIDs found in an
# XML file with each of the versifications that SWORD knows about to help
# a user find the one which is most akin to the one they are using. It is
# limited in its need for your file to be at least segregated into OT/NT
# in the proper order, although within each testament, it requires nothing
# special as for ordering.
#
# Invoke simply by calling the program and the file name.  If you want
# more output, change the following line to be True instead of False
verbose = False
debug = True
import sys
import re
verseid = re.compile('^.+\..+\..+$')

# Inform the user that we need the SWORD extension
try:
	import Sword
except:
	print "You do not have the SWORD library installed. Please install it."
	sys.exit(1)

# Inform the user that we need pyquery, as it makes parsing XML files that much easier
try:
	from pyquery import PyQuery as pq
except:
	print "You do not appear to have PyQuery installed. Please install it."
	sys.exit(2)

# Without the name of a file, we cannot proceed any further
if len(sys.argv) < 2 or sys.argv[1] == '--help':
	print "Usage: %s <OSISfile>" % (sys.argv[0],)

# Open the file
if debug:
	print 'Opening %s' % (sys.argv[1],)
d = pq(filename=sys.argv[1])
# Get the list of versifications
if debug:
	print 'Fetching a list of versifications'
vmgr = Sword.VersificationMgr.getSystemVersificationMgr()
av11ns = vmgr.getVersificationSystems()

# Get the list of all osisIDs
if debug:
	print 'Fetching a list of OSIS IDs'
ids = d("*[osisID]")
# Iterate each versification scheme
for v11n in av11ns:
	print 'Checking %s' % (v11n.c_str(),)
	# Construct a list of the IDs in this versification
	key = Sword.VerseKey()
	key.setVersificationSystem(v11n.c_str())
	otkeyList = [] # Anything left in this afterwards is missing from the OSIS ot
	ntkeyList = [] # Anything left in this afterwards is missing from the OSIS nt
	otextraKeys = [] # Anything that gets placed in here is extraneous OT material (we think)
	ntextraKeys = [] # Anything that gets placed in here is extraneous NT material (we think)
	
	inNT = False
	while key.popError() == '\x00':
		skey = key.getOSISRef()
		if not inNT and re.match('^Matt', skey): # Assume we enter the NT when we hit Matthew
			inNT = True
		if inNT:
			ntkeyList.append(skey)
		else:
			otkeyList.append(skey)
		key.increment()
	ntkeyList = set(ntkeyList) # The 'in' operator only works on a set
	otkeyList = set(otkeyList)
	
	inNT = False
	# Now iterate the ones we have in this file
	for e in ids:
		osisid = e.attrib.get('osisID')
		#print 'Checking key %s' % (osisid,)
		if osisid in otkeyList:
			otkeyList.remove(osisid)
		elif osisid in ntkeyList:
			ntkeyList.remove(osisid)
			inNT = True
		elif verseid.match(osisid) and inNT:
			ntextraKeys.append(osisid)
		elif verseid.match(osisid) and not inNT:
			otextraKeys.append(osisid)
		# Ignore it if not verseid.match() 
			
	# Now let's see what is left over
	keyList = list(otkeyList.union(ntkeyList)) # Sets in Python cannot be ordered
	keyList.sort()
	if len(keyList) > 0:
		if verbose:
			print '\tThe following IDs do not appear in your file:'
			for k in keyList:
				print k
		else:
			print '\tThere are %d OT IDs and %d NT IDs in the versification which are not in your file.' % (len(otkeyList), len(ntkeyList))
	else:
		print '\tYour file has all the references in this versification'
		
	# Now let's see if you had extra
	if len(otextraKeys + ntextraKeys) > 0:
		if verbose:
			print '\tThe following IDs do not appear in the versification:'
			for k in ntextraKeys + otextraKeys:
				print k
		else:
			print '\tThere are %d OT IDs and %d NT IDs in your file which do not appear in the versification.' % (len(otextraKeys), len(ntextraKeys))
	else:
		print '\tYour file has no extra references'
