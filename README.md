# ikure
ikure Health Worker Tracker

<h3>Directory Descriptions: </h3>
phonegap - phonegap project files used to create the mobile application <br>
website - html, css, and js files used for the website <br>
scripts - php scripts used between database and website/mobile application <br>
<br>
mysql_db.txt - includes the sql queries needed to build necessary tables for app to work <br>

<h3>Installation & Usage: </h3>
In order for everything to function properly, you must already have a web server (to host the php scripts and website files) and a mysql database (to hold the tables where data is stored)<br>
<h5>Database and Website</h5>
<ul> - Move all files from the /scripts directory and the /website directory to your server</ul>
<ul> - Go into your mysql database and import the "mysql_db.txt" file, ensuring the format is set to "SQL"</ul>
<ul> - There are a couple changes that need to be made once your database is setup</ul>
<ul><ul> 1. In "DatabaseCredentials.php" input the required information to access the mysql database</ul></ul>
<ul><ul> 2. In the /website directory, "serverVariables.js" file, change the serverURL value to the url where you hosted the php scripts (don't forget to add the "/" at the end of the url)</ul></ul>
<br>
Once this is complete and all information entered is correct, the database and website should be functioning correctly <br>

<h5>Mobile Application</h5>
Installation of the mobile application is quite simple.  The actual application file (CordovaApp-debug.apk) is located in /phonegap/platforms/android/ant-build.  The application requires no changes to be made, however downloading the entire phonegap project allows for future changes if desired.  Before installing, ensure the device settings allow applications to be installed from unknown sources.<br>
The application can be installed on an android device in a couple ways:<br>
<ol>1. Downloaded from the web (i.e. as an email attachment, dropbox, etc.)</ol>
<ol>2. USB connection - using either phonegap or the adb, the .apk file can be installed on the connected device</ol>


