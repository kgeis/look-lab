var colorsMap = {
    tequilaSunrise: ["#eaec25", "#ed4faf", "#4fafed"],
    ocean: ["#0099cc", "#EDC9AF", "#004444"],
    hightlighter: ["#80ff00", "#00ffff", "#FFFF00"],
    carbonSky: ["#afe8f6", "#a3a3a3"],
    stawberry: ['#800000', '#ff6666'],
    forest: ['#006400', '#7a5230'],
    algae: ['#adff00', '#74d600', '#028900', '#00d27f', '#00ff83'],
    rainbow: ['#00b159', '#00aedb', '#f37735', '#ffc425'],
    pastels: ['#1b85b8', '#559e83', '#c3cb71', '#ae5a41'],
    blueToYellow: [
        "#226666", // teal
        "#00F000", // green
        "#FFFF00", // yellow
        "#1465E6"  // blue
    ],
    unicornVomit: [
        "#F10088", // pink
        "#FFFF00", // yellow again
        "#1D35E8"  // different blue
    ]
};

function gradientColorStopsString () {
    var colors = arguments;
    var toReturn = "";
    for (var i = 0; i < colors.length; i++) {
        toReturn += colors[i] + '-';
    }
    return toReturn.slice(0, -1);
}

function inBounds (point, width, height) {
    return point.x <= width && point.x >= 0 && point.y >= 0 && point.y <= height;
}

function cutoff (currentLocation, height) {
    var z = currentLocation.y / height * 10 - 5.5;
    return 1 / (1 + Math.exp(-z));
}

function rhombusPoints (point, r) {
    var bottom = point,
        left = leftPoint(point, r),
        right = rightPoint(point, r),
        top = topPoint(point, r);
    return [bottom.x, bottom.y, left.x, left.y, top.x, top.y, right.x, right.y];
}

function tooFarRight (currentLocation, width) {
    return currentLocation.x > width / 2;
}

function nextRow (currentLocation, stepSize) {
    return resetX(stepDown(currentLocation, stepSize), stepSize);
}

function resetX (currentLocation, stepSize) {
    var dx = currentLocation.x % (stepSize * 2) === 0 ? -stepSize : 0;
    return {x: dx, y: currentLocation.y};
}

function mirrorPolygonArray (polygonArray, width) {
    var mirroredPolygons = [];
    for (var i = polygonArray.length - 1; i >= 0; i--) {
        var currentPolygon = polygonArray[i];
        mirroredPolygons.push( mirrorPolygon(currentPolygon, width) );
    };
    return mirroredPolygons;
}

function mirrorPolygon (polygonPoints, width) {
    var mirroredPoints = [];
    for (var i = polygonPoints.length - 1; i >= 0; i--) {
        var currentPoint = polygonPoints[i];
        mirroredPoints.push( mirrorPoint(currentPoint, width) );
    }
    return mirroredPoints;
}

function mirrorPoint (point, width) {
    return {x: width - point.x, y: point.y};
}

function leftPoint (point, r) {
    return step(point, -r, r);
}

function rightPoint (point, r) {
    return step(point, r, r);
}

function topPoint (point, r) {
    return step(point, 0, 2 * r);
}

function stepLeft (point, r) {
    return step(point, -2 * r, 0);
}

function stepRight (point, r) {
    return step(point, 2 * r, 0);
}

function stepDown (point, r) {
    return step(point, 0, r);
}

function step (point, dx, dy) {
    return {
        x: point.x + dx,
        y: point.y + dy
    };
}

function pointsArrayToArrayForSnap (points) {
    var toReturn = [];
    for (var i = 0; i < points.length; i++) {
        toReturn[2 * i] = points[i].x;
        toReturn[2 * i + 1] = points[i].y;
    }
    return toReturn;
}

// This method works by considering the circle upon which both other points of the
// traingle have to fall (because two sides of an isosceles triangle have the same
// length). It assumes center lies in the center of the circle (find for current
// purposes) First, it finds the angle to the side given by the two points. Then,
// it adds the supplied angle to that angle and finds the other point of the
// triangle, returning all points as an array of [x1, y1, x2, ...], suitable
// for a Snap.polygon call.
function isoscelesTriangleFromTwoPointsAndAngle (center, startingRadialPoint, angleInRad) {
    var radius = Math.sqrt(
        Math.pow(center.x - startingRadialPoint.x, 2) +
        Math.pow(center.y - startingRadialPoint.y, 2)
    );

    var smallestAngleToReadyStartingRadialPoint = Math.acos( (startingRadialPoint.x - center.x) / radius );
    var angleTostartingRadialPoint

    // Well this is bullshit. The acos function returns the smallest possible angle,
    // instead of returning a unique angle for each point on the circle. At least
    // the way I'm using it does ;-)
    if (startingRadialPoint.y > center.y) {
        angleTostartingRadialPoint = smallestAngleToReadyStartingRadialPoint;
    }
    else {
        angleTostartingRadialPoint = Math.PI + Math.PI - smallestAngleToReadyStartingRadialPoint;
    }

    var angleToP3 = angleTostartingRadialPoint + angleInRad;
    var dx = Math.cos(angleToP3) * radius;
    var dy = Math.sin(angleToP3) * radius;
    return {x: center.x + dx, y: center.y + dy};
}

function drawPolygonPointsWithColors (brush, polygonPoints, colors) {
    for (var i = polygonPoints.length - 1; i >= 0; i--) {
        var toDraw = pointsArrayToArrayForSnap(polygonPoints[i]);
        var fill = colors[i % colors.length];
        brush.polyline(toDraw).attr({
            fill: fill
        });
    };
}

function drawLineAtAngle (brush, startPoint, angle, length, mirror, attrs) {
    var endPoint = { x: startPoint.x + Math.cos(angle) * length,
                     y: startPoint.y + Math.sin(angle) * length };
    brush.line(startPoint.x, startPoint.y, endPoint.x, endPoint.y)
        .attr(attrs);

    // Now to mirror
    if (mirror) {
        var mirroredEnd = mirrorPoint(startPoint, width);
        var mirroredAngle = Math.PI + angle - angle * 2;
        drawLineAtAngle(brush, mirroredEnd, mirroredAngle, length, false, attrs);
    }
}

// Input: brush, [ {x: __, y: __ }, ... ], attrs map, mirror
// Output: shapes on <SVG>
function drawPolygonPoints (brush, points, attrs, mirror) {
    brush.polygon(
        pointsArrayToArrayForSnap(points)
    ).attr(attrs);

    if (mirror) {
        var mirroredPoints = mirrorPolygon(points, width);
        drawPolygonPoints(brush, mirroredPoints, attrs, false);
    }
}

// Similar to above. Angle 0 is a triangle with the point directly down.
function drawIsoscelesTriangleWithTopAngleAtAngle (brush, bottomCenter, length, topAngle, triAngle, attrs, mirror) {
    var p1 = { x: bottomCenter.x + length / 2 * Math.cos(triAngle),
               y: bottomCenter.y + length / 2 * Math.sin(triAngle) };

    var p2Angle = triAngle + Math.PI;
    var p2 = { x: bottomCenter.x + length / 2 * Math.cos(p2Angle),
               y: bottomCenter.y + length / 2 * Math.sin(p2Angle) };

    var p3Angle = triAngle + Math.PI / 2;
    var lengthForP3 = length / ( 2 * Math.tan(topAngle / 2) );
    var p3 = { x: bottomCenter.x + lengthForP3 * Math.cos(p3Angle),
               y: bottomCenter.y + lengthForP3 * Math.sin(p3Angle) };

    drawPolygonPoints(brush, [p1, p2, p3], attrs, mirror);
}

function drawEquilateralTriangleAtAngle (brush, bottomCenter, sideLength, angle, attrs, mirror) {
    drawIsoscelesTriangleWithTopAngleAtAngle(brush, bottomCenter, sideLength, Math.PI / 3, angle, attrs, mirror);
}

function polkaDotPointsWithStepSize (stepSize) {
    var polkaDots = [];
    var point = {x: 0, y: 0};
    while(inBounds(point, width, height)) {
        polkaDots.push(point);
        point = stepRight(point, stepSize);
        if(tooFarRight(point, width)) {
            point = stepRight(nextRow(point, stepSize), stepSize);
        }
    }
    return polkaDots;
}

function drawLinesFromPointBetweenAngles (brush, point, startAngle, endAngle, length, numberOfLines, mirror, attrs) {
    var angleSubtended = startAngle - endAngle;
    var angleStep = angleSubtended / numberOfLines;
    for (var i = numberOfLines; i >= 0; i--) {
        var lineAngleDelta = angleStep * (numberOfLines - i) + (1 - 2 * Math.random()) * angleStep;
        var lineAngle = startAngle + lineAngleDelta;

        drawLineAtAngle(brush, point, lineAngle, length, mirror, attrs);
    }
}