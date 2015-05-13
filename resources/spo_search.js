function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function populate_table_spo(spo_name) {
    var this_spo = spo_data[spo_name]
    $("#spo_name").text("No. "+this_spo[0][0].toString()+": "+spo_name)
    $("#sponsors").find("tr:gt(0)").remove();
    
    // var fytd = 0;
    // var cumulative = 0;
    // var auth = 0
    for (var i=0; i < this_spo.length; i++){
        tr = this_spo[i]
        var new_row_vals = [tr[2], tr[3], tr[4].toString()]
        for (var j=5; j<tr.length; j++){
            new_row_vals.push("$"+commas(tr[j]))
        }
        if (i == this_spo.length-1){
           var row_s = "<tr><td><b>" + new_row_vals.join("</b></td><td><b>") +"</b></td></tr>" 
        } else{
            var row_s = "<tr><td>" + new_row_vals.join("</td><td>") +"</td></tr>"
        }
        $('#sponsors > tbody:last').append(row_s);

    }
}

$(function() {
    var availableSpoTags = spo_names;

    function split( val ) {
      return val.split( /,\s*/ );
    }
    function extractLast( term ) {
      return split( term ).pop();
    }
 
    $( "#spo_search" )
      // don't navigate away from the field on tab when selecting an item
      .bind( "keydown", function( event ) {
        if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).autocomplete( "instance" ).menu.active ) {
          event.preventDefault();
        }
      })
      .autocomplete({
        minLength: 0,
        source: function( request, response ) {
          // delegate back to autocomplete, but extract the last term
          response( $.ui.autocomplete.filter(
            availableSpoTags, extractLast( request.term ) ) );
        },
        focus: function() {
          // prevent value inserted on focus
          return false;
        },
        select: function( event, ui ) {
          var terms = split( this.value );
          // remove the current input
          terms.pop();
          // add the selected item
          terms.push( ui.item.value );
          // add placeholder to get the comma-and-space at the end
          // terms.push( "" );
          // this.value = terms.join( ", " );

          populate_table_spo(ui.item.value)

          this.value = "";

          return false;
        }
      });
  });