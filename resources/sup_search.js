function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function populate_table(sup_name) {
    $("#sup_name").text(sup_name)
    $("#projects").find("tr:gt(0)").remove();
    var this_sup = full_sup_data[sup_name]
    var fytd = 0;
    var cumulative = 0;
    var auth = 0
    for (var i=0; i < this_sup.length; i++){
        for (var j=0; j<this_sup[i]["projects"].length; j++){
            var project = this_sup[i]["projects"][j]
            var new_row_vals = [this_sup[i]["school"], this_sup[i]["dept"],
                                project["title"], project["sponsor_name"], 
                                project["gov_num"], "$"+commas(project["fytd14"]), 
                                "$"+commas(project["cumulative"]), "$"+commas(project["auth"])]
            fytd += project["fytd14"]
            cumulative += project["cumulative"]
            auth += project["auth"]
            var row_s = "<tr><td>" + new_row_vals.join("</td><td>") +"</td></tr>"
            $('#projects > tbody:last').append(row_s);
        }
    }
    var last_row = ["<b>Total:</b>", "", "", "", "", "<b>$"+commas(fytd)+"</b>",
    "<b>$"+commas(cumulative)+"</b>","<b>$"+commas(auth)+"</b>"]
    var last_s = "<tr><td>" + last_row.join("</td><td>") +"</td></tr>"
    $('#projects > tbody:last').append(last_s);
}

$(function() {
    var availableTags = sup_names;

    function split( val ) {
      return val.split( /,\s*/ );
    }
    function extractLast( term ) {
      return split( term ).pop();
    }
 
    $( "#sup_search" )
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
            availableTags, extractLast( request.term ) ) );
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

          populate_table(ui.item.value)

          this.value = "";

          return false;
        }
      });
  });