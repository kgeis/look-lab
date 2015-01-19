// MANY of the color schemes here were pulled from user-generated pallettes on
// www.color-hex.com
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
    ],
    neonRainbow: ['#fdff00', '#32fffa', '#fd18ff', '#00ff11'],
    greys: ['#bbb', '#444', '#888', '#000'],
    fire: ['#fdcf58', '#757676', '#f27d0c', '#800909', '#f07f13'],
    sherlock: ['#383838', '#2d5867', '#1e2e4d', '#000d11', '#2c003a'],
    blues: ['#E7EFF6', '#6497b1', '#005b96', '#03396c', '#011f4b'],
    seahawks: ['#002244', '#69BE28', '#A5ACAF'],
    seriousPink: ['#a3294e', '#ad1f49', '#5c0a22', '#c20a41', '#db4c77'],
    radial: ['#eadd65', '#ea4646', '#357385', '#000000', '#83257f'],
    happyPastels: ['#00ffff', '#33ff99', '#ff99cc', '#ffff99', '#ff6666'],
    matchFlame: ['#3041f3', '#6c6675', '#ae9b89', '#edcf9c', '#f9f9b3'],
    purples: ['#501f72', '#9277ae', '#69398b', '#9a7fa9', '#3e0254'],
    morePastels: ['#a5f59a', '#98a3f2', '#f2b894', '#97f4e9', '#f2e898'],
    brightDesert: ['#ffff80', '#c0ff80', '#ffc080', '#80c0ff', '#b0b0b0'],
    fallLeaves: ['#cbff8c', '#e3e36a', '#c16200', '#881600', '#4e0110'],
    sage: ['#89a48e', '#6e8a73', '#646464', '#acd5b4', '#424242'],
    teals: ['#2a675c', '#327b6e', '#3a9080', '#43a493', '#4bb9a5'],
    fallLove: ['#842c5a', '#842c44', '#852c2e', '#84402c', '#84562c'],
    tvTestPattern: ['#00ff5e', '#ffeb2a', '#ff0074', '#00b8ff', '#290000']
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

function polkaDotPointsWithStepSize (stepSize, leftLegOnly) {
    var polkaDots = [];
    var point = {x: 0, y: 0};
    var rightBoundary = width;
    if (leftLegOnly) rightBoundary = width / 2;
    while(inBounds(point, width, height * 1.1)) {
        polkaDots.push(point);
        point = stepRight(point, stepSize);
        if(point.x > rightBoundary) {
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

function jitterValueByPercentage (value, percentage, plusMinus) {
    var decimal = percentage / 100;
    var base = 1;
    if (plusMinus) base = 0;
    return value * ( (base + decimal) - 2 * decimal * Math.random());
}

function drawZigZag (brush, xStep, yStep, yStart, mirror, attrs) {
    var x = 0;
    var points = [];
    var rightBoundary = width;
    if (mirror) rightBoundary = width / 2;

    while (x < rightBoundary) {
        if ((x / xStep) % 2 === 1) {
            y = yStart + yStep;
        }
        else {
            y = yStart;
        }
        points.push({x: x, y: y});
        x += xStep;
    }

    brush.polyline( pointsArrayToArrayForSnap(points) ).attr(attrs);

    if (mirror) {
        brush.polyline( pointsArrayToArrayForSnap( mirrorPolygon(points, width) ) ).attr(attrs);
    }
}

function hexagonPointsAtAngle (point, radius, angle) {
    var points = [];
    for (var i = 0; i < 6; i++) {
        points.push({
            x: point.x + radius * Math.cos(angle),
            y: point.y + radius * Math.sin(angle)
        });
        angle += Math.PI / 3;
    }
    return points;
}

function getNRandomlyDistributedCirclesWithMaximumRadius (n, maxRadius) {
    var circles = [];
    for (var i = n - 1; i >= 0; i--) {
        circles.push( getNextCircleData(maxRadius, circles) );
    }
    return circles;
}

function getNextCircleData (maxRadius, circles) {
    var samples = 50,
        keeper,
        candidate;
    for (var i = samples - 1; i >= 0; i--) {
        candidate = randomPoint(width, height);

        if (circles.length === 0) {
            candidate.r = maxRadius;
            return candidate;
        }
        else {
            var closestCircle = getClosestCircle(candidate, circles);
            var distanceBetweenCandidateAndCircle = calculateDistanceBetweenPoints(closestCircle, candidate);
            if (!keeper || keeper.distance < distanceBetweenCandidateAndCircle) {
                keeper = candidate;
                keeper.distance = distanceBetweenCandidateAndCircle;
                keeper.circle = closestCircle;
            }
        }
    }

    var radius = calculateKeeperRadius(keeper, maxRadius);
    if (radius < 0) radius = 0;
    keeper.r = radius;
    return keeper;
}

function randomPoint (width, height) {
    return {
        x: Math.random() * width,
        y: Math.random() * height
    };
}

function getClosestCircle (candidate, circles) {
    var closestCircle,
        potentialClosest,
        closestDistance,
        distance;
    for (var i = circles.length - 1; i >= 0; i--) {
        potentialClosest = circles[i];
        distance = calculateDistanceBetweenPoints(potentialClosest, candidate);
        if (!closestDistance || closestDistance > distance) {
            closestDistance = distance;
            closestCircle = potentialClosest;
        }
    }
    return closestCircle;
}

function calculateDistanceBetweenPoints (p1, p2) {
    return Math.sqrt( Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) );
}

function pathForImperfectCircleWithRadius (cx, cy, r) {
    var pieces = 30;

    var circlePoints = [];
    for (var i = 0; i < pieces; i++) {
        var circleAngle = i * 2 * Math.PI / pieces;
        var dr = plusOrMinusRange(r / 35);
        circlePoints.push([cx + Math.cos(circleAngle) * r + dr, cy + Math.sin(circleAngle) * r + dr, dr]);
    }

    var string = "M" + circlePoints[0][0] + ', ' + circlePoints[0][1];

    for (i = 0; i < pieces + 1; i++) {
        var index = i % pieces;
        var deltaR = circlePoints[index][2];
        var pointDelta = Math.pow(Math.abs(deltaR), 0.3);
        string += " A" + (r + deltaR) + ', ' + (r + deltaR) + ' 0 0 1 ' + (circlePoints[index][0]) + ', ' + (circlePoints[index][1]);
    }

    return string;
}

function plusOrMinusRange (n) {
    return n * ( Math.random() * 2 - 1);
}

function calculateKeeperRadius (keeper, maxRadius) {
    var distanceToClosestCircle = keeper.distance - keeper.circle.r;
    var dist = maxRadius / 2;
    if (distanceToClosestCircle < dist) {
        return distanceToClosestCircle;
    }
    else {
        return dist;
    }
}