// scaling
var radius_scale = 5;
// starter berries position
var starter_x = 170;
var starter_y = 380;
// main berries position
var main_x = 375;
var main_y = 295;
// dessert berries position
var dessert_x = 550;
var dessert_y = 180;

var starter = {};
var main = {};
var dessert = {};
var chart = d3.select(".chart");

$.getJSON("data.json", function(data) {

    // load the data
    $.each(data["person"], function(i, v) {
        
        // starters
        if (v["starter"] in starter) {
            starter[v["starter"]].push(v["name"]);
        } else {
            starter[v["starter"]] = [v["name"]];
        }

        // mains
        if (v["main"] in main) {
            main[v["main"]].push(v["name"]);
        } else {
            main[v["main"]] = [v["name"]];
        }

        // desserts
        if (v["dessert"] in dessert) {
            dessert[v["dessert"]].push(v["name"]);
        } else {
            dessert[v["dessert"]] = [v["name"]];
        }

    });

    createBerries("starter", starter_x, starter_y, starter);
    addCourseDataToPage("starter", starter);

    createBerries("main", main_x, main_y, main);
    addCourseDataToPage("main", main);

    createBerries("dessert", dessert_x, dessert_y, dessert);
    addCourseDataToPage("dessert", dessert);

    enableMouseInteraction();

    // 3 random berries flash every 5 seconds
    setInterval(function() {
        berryPulse("starter");
        setTimeout(function() { berryPulse("main"); }, 200);
        setTimeout(function() { berryPulse("dessert"); }, 400);
    }, 3000);

});

function createBerries(course, course_x, course_y, course_data) {

    // pull out the needed data
    var course_keys = Object.keys(course_data);
    var course_values = Object.keys(course_data).map(function(v) { return course_data[v].length; });
    var max_course_value = Math.max.apply(Math, course_values);

    var circles = chart.selectAll("circle." + course)
        .data(course_keys)
        .enter().append("circle")
        // space the circles around a point
        .attr("cx", function(d, i) { 
            var x_shift = Math.sin(i * (2 * Math.PI / course_keys.length)) * (max_course_value * radius_scale);
            return course_x + x_shift;
        })
        .attr("cy", function(d, i) { 
            var y_shift = Math.cos(i * (2 * Math.PI / course_keys.length)) * (max_course_value * radius_scale);
            return course_y + y_shift;
        })
        .attr("r", function(d, i) { return course_data[d].length * radius_scale; })
        .attr("fill", "red")
        .attr("id", function(d, i) { return course + "_" + generateId(d); })
        .attr("class", course);
}

function addCourseDataToPage(course, course_data) {

    $.each(Object.keys(course_data), function(key, noms) {

        // the people who ordered it
        var people = "";
        $.each(course_data[noms], function(key, person) {
            people += "<li>" + person + "</li>";
        });

        // the display
        var circle_id = course + "_" + generateId(noms);
        var id = circle_id + "_data";
        var html = "<div class=\"food_info\" id=\"" + id + "\">" 
                    + "<h3>" + noms + "</h3>"
                    + "<ul>"
                    + people
                    + "</ul>"
                    + "</div>";

        // add it
        $("#course_information").append(html);
        // and style it
        var c = d3.select("#" + circle_id);
        var t = parseFloat(c.attr("cy"));
        var l = parseFloat(c.attr("cx")) + parseFloat(c.attr("r"));

        $("#" + id).css("top", t + "px")
                    .css("left", l + "px");
    });

}

function enableMouseInteraction() {

    d3.selectAll("circle").on("mouseover", function() {
        // change colour and display the data
        var c = d3.select(this);
        c.transition().duration(250).style("fill", "#ff7709");
        $("#"+c.attr("id")+"_data").fadeIn();
    });
    d3.selectAll("circle").on("mouseout", function() {
        // revert the colour and hide the data again
        var c = d3.select(this);
        c.transition().duration(500).style("fill", "red");
        $("#"+c.attr("id")+"_data").fadeOut();
    });

}

function berryPulse(course) {

    // timings
    var step = 1000;
    var space = 100;

    // get a circle at random
    var circles = d3.selectAll("circle." + course);
    var i = Math.floor(Math.random() * circles[0].length);
    var c = d3.select(circles[0][i]);

    // pulse outwards
    d3.select("svg").append("circle")
        .attr("r", 0)
        .attr("id", course + "_pulse")
        .attr("cx", c.attr("cx"))
        .attr("cy", c.attr("cy"))
        .style("fill", "none")
        .style("stroke", "yellow")
        .style("stroke-opacity", 1)
        .style("stroke-width", 5)
    .transition()
        .duration(step)
        .attr("r", parseInt(c.attr("r")) + 15)
        .style("stroke-opacity", 0);

    // get rid of the extra element
    setTimeout(function() {
        d3.select("#" + course + "_pulse").remove();
    }, step + space);

}

function generateId(data) {
    return data.replace(/ /g,"_").replace(/'/g,"").toLowerCase()
}
