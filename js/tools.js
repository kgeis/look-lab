gradientColorStopsString = function () {
    colors = arguments;
    var toReturn = "";
    for (var i = 0; i < colors.length; i++) {
        toReturn += colors[i] + '-';
    }
    return toReturn.slice(0, -1);
};