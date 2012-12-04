if (app.documents.length > 0) 

{ 
var doc = app.activeDocument;
var x;
var y;
var t; 
var docHeight = doc.height;
app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM; 
var count = doc.layers.length; 

// PLIST header
var out_txt= "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<!DOCTYPE plist PUBLIC \"-\//Apple Computer\//DTD PLIST 1.0\//EN\" \"http:\//www.apple.com\/DTDs\/PropertyList-1.0.dtd\">\n" + "<plist version=\"1.0\">\n<dict>\n\t<key>frames</key>\n\t<dict>\n"; 

for ( var i = 0; i < count; ++i)
{ 
doc.activeLayer = doc.layers[i]; 
doc.layers[i].hasSelectedArtwork = true; 
}


for ( var i = 0; i < count; ++i)
{
x = doc.selection[i].position[0] + (doc.selection[i].width / 2); 
y = docHeight - (doc.selection[i].position[1]*(-1)) - (doc.selection[i].height / 2); 
w = doc.selection[i].width;
h = doc.selection[i].height;

// output text in PLIST
out_txt += "" 
+ "\t\t<key>" + doc.layers[i].name + "_" + i + "</key>\n" 
+ "\t\t<dict>\n" 
+ "\t\t\t<key>ClipNames</key>\n"
+ "\t\t\t<array>\n"
+ "\t\t\t\t<string>" + doc.layers[i].name + ".png" +"</string>\n"
+ "\t\t\t</array>\n"
+ "\t\t\t<key>Position</key>\n"
+ "\t\t\t<string>{" + x.toFixed(0) + "," + y.toFixed(0) + "}</string>\n"
+ "\t\t\t<key>Sizes</key>\n"
+ "\t\t\t<string>{" + w.toFixed(0) + "," + h.toFixed(0) + "}</string>\n"
+ "\t\t\t<key>Scale</key>\n"
+ "\t\t\t<string>{1.0,1.0}</string>\n"
+ "\t\t\t<key>Rotation</key>\n"
+ "\t\t\t<string>0</string>\n"
+ "\t\t\t<key>zOrder</key>\n"
+ "\t\t\t<string>" + i + "</string>\n"
+ "\t\t\t<key>TransformCenter</key>\n"
+ "\t\t\t<string>{0.5,0.5}</string>\n"
+ "\t\t\t<key>Childs</key>\n"
+ "\t\t\t<dict>\n"
+ "\t\t\t</dict>\n"
+ "\t\t\t<key>Animation</key>\n"
+ "\t\t\t<dict>\n"
+ "\t\t\t\t<key>Moving</key>\n"
+ "\t\t\t\t<string>{0.0,0.0}</string>\n"
+ "\t\t\t\t<key>Jumping</key>\n"
+ "\t\t\t\t<string>0</string>\n"
+ "\t\t\t</dict>\n"
+ "\t\t</dict>\n\n"

} 

// PLIST footer
out_txt += "\t</dict>\n"

+ "\n\t<key>metadata</key>\t\n" 
+ "\t<dict>\n" 
+ "\t\t<key>atlasFileName</key>\n" 
+ "\t\t<string>" + app.activeDocument.name.match(/([^\.]+)/)[1] + "</string>\n" 
+ "\t</dict>\n\n" 

+ "</dict>\n"
+ "</plist>";

//t = doc.layers[0].textFrames.add();
//        t.contents = out_txt;

// Use this to export PLIST file to same directory where file is located
    var mySourceFilePath = activeDocument.fullName.path + "/";
// create a reference to a file for output
    var csvFile = new File(mySourceFilePath.toString().match(/([^\.]+)/)[1] + app.activeDocument.name.match(/([^\.]+)/)[1] + "_coord" + ".plist");
// open the file, write the data, then close the file
csvFile.open('w');
csvFile.writeln(out_txt);
csvFile.close();        	

// alert
alert("Operation Complete!" + "\n" + "Layer coordinates were successfully exported to:" + "\n" + "\n" + mySourceFilePath.toString().match(/([^\.]+)/)[1] + app.activeDocument.name.match(/([^\.]+)/)[1] + ".plist");

} 