package com.tyndalehouse.step.tools.modules;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

public class ExtractHeaderInformationSax extends DefaultHandler {
    private boolean titleFlag, descriptionFlag, copyrightFlag, versificationFlag, languageFlag, licenseFlag, 
            headerFlag, aboutFlag, revisionFlag;
    private StringBuilder title = new StringBuilder(64);
    private StringBuilder description = new StringBuilder(256);
    private StringBuilder copyright = new StringBuilder(1024);
    private String versification = "KJV";
    private String language;
    private StringBuilder license = new StringBuilder(1024);
    private StringBuilder about = new StringBuilder(1024);
    private boolean hasCrossRefs = false;
    private boolean hasStrongs = false;
    private boolean hasFootNotes = false;
    private boolean hasRedLetter = false;
    private boolean hasHeadings = false;
    private boolean hasMorphology = false;
    private boolean finalVersification = false;

    @Override
    public void startElement(final String uri, final String localName, final String qName, final Attributes attributes) throws SAXException {
        if ("header".equals(qName)) {
            headerFlag = true;
        } else if (headerFlag && title.length() == 0 && "title".equals(qName)) {
            titleFlag = true;
        } else if(headerFlag && "p".equals(qName)) {
            aboutFlag = true;
        } else if (description.length() == 0 && "description".equals(qName)) {
            this.descriptionFlag = true;
        } else if (copyright.length() == 0 && "rights".equals(qName) && "x-copyright".equals(attributes.getValue("type"))) {
            this.copyrightFlag = true;
        } else if (license.length() == 0 && "rights".equals(qName) && "x-license".equals(attributes.getValue("type"))) {
            this.licenseFlag = true;
        } else if (language == null && "language".equals(qName) && "x-ethnologue".equals(attributes.getValue("type"))) {
            this.languageFlag = true;
        } else if ("note".equals(qName)) {
            final boolean isCrossRef = "crossReference".equals(attributes.getValue("type"));
            this.hasCrossRefs |= isCrossRef;
            this.hasFootNotes |= !isCrossRef;
        } else if ("w".equals(qName)) {
            this.hasStrongs = attributes.getValue("lemma") != null;
            this.hasMorphology = attributes.getValue("morph") != null;
        } else if (!headerFlag && "title".equals(qName)) {
            this.hasHeadings = true;
        } else if(!headerFlag && "q".equals(qName) && "Jesus".equals(attributes.getValue("who"))) {
            this.hasRedLetter = true;
        } else if("verse".equals(qName)) {
            determineVersification(attributes);
        }
    }

    private void determineVersification(final Attributes attributes) {
        if(finalVersification) {
            return;
        }
        final String osisID = attributes.getValue("osisID");
        if(osisID == null) {
            return;
        }
        
        if(osisID.contains("3Macc.1.29")) {
            this.versification = "NRSVA";
            this.finalVersification = true;
        }
        
        if(osisID.contains("Tob") || osisID.contains("Macc")) {
            if(this.versification.equals("NRSV")) {
                this.versification = "NRSVA";
            } else {
                this.versification = "KJVA";
            }
        } else if(osisID.startsWith("3John.1.15")) {
            if(this.versification.equals("KJVA")) {
                this.versification = "NRSVA";   
            } else {
                this.versification = "NRSV";
            }
        }
    }

    @Override
    public void endElement(final String uri, final String localName, final String qName) throws SAXException {
        if ("title".equals(qName)) {
            titleFlag = false;
        } else if ("description".equals(qName)) {
            descriptionFlag = false;
        } else if ("rights".equals(qName)) {
            copyrightFlag = false;
            licenseFlag = false;
        } else if ("language".equals(qName)) {
            languageFlag = false;
        } else if ("header".equals(qName)) {
            headerFlag = false;
        } else if("p".equals(qName)) {
            aboutFlag = false;
        }
    }

    @Override
    public void characters(final char[] ch, final int start, final int length) throws SAXException {
        if (titleFlag) {
            title.append(ch, start, length);
        } else if (descriptionFlag) {
            description.append(ch, start, length);
        } else if (copyrightFlag) {
            copyright.append(ch, start, length);
        } else if (versificationFlag) {
            versification = new String(ch, start, length);
        } else if (licenseFlag) {
            license.append(ch, start, length);
        } else if (languageFlag) {
            language = new String(ch, start, length);
        } else if(aboutFlag) {
            about.append(ch, start, length);
        }
    }

    
    private String sanitizeDescription(StringBuilder sb) {
        return sanitize(sb).replaceAll("New Testament", "NT").replaceAll("Old Testament", "OT");
    }
    
    private String sanitize(StringBuilder sb) {
        return sb.toString().replaceAll("[\r\n\t]+", " ").replaceAll("  ", " ");
    }
    
    public String getTitle() {
        return sanitize(title);
    }

    public String getDescription() {
        return sanitizeDescription(description);
    }

    public String getCopyright() {
        return sanitize(copyright);
    }

    public String getVersification() {
        return versification;
    }

    public String getLanguage() {
        return language;
    }

    public String getLicense() {
        return sanitize(license);
    }

    public String getAbout() {
        return sanitize(about);
    }

    public boolean isHasCrossRefs() {
        return hasCrossRefs;
    }

    public boolean isHasStrongs() {
        return hasStrongs;
    }

    public boolean isHasFootNotes() {
        return hasFootNotes;
    }

    public boolean isHasRedLetter() {
        return hasRedLetter;
    }

    public boolean isHasHeadings() {
        return hasHeadings;
    }

    public boolean isHasMorphology() {
        return hasMorphology;
    }
}
