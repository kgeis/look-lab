var colors = {
    tequilaSunrise: ["#eaec25", "#ed4faf", "#4fafed"],
    ocean: ["#0099cc", "#EDC9AF", "#004444"],
    hightlighter: ["#80ff00", "#00ffff", "#FFFF00"],
    carbonSky: ["#afe8f6", "#a3a3a3"],
    stawberry: ['#800000', '#ff6666'],
    forest: ['#006400', '#7a5230'],
    algae: ['#adff00', '#74d600', '#028900', '#00d27f', '#00ff83'],
    rainbow: ['#00b159', '#00aedb', '#f37735', '#ffc425'],
    pastels: ['#1b85b8', '#559e83', '#c3cb71', '#ae5a41']
};

function gradientColorStopsString () {
    colors = arguments;
    var toReturn = "";
    for (var i = 0; i < colors.length; i++) {
        toReturn += colors[i] + '-';
    }
    return toReturn.slice(0, -1);
}

function inBounds (point, width, height) {
    return point.x <= width && point.y >= 0 && point.y <= height;
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

function mirror (point, width) {
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