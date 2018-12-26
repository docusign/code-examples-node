// This script implements the sourceChooser functionality

// This JavaScript is intended to work with all supported
// browsers. Some polyfills may be needed.
//
// See https://getbootstrap.com/docs/4.0/getting-started/browsers-devices/
// for the supported browser list

let DS_SC = (function(){
  // globals
  // 
  let sourceDir = "/source/",
      sources = {};

  // Add on_click handlers to source chooser elements
  function add_listeners(){
    $('input[name="radioSource"]').change(sourceChanged);
    $(window).resize(onResize);

    // Show the node source
    if(document.getElementById("radio_node") !== null) {
      sourceChanged({target: $("#radio_node")[0]})
    }
  }

  let sourceChanged = function _sourceChanged(e){
    let url = $(e.target).val();
    let docName = $(e.target).attr("x-docName");
    let langCode = $(e.target).attr("x-langCode");
    $("#sourceUrl").html(
      'Github: <a href="' + url + '" target="_blank">' + docName + '</a>');
    
    // fetch the source if we don't already have it.
    if (sources[langCode]) {
      ShowSource(langCode, sources[langCode])
    } else {
      $.ajax({
        url: sourceDir + docName,
        success: function(data){ShowSource(langCode, data)},
        dataType: 'text'
      })
    }
  }

  let onResize = function _onResize(e) {
    // Set height of row to set height of gutter / positioner
    $(".colDivider").height("" + Math.round($("#rcolumn").height()) + "px");
  }

  function ShowSource(langCode, source) {
    sources[langCode] = source;
      $("#source").text(source);
      $("#source").each(function(i, block) {
        hljs.highlightBlock(block);
      });
      $(window).trigger('resize');
  }

  // Split the window and make it adjustable
  if(document.getElementById("lcolumn") !== null) {
    let splitobj = Split(["#lcolumn","#rcolumn"], {
          elementStyle: function (dimension, size, gutterSize) { 
            $(window).trigger('resize'); // Optional
            return {'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'}
          },  
          gutterStyle: function (dimension, gutterSize) { return {'flex-basis':  gutterSize + 'px'} },
          sizes: [50,50],
          minSize: 10,
          gutterSize: 6,
          cursor: 'col-resize'
        })
    }

  let start_up = function(){
    add_listeners();
  }

// Return the publicly exposed items
  return {
    start_up: start_up
  }
})();


// Main stem
$( document ).ready(function() {
  DS_SC.start_up();
});
