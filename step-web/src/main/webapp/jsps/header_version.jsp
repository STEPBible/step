<%@ page contentType="text/html; charset=UTF-8" language="java" %> 

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<HTML>
<HEAD>
    <TITLE><%= request.getParameter("title") %></TITLE>
    <% String reqInitial = request.getParameter("initial");
    if (reqInitial != null) {
        reqInitial = reqInitial.trim(); %>
        <script type="application/ld+json">
            {
                "@context": "https://schema.org/",
                "@type": "CreativeWork",
                "url": "https://www.STEPBible.org",
                "sameas": "https://en.wikipedia.org/wiki/The_SWORD_Project#STEPBible",
                "description": "Free Bible study software for Windows, Mac, Linux, iPhone, iPad and Android. Software can search and display Greek / Hebrew lexicons, interlinear Bibles...",
                "name": "STEPBible - <%= reqInitial %> ",
        <% if (reqInitial.equals("NIV")) { %>
                "author": {
                    "@type": "Person",
                    "name": "Douglas Moo",
                    "jobTitle": "Wessner Chair of Biblical Studies, Wheaton College",
                    "url": "https://en.wikipedia.org/wiki/Douglas_J._Moo",
                    "affiliation": {
                        "@type": "Organization",
                        "name": "Wheaton College",
                        "url": "https://www.wheaton.edu/"
                    },
                    "memberOf": {
                        "@type": "Organization",
                        "name": "Committee on Bible Translation",
                        "url": "https://www.biblica.com/niv-bible/niv-bible-translators"
                    }
                }
        <% }
        else if (reqInitial.startsWith("ESV")) { %>
                "author": {
                    "@type": "Person",
                    "name": "J. I. Packer",
                    "jobTitle": "Board of Governors' Professor of Theology",
                    "url": "https://en.wikipedia.org/wiki/J._I._Packer",
                    "affiliation": {
                        "@type": "Organization",
                        "name": "Regent College",
                        "url": "https://regent-college.edu"
                    },
                    "memberOf": {
                        "@type": "Organization",
                        "name": "Translation Oversight Committee - The English Standard Version",
                        "url": "https://www.esv.org"
                    }
                }
        <%  }
        else if (reqInitial.startsWith("SBLG")) { %>
                "author": {
                    "@type": "Person",
                    "name": "Michael W. Holmes",
                    "jobTitle": "Chair of the Department of Biblical and Theological Studies",
                    "url": "https://en.wikipedia.org/wiki/Michael_W._Holmes",
                    "affiliation": {
                        "@type": "Organization",
                        "name": "Bethel University",
                        "url": "https://www.bethel.edu/"
                    },
                    "memberOf": {
                        "@type": "Organization",
                        "name": "The International Greek New Testament Project",
                        "url": "http://www.igntp.org/"
                    }
                }
        <%  }
        else if (reqInitial.startsWith("NASB")) { %>
                "author": {
                    "@type": "Organization",
                    "name": "The Lockman Foundation",
                    "url": "https://en.wikipedia.org/wiki/Lockman_Foundation"
                }
        <%  }
        else { %>
                "author": {
                    "@type": "Person",
                    "name": "David Instone-Brewer",
                    "jobTitle": "Research Fellow",
                    "url": "https://cambridge.academia.edu/DInstoneBrewer",
                    "affiliation": {
                        "@type": "Organization",
                        "name": "Tyndale House",
                        "url": "https://www.TyndaleHouse.com"
                    },
                    "memberOf": [
                        {
                            "@type": "Organization",
                            "name": "Studiorum Novi Testamenti Societas",
                            "url": "https://snts.online"
                        },
                        {
                            "@type": "Organization",
                            "name": "British and Irish Association for Jewish Studies",
                            "url": "https://britishjewishstudies.org"
                        },
                        {
                            "@type": "Organization",
                            "name": "Committee on Bible Translation",
                            "url": "https://www.biblica.com/niv-bible/niv-bible-translators"
                        }
                    ]
                }
        <% } %>
            }
        </script>
    <% } %>

    <META http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta name="description" content="<%= request.getParameter("description") %>" />
	<meta name="keywords" content="<%= request.getParameter("keywords") %>" />
	
	<link rel="stylesheet" type="text/css" href="static/static.css" />
	<link rel="shortcut icon"  href="images/step-favicon.ico" />
</HEAD>
<body>

<div class="header">
	<h1><a href="./">STEP :: Scripture Tools for Every Person</a></h1>
</div>