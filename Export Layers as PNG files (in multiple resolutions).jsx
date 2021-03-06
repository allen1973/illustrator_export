﻿// *** Export Layers as PNG files (in multiple resolutions) ***
// This script will export all layers that have a name starting with "#", or "%" into a subfolder of the current .ai document.
// These options can be configured below:
// *** Config options  ***
var subFolderName = "Export";
var saveInMultipleResolutions = true;
// ...
// Note: only use one character!
var exportLayersStartingWith = "#";
var exportLayersWithArtboardClippingStartingWith = "%";
// ...
var lowResolutionFileAppend = "@Low";
var normalResolutionFileAppend = "-ipad";
var highResolutionFileAppend = "-ipadhd";
// ...
var lowResolutionScale = 50;
var normalResolutionScale = 100;
var highResolutionScale = 200;

// *** Start of script ***
var doc = app.activeDocument;

// Make sure we have saved the document
if (doc.path != "") {

    // Check if we need to create the export directory or we will get errors up ahead
    var exportDirectoryPath = doc.path + "/" + subFolderName;

    var exportDirectory = new Folder(exportDirectoryPath);

    if (!exportDirectory.exists) {
        // We must create the export directory it seems
        var newFolder = new Folder(exportDirectoryPath);
        newFolder.create();
    }

    var layerData = new Array();

    // Finds all layers that should be saved and saves these to the export layers array
    collectLayerData(doc, null);

    var layersToExportCount = 0;

    for (var i = 0; i < layerData.length; i++) {
        if ((layerData[i].tag == "include") || (layerData[i].tag == "include_and_clip")) {

            // Hide all layers first
            hideAllLayers();

            var clipToArtboard = false;

            if (layerData[i].tag == "include_and_clip") {
                clipToArtboard = true;
            }

            // Now show all layers needed to actually display the current layer on screen
            layerData[i].showIncludingParentAndChildLayers(); //showIncludingParents();

            // Now we can export the layer as one or multiple PNG files! 
            var savePath = doc.path; // Save to same folder as document but in a sub directory

            if (saveInMultipleResolutions) {
                // iPhone 3GS (50%)
                savePath.changePath(subFolderName + "/" + layerData[i].layer.name.substring(1, layerData[i].layer.name.length) + fixFileAppend(lowResolutionFileAppend));
                savePNG(savePath, lowResolutionScale, clipToArtboard);

                savePath = doc.path;

                // iPhone 4 (100%)
                savePath.changePath(subFolderName + "/" + layerData[i].layer.name.substring(1, layerData[i].layer.name.length) + fixFileAppend(normalResolutionFileAppend));
                savePNG(savePath, normalResolutionScale, clipToArtboard);

                savePath = doc.path;

                // iPad Retina (200%)
                savePath.changePath(subFolderName + "/" + layerData[i].layer.name.substring(1, layerData[i].layer.name.length) + fixFileAppend(highResolutionFileAppend));
                savePNG(savePath, highResolutionScale, clipToArtboard);

            } else {
                // Save normally (100%)
                savePath.changePath(subFolderName + "/" + layerData[i].layer.name.substring(1, layerData[i].layer.name.length));
                savePNG(savePath, normalResolutionScale, clipToArtboard);
            }

            layersToExportCount++;
        }
    }

    // Restore everything like it was before!
    restoreAllLayers();

    // Was there anything exported? If not make a warning!
    if (layersToExportCount == 0) {
        alert("Ooops, Found no layers to export!\n\nRemember that you must add a \"" + exportLayersStartingWith + "\" (when exporting the layer cropped to it's bound) or \"" + exportLayersWithArtboardClippingStartingWith + "\" (when layer should be clipped to artboard) to the beginning of the layer name. Also make sure that they layers you want to export are not locked or hidden.");
    } else {
        // Show a completed message
        alert(layersToExportCount + " layer(s) was successfully exported to: \n" + exportDirectoryPath);
    }

} else {
    // Document not saved yet!
    alert("Sorry, but you must save your document before you can use the export layers script! This is because exported images are saved in a subfolder to your original file.");
}

function fixFileAppend(fileAppend) {

    if (fileAppend == "") {
        return "";
    } else {
        return fileAppend + ".png";
    }

}

function hideAllLayers() {

    for (var i = 0; i < layerData.length; i++) {
        layerData[i].hide();
    }
}

function restoreAllLayers() {

    for (var i = 0; i < layerData.length; i++) {
        layerData[i].restoreVisibility();
    }

}

// Collects information about the various layers
function collectLayerData(rootLayer, extendedRootLayer) {
    for (var i = 0; i < rootLayer.layers.length; i++) {

        // We never even process locked or hidden layers
        if ((!rootLayer.layers[i].locked) && (rootLayer.layers[i].visible)) {

            var extendedLayer = new ExtendedLayer(rootLayer.layers[i]);

            // Set up parent
            extendedLayer.parentLayer = extendedRootLayer;

            // Also add this layer to the parents child collection
            if (extendedRootLayer != null) {
                extendedRootLayer.childLayers.push(extendedLayer);
            }

            layerData.push(extendedLayer);

            // Tag these layers so that we later can find out if we should export these layers or not
            if (rootLayer.layers[i].name.substring(0, 1) == exportLayersStartingWith) {
                extendedLayer.tag = "include";
            } else if (rootLayer.layers[i].name.substring(0, 1) == exportLayersWithArtboardClippingStartingWith) {
                extendedLayer.tag = "include_and_clip";
            } else {
                extendedLayer.tag = "skip";
            }

            // We should not export this layer but we continue looking for sub layers that might need to be exported
            collectLayerData(rootLayer.layers[i], extendedLayer);
        }
    }
}

// Holds info and additional methods for layers
function ExtendedLayer(layer) {
    this.originalVisibility = layer.visible;
    this.layer = layer;
    this.tag = "";
    this.hide = hide;
    this.show = show;
    this.showIncludingParentAndChildLayers = showIncludingParentAndChildLayers;
    this.restoreVisibility = restoreVisibility;
    this.restoreVisibilityIncludingChildLayers = restoreVisibilityIncludingChildLayers;
    this.layerName = layer.name;

    // Set after creating
    this.childLayers = new Array();
    this.parentLayer = null;

    function hide() {
        layer.visible = false;
    }

    function show() {
        layer.visible = true;
    }

    // Shows this layer including it's parent layers (up to the root) and it's child layers
    function showIncludingParentAndChildLayers() {

        var parentlayerName = "";

        if (this.parentLayer != null) {
            parentlayerName = this.parentLayer.layerName;
        }

        // Show all parents first
        var aParentLayer = this.parentLayer;

        while (aParentLayer != null) {
            aParentLayer.restoreVisibility();

            // Keep looking
            aParentLayer = aParentLayer.parentLayer;
        }

        // Show our own layer finally
        this.restoreVisibilityIncludingChildLayers();
    }

    function restoreVisibility() {
        layer.visible = this.originalVisibility;
    }

    function restoreVisibilityIncludingChildLayers() {
        this.restoreVisibility();

        // Call recursively for each child layer
        for (var i = 0; i < this.childLayers.length; i++) {
            this.childLayers[i].restoreVisibilityIncludingChildLayers();
        }
    }
}

// Save PNG file
function savePNG(file, scale, artBoardClipping) {

    var exp = new ExportOptionsPNG24();
    exp.transparency = true;
    exp.horizontalScale = scale
    exp.verticalScale = scale;
    exp.artBoardClipping = artBoardClipping;

    doc.exportFile(file, ExportType.PNG24, exp);
}