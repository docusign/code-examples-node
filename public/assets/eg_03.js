
// This JavaScript is entended to work with all supported
// browsers. Some polyfills may be needed.
//
// See https://getbootstrap.com/docs/4.0/getting-started/browsers-devices/
// for the supported browser list

let DS_EG = (function(){
  // globals
  //
  // NotifyJS -- see https://notifyjs.jpillora.com/
  const notify_info_t = { className:"info", globalPosition: "top center" }
      , notify_warning_t = { className:"warn", globalPosition: "top center" }
      ;
  let library = {};

  // See http://jsfiddle.net/unLSJ/
  // USAGE: $(el).html(library.json.prettyPrint(json_obj));
  // where el is <pre><code> el
  // or
  // $(el).html(library.json.prettyPrint2(json_obj));
  // where el is any el (<pre><code> will be added)
  library.json = {
    replacer: function(match, pIndent, pKey, pVal, pEnd) {
       var key = '<span class=json-key>';
       var val = '<span class=json-value>';
       var str = '<span class=json-string>';
       var r = pIndent || '';
       if (pKey)
          r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
       if (pVal)
          r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
       return r + (pEnd || '');
       },
    prettyPrint: function(obj) {
       var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{]|\[],|\{},|\[]|\{})?$/mg;
       return JSON.stringify(obj, null, 3)
          .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
          .replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(jsonLine, library.json.replacer);
       },
    prettyPrint2: function(obj) {
        var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg
          , out = JSON.stringify(obj, null, 3)
           .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
           .replace(/</g, '&lt;').replace(/>/g, '&gt;')
           .replace(jsonLine, library.json.replacer);
        return '<pre><code>' + out + '</code></pre>';
       }
    };
 


  // Add on_click handlers to elements with data-busy attribute
  function augment_busy(){
    $('a[data-busy="href"]').click(busy_href);
    $('form[data-busy="form"]').submit(busy_form);
    $('form[data-busy="form-download"]').submit(busy_form_download);
  }

  // Process flash messages from the server
  function process_server_flash_msgs(){
    let flash_msg_raw = $("#server_data").attr("data-server-data")
      , flash_msg_json = flash_msg_raw ? JSON.parse(flash_msg_raw) : false
      , flash_msg_info = (flash_msg_json && flash_msg_json.flash &&
          flash_msg_json.flash.info)
      ;
    _.forEach(flash_msg_info, function (msg){
      $.notify(msg, notify_info_t);
    })
  }

  // process json display
  function process_json_display() {
    let json_raw = $("#server_json_data").attr("data-server-json-data")
      , json_raw2 = json_raw ? JSON.parse(json_raw) : false
      , json_raw3 = json_raw2 && json_raw2.json
      , json = JSON.parse(json_raw3)
      ;
    
    if (json) {
      $('#json-display').html(library.json.prettyPrint(json))
    }
  }

  // Handles clicks for elements with attribute data-busy="href"
  // 1. Make global feedback and busy indicators visible
  // 2. Change location to the element's href value
  let busy_href = function _busy_href(e){
    e.preventDefault();
    $("#feedback,#busy").show();
    $("#content").hide();
    const href = $(e.target).attr("href");
    window.location = href;
  }

  let countdownInfo = { // using an object since it's a pointer
        countdown: null, // Should countdown continue?
        intervalId: null // id of the count down interval
      }
      // When starting a download request, how long should the spinner display?
    , downloadSpinnerMS = 3000; 

  let busy_form = function _busy_form(e){
    e.preventDefault();
    $("#feedback,#busy").show();
    $("#content").hide();
    const form = $(e.target);
    form.get(0).submit();
    countdownInfo.countdown = true;
    doCountdown();
  }

  let busy_form_download = function _busy_form_download(e){
    e.preventDefault();
    $("#feedback,#busy").show();
    $("#content").hide();
    const form = $(e.target);
    form.get(0).submit();
    countdownInfo.countdown = true;
    doCountdown();
    let stopCount = info => {
      info.countdown = false;
      clearInterval(info.intervalId);
      $('#feedback h3 span').text("your download will start soon.");
      $("#busy").hide();
      $("#download-continue").show();
    }
    setTimeout(stopCount, downloadSpinnerMS, countdownInfo);
  }

  function doCountdown() {
    let value = 200
      , timerMS = 300
      , el = $('#feedback h3 span')
      , show = () => {if (countdownInfo.countdown) {el.text(value)} value -= 1}
      ;
    
    show();
    countdownInfo.intervalId = setInterval( show, timerMS );
  }

  let start_up = function(){
    augment_busy();
    process_server_flash_msgs();
    process_json_display();
  }

  function notify_info (msg) {
     $.notify(msg, notify_info_t);
  }
  function notify_warning (msg) {
     $.notify(msg, notify_warning_t);
  }

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

// Return the publicly exposed items
  return {
    start_up: start_up
  }
})();


// Main stem
$( document ).ready(function() {
  DS_EG.start_up();
});
