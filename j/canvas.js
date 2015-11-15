// Console.log stuff
function log(variable) {
    console.log(variable);
}

// Return unit divider
function getUnitDivider() {
    // unitDivider sets the scale of the drawing. It is used by units() to
    // divide the width of the canvas into psuedo-units.
    var unitDivider = 3;

    return unitDivider;
}

// Return canvas element
function getCanvas() {
    var canvas = document.getElementById('toolDrawing');

    return canvas;
}


// Return a sane number of pixels so we can feed actual inches into the
// canvas without worrying about the output not fitting the screen.
function units(units) {
    var unitDivider = getUnitDivider();
    var canvas = getCanvas();

    return (canvas.width / unitDivider) * units;
}


/* Trig Functions */

function calcOpp(sideA, angleA) {
    return Math.tan( ( degToRad(angleA) ) * sideA);
}

// function calcOpp(sideB, angleA) {
//     angleB
//     return Math.tan( ( degToRad(angleA) ) * sideA);
// }

function degToRad(n) {
    // Convert degrees to radians; Math deals with rads only
    return (Math.PI/180) * n;
}


/* Messaging Functions */

function flashMessage(htmlClass, message) {
    var message = '<li class="' + htmlClass + '">' + message + '</li>';

    // Make sure the message isn't already present before appending
    // the messsage to the messages-list <ul>
    if ($('#messages-list').html().indexOf(message) == -1) {
        $('#messages-list').append(message);
    }
}

function deleteMessage(htmlClass) {
    $('.' + htmlClass).remove();
}

// Does all the heavy lifting

function readAndDraw() {

    /* INITIAL DIAMETERS */

    // Cutting Diameter
    var dia = units( $('#cutDia').val() );
    var diaHalf = dia / 2;

    // Shank Diameter
    var shankDia = units( $('#shankDia').val() );
    var shankDiaHalf = shankDia / 2;

    // Neck Diameter
    var neckDia = units( $('#neckDia').val() );
    var neckDiaHalf = neckDia / 2;

    // Angle Diameter
    var angleDia = units( $('#angleDia').val() );
    var angleDiaHalf = angleDia / 2;

    // Radius Size
    var rad = units( $('#radSize').val() );

    // Constrain the radius size so it doesn't exceed half the diameter
    if (rad > diaHalf) {
        rad = diaHalf;

        deleteMessage('rad');
        flashMessage('rad', 'The radius size has been constrained by the cutting diameter. The radius must not exceed half the cutting diameter.')
    } else {
        deleteMessage('rad');
    }


    /* ORIGINS */

    // Set up origin points
    // These depend on the shank / cut diameter (whichever is larger)
    // Centerpoint line depends on these as well
    var originX = 0;

    // Base the originY on shank or cut, whichever is larger
    if (dia > shankDia) {
      var originY = diaHalf;

      deleteMessage('originY');
      flashMessage('originY', 'Centerpoint calculated on cutting diameter.')
    } else {
      var originY = shankDiaHalf;

      deleteMessage('originY');
      flashMessage('originY', 'Centerpoint calculated on shank diameter.')
    }


    /* CALCULATIONS */

    // Y (vertical axis)
    var shankY = originY - shankDiaHalf;

    // For this tooling profile, it doesn't make any sense to have a dia
    // larger than the shankDia. Constrain diaY so it isn't larger than
    // shankY
    if (dia > shankDia) {
        var diaY = shankY;

        deleteMessage('diaY');
        flashMessage('diaY', 'The cutting diameter has been constrained by the shank diameter. For this tool profile, only diameters equal to or smaller than the shank diameter are permitted. If you must have this cutting diameter, you will have to increase the shank diameter.');
    }
    // Otherwise render as normal
    else {
        var diaY = originY - diaHalf;

        deleteMessage('diaY');
    }

    var cutY = diaY;

    // Don't let the neck diameter exceed the cutting diameter,
    // and if neckDia isn't set, assume that it's the same
    // as the cutting diameter
    if (neckDia) {

        // If the dia is larger than the shankDia, constrain the neck
        // diameter to be no larger than the shankDia.
        // Otherwise we can get a negative taper angle which doesn't
        // fit the profile of this tool.
        if (dia > shankDia && neckDia > shankDia) {
            var neckY = shankY;

            deleteMessage('neckY');
            flashMessage('neckY', 'The neck diameter has been constrained by the shank diameter. Otherwise this would result in a negative taper angle which does not fit this tool\'s profile. Increase the shank diameter if you must have this neck size.');
        }
        // However if the dia is smaller than the shankDia, constrain the
        // neckDia to be equal to the diameter. It doesn't make sense to have
        // a neck diameter greater than the cutting diameter.
        else if (dia < shankDia && neckDia > dia) {
            var neckY = diaY;

            deleteMessage('neckY');
            flashMessage('neckY', 'The neck diameter has been constrained by the cutting diameter. The neck may not be larger than the cutting diameter. Increase the cutting diameter if you must have this neck size.');
        }
        // Otherwise just render the neck like usual and pass no messages
        else {
            var neckY = originY - neckDiaHalf;

            deleteMessage('neckY');
        }

    } else {
        // If neckDia isn't set, but dia is larger than shankDia,
        // set the neckY equal to shankY
        // If this isn't the case we can get a reverse taper angle
        // which doesn't fit the profile of the tool we're trying
        // to create.
        if (dia > shankDia){
            var neckY = shankY;
        }
        // In all other cases it's safe to set the neckY equal to
        // diaY, such as when the dia is equal to or smaller than
        // shankDia
        else {
            var neckY = diaY;
        }

    }

    // The taperY and neckY are always the same, as we don't want to have a tapered neck.
    var taperY = neckY;


    // Do trig calculations to figure out where the taper should start (we
    // know where it ends already, at the neck)
    var sideA = $('#taperLen').val();
    var angleA = $('#taperAng').val();

    if (sideA > 0 && angleA > 0) {
        var sideB = calcOpp(sideA, angleA);
        sideB = units(sideB);
    }

    if ( (neckY - sideB) <= shankY) {
        var angleY = shankY;

        deleteMessage('angleY');
        flashMessage('angleY', 'The taper angle is too great and has been constrained by the size of the shank. Increase the shank size if you must have this angle.');
    } else {
        var angleY = neckY - sideB;

        deleteMessage('angleY');
    }



    /* LENGTHS */

    // These are all the straightforward values from input boxes
    var shankLen = units( $('#shankLen').val() );
    var taperLen = units( $('#taperLen').val() );
    var neckLen = units( $('#neckLen').val() );
    var cutLen = units( $('#cutLen').val() );

    // Angle (lead-out angle) on the other hand must be calculated
    if (angleY - shankY > 0) {
        var angleLen = angleY - shankY;
    } else {
        var angleLen = 0;
    }



    /* x parameters */

    // X (horizontal axis)
    var shankX = shankLen;
    var angleX = shankX + angleLen;
    var taperX = angleX + taperLen;
    var neckX = taperX + neckLen;
    var diaX = neckX;

    if (rad > 0) {
      var cutX = (diaX + cutLen) - rad;
    } else {
      var cutX = diaX + cutLen;
    }

    // Call the draw function
    draw();

    function draw() {

        // Get the canvas. This can't be a jQuery object so we have to get the canvas
        // element with pure js
        var canvas = document.getElementById('toolDrawing');

        // Set the context. In this case we're dealing with 2d only.
        var context = canvas.getContext("2d");

        // This parameter shifts the lines by 0.5 to prevent them from blurring
        // due to the way the canvas draws lines
        // context.translate(0.5, 0.5);

        // Set the scale of the drawing. Probably should stay at 1,1?
        context.scale(1, 1);

        // Clear the canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);


        // Set the line back to solid; this is necessary because we have
        // a dashed line for the centerline below
        context.setLineDash([0, 0]);

        // Same thing for line color
        context.strokeStyle = '#000';

        // Set the lineWidth (stubbed out in case we need to modify this later)
        context.lineWidth = 1;


        // Begin Drawing
        context.beginPath();



        /* TOP HALF */

        // Go to the initial starting point
        context.moveTo(originX, originY);

        // Draw to top of shank
        context.lineTo(originX, shankY);

        // Draw to end of shank
        context.lineTo(shankX, shankY);

        // Draw to end of angle
        context.lineTo(angleX, angleY);

        // Draw to the end of taper
        context.lineTo(taperX, taperY);

        // Draw to the end of neck
        context.lineTo(neckX, neckY);

        // Draw to the top of the diameter
        context.lineTo(diaX, diaY);

        // Draw to end of cut
        context.lineTo(cutX, cutY);

        // Draw arc if present
        if (rad > 0) {
          context.arc(cutX, (cutY + rad), rad, Math.PI * 1.5, 0)
        }

        // Draw to midpoint if radius is less than 1/2 of the diameter
        // eg if it's a rad not a ball nose
        if (rad < (diaHalf)) {
          context.lineTo(cutX + rad, originY);
        }


        // Invert Y axis vars
        function invert(varY) {
            return (originY - varY) + originY;
        }


        /* BOTTOM HALF */

        // Midpoint line inverted
        if (rad < (diaHalf)) {
          context.lineTo(cutX + rad, originY + rad);
        }

        // Arc if present inverted
        if (rad > 0) {
          context.arc(cutX, (invert(cutY) - rad), rad, 0, Math.PI * 0.5)
        }

        // Draw to end of cut
        context.lineTo(diaX, invert(diaY));

        // Draw to the bottom of the neck
        context.lineTo(diaX, invert(neckY));

        // Draw to the beginning of the neck
        context.lineTo(taperX, invert(taperY));

        // Draw to the beginning of taper
        context.lineTo(angleX, invert(angleY));

        // Draw to end of angle
        context.lineTo(shankX, invert(shankY));

        // Draw to end of shank
        context.lineTo(originX, invert(shankY));

        // Draw to the origin point
        context.lineTo(originX, originY);



        // A function to abstract the gruntwork of drawing point markers a little
        function drawMarker(x, y) {
            var lineDiff = originY - y;
            context.moveTo(x, y);
            context.lineTo(x, y + ( lineDiff * 2) );
        }

        // Line Endpoint Markers
        drawMarker(shankX, shankY);
        drawMarker(angleX, angleY);
        drawMarker(taperX, taperY);
        drawMarker(neckX, neckY);

        context.stroke();


        // // Draw the centerline
        // context.setLineDash([4, 3]);

        // context.beginPath();
        // context.moveTo(originX, originY);
        // context.lineTo(units(4), originY);
        // context.strokeStyle = '#bdbdbd';
        // context.stroke();
    }
}

$(document).load(
    readAndDraw()
);

$(document).ready(function() {
    $('input').on('keyup blur click', function() {
        readAndDraw();
    });

    $('select').on('select blur click', function() {
        readAndDraw();
    })
});
