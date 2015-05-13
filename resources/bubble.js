window.onload = function(){
  var width = 800, height = 3200;
  var fill = d3.scale.ordinal().range(["#7abb65", "#9a16fe", "#d40745", "#5eb0ff", "#f1970c", "#fc7ce6", "#80645f", "#445de2", "#37bdbd", "#10c60f", "#7d690a", "#f49174", "#825b9b", "#acb20b", "#bb4202", "#327190", "#427553", "#e891b5", "#cd027e", "#b4ac7d", "#ba10bf", "#aaa9be", "#ac4b56", "#c198fb", "#097c0c", "#206ac3", "#06c291", "#d6a250", "#9b5a32", "#9349b9", "#8940e3", "#7bbd23", "#547421", "#aa477d", "#2cc457", "#27b9e4", "#d0a099", "#82b792", "#d7011b", "#726b40", "#a9b254", "#097b3e", "#c19ed4", "#6f6686", "#b4349b", "#ff8d46", "#bc3f34", "#d2a515", "#55706d", "#c52d61", "#ff8795", "#905a73"])
  var svg = d3.select("#bubble").append("svg")
      .attr("width", width)
      .attr("height", height);
  var data = sup_data;
  for (var j = 0; j < data.length; j++) {
    // data[j].radius = +data[j].contrib / 2;
    data[j].radius = Math.sqrt(data[j]["contrib"])/100;
    data[j].x = Math.random() * width;
    data[j].y = Math.random() * height;
  }

  var padding = 2;
  var maxRadius = d3.max(_.pluck(data, 'radius'));

  var getCenters = function (vname) {
    var centers, map;
    // centers = _.uniq(_.pluck(data, vname)).map(function (d) {
    //   return {name: d, value: 1};
    // });

    // map = d3.layout.treemap().size(size).ratio(1/1);
    // map.nodes({children: centers});
    // console.log(centers)
    if (vname == "dept")

    centers = []
    return centers;
  };

  var nodes = svg.selectAll("circle")
    .data(data);

  nodes.enter().append("circle")
    .attr("class", "node")
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })
    .attr("r", function (d) { return d.radius; })
    .style("fill", function (d) { return fill(d.dept); })
    .on("mouseover", function (d) { showPopover.call(this, d); })
    .on("mouseout", function (d) { removePopovers(); })

  var force = d3.layout.force();

  draw('make', 800);

  $( ".btn" ).click(function() {
    var height = 800;
    if (this.id == "dept"){
      height = 3200;
    }
    // if (this.id == "school"){
    //   svg.attr("height", 800);
    // }
    if (this.id == "sup"){
      height = 1000;
    }
    draw(this.id);
  });

  function draw (varname) {
    var centers = getCenters(varname, [800, height]);
    force.on("tick", tick(centers, varname));
    labels(centers)
    force.start();
  }

  function tick (centers, varname) {
    var foci = {};
    for (var i = 0; i < centers.length; i++) {
      foci[centers[i].name] = centers[i];
    }
    return function (e) {
      for (var i = 0; i < data.length; i++) {
        var o = data[i];
        var f = foci[o[varname]];
        o.y += ((f.y + (f.dy / 2)) - o.y) * e.alpha;
        o.x += ((f.x + (f.dx / 2)) - o.x) * e.alpha;
      }
      nodes.each(collide(.11))
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
    }
  }

  function labels (centers) {
    svg.selectAll(".label").remove();

    svg.selectAll(".label")
    .data(centers).enter().append("text")
    .attr("class", "label")
    .text(function (d) { return d.name })
    .attr("transform", function (d) {
      return "translate(" + (d.x + (d.dx / 2) -90) + ", " + (d.y + 20) + ")";
    });
  }

  function removePopovers () {
    $('.popover').each(function() {
      $(this).remove();
    }); 
  }

  function showPopover (d) {
    $(this).popover({
      placement: 'auto top',
      container: 'body',
      trigger: 'manual',
      html : true,
      content: function() { 
        return "Supervisor: " + d["sup"] + "<br/>FY2014 Exp: $" + commas(d["contrib"]) + 
               "<br/>Department: " + d["dept"] + "<br/>School: " + d["school"]; 
      }
    });
    $(this).popover('show')
  }

  function collide(alpha) {
    var quadtree = d3.geom.quadtree(data);
    return function (d) {
      var r = d.radius + maxRadius + padding,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }
}
