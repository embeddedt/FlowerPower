/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var waterLevel = 100;

var flowerGrowth = 0;

var shouldGrow = false;

var hasWilted = false;

var shouldWilt = false;

var loopsWithNoLight = 0;

var isNight = false;

var cause;

function wilt(shouldWilt, time, callback) {
    if (time === undefined)
        time = 2000;
    if (shouldWilt === undefined || shouldWilt) {
        if (flowerGrowth >= 0)
            $("#flower-stem-wilted").stop(true).fadeIn(time);
        if (flowerGrowth >= 25)
            $("#flower-left-leaf-wilted").stop(true).fadeIn(time);
        if (flowerGrowth >= 50)
            $("#flower-right-leaf-wilted").stop(true).fadeIn(time);
        if (flowerGrowth >= 75) {
            $("#flower-head").stop(true).fadeOut(time);
            $("#flower-head-wilted").stop(true).fadeIn(time);
        }
    } else {
    }
    setTimeout(callback, time + 2000);
}

function sayIssue(text) {
    $("#plant-issue").text(text);
    $("#plant-issue").finish().fadeIn(1000).delay(2500).fadeOut(1000);
}

function grow() {

    /* Now check what should be enabled */
    if (!shouldGrow) {
        if (!hasWilted && shouldWilt)
        {
            wilt(true, 2000, function () {
                if (cause === 0) {
                    $("#no-water-dialog").dialog({modal: true});
                } else if (cause === 1) {
                    $("#no-light-dialog").dialog({modal: true});
                } else {
                    console.log("UNEXPECTED CAUSE");
                }
            });
            hasWilted = true;
        }
        return;
    }

    if (flowerGrowth === 0) {
        console.log("Stem");
        $("#flower-stem").stop(true).fadeIn(2000);
    }
    if (flowerGrowth === 25) {
        $("#flower-left-leaf").stop(true).fadeIn(2000);
    }
    if (flowerGrowth === 50) {
        $("#flower-right-leaf").stop(true).fadeIn(2000);
    }
    if (flowerGrowth === 75) {
        console.log("Head");
        $("#flower-head").stop(true).fadeIn(2000);
    }
    if (flowerGrowth >= 0 && flowerGrowth < 100) {
        flowerGrowth += 0.5;
        if (waterLevel > 0)
            waterLevel -= 2;
        if (isNight)
            loopsWithNoLight++;

        if (loopsWithNoLight === 25) {
            shouldGrow = false;
            shouldWilt = true;
            cause = 1;
        } else
        if (waterLevel <= 0) {
            shouldGrow = false;
            shouldWilt = true;
            cause = 0;
        }
    }
    $("#growth-bar-content").css({width: flowerGrowth + '%'});
    if (flowerGrowth === 100) {
        $("#grew-dialog").dialog({modal: true});
    }
}

function setDaytime(night) {
    if (night === undefined)
        night = false;
    if (night)
        $(".house-window").css({'background-image': 'url(window_background_dark.svg)'});
    else
        $(".house-window").css({'background-image': 'url(window_background.svg)'});

    if (night) {
        $("#night-filter").show();
    } else
        $("#night-filter").hide();

    $("#light-text").text(night ? "Night" : "Day");
    isNight = night;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function doWater() {
    
    if(waterLevel === 100) {
        sayIssue("Water level is full!");
        return;
    }
    $("#watering-can-div").show();
    $("#water-button").attr("disabled", true);
    $({waterLevel: waterLevel}).animate({waterLevel: 100}, {
        duration: (100 - waterLevel) * 40,
        easing: 'linear',
        step: function (now, fx) {
            waterLevel = now;
        },
        done: function () {
            $("#watering-can-div").hide();
            $("#water-button").attr("disabled", false);
        }
    });
}

async function test() {
    while (true) {

        if (waterLevel < 15)
            $("#water-bar-text").css({color: 'red'});
        else
            $("#water-bar-text").css({color: 'black'});
        grow();
        await sleep(200);
        if ($(".water-bar").outerHeight() === 50) {
            $(".water-bar-contents").css({width: waterLevel + '%', height: ''});
        } else {
            $(".water-bar-contents").css({height: waterLevel + '%', width: ''});
        }

    }
}

$(window).resize(function () {
    $(".house-window").css({height: $(".house-window").width() * 0.82});
    if ($(".water-bar").outerHeight() === 50) {
        $(".water-bar-contents").css({width: waterLevel + '%', height: ''});
    } else {
        $(".water-bar-contents").css({height: waterLevel + '%', width: ''});
    }
});
$(window).load(function () {
    $(".flower-img").hide();
    $("#plant-issue").hide();
    $("#watering-can-div").hide();
    $("#instructions-dialog").dialog({modal: true});
    $("#water-button").click(doWater);
    $("#growButton").click(function () {
        if(shouldWilt) {
            sayIssue("It's dead.");
        } else
        if(shouldGrow) {
            sayIssue("It's growing!");
        } else
            shouldGrow = true;
    });
    $("#light-checkbox").attr("checked", "true");
    $("#light-slider-switch").click(function () {
        var isChecked = !$("#light-checkbox").is(":checked"); /* condition is inverted */
        if (isChecked)
            $("#light-text").css({left: '6px', right: ''});
        else
            $("#light-text").css({left: '', right: '6px'});

        setDaytime(!isChecked);
    });
    $(window).resize();
    test();
    $("#light-slider-switch").click();
    var canvas = $("#watering-can-canvas")[0];

    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;
        ctx.strokeStyle = 'rgba(70,124,224,0.5)';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        var init = [];
        var maxParts = 1000;
        for (var a = 0; a < maxParts; a++) {
            init.push({
                x: Math.random() * w,
                y: Math.random() * h,
                l: Math.random() * 1,
                xs: -4 + Math.random() * 4 + 2,
                ys: Math.random() * 10 + 10
            });
        }

        var particles = [];
        for (var b = 0; b < maxParts; b++) {
            particles[b] = init[b];
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            for (var c = 0; c < particles.length; c++) {
                var p = particles[c];
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
                ctx.stroke();
            }
            move();
        }

        function move() {
            for (var b = 0; b < particles.length; b++) {
                var p = particles[b];
                p.x += p.xs;
                p.y += p.ys;
                if (p.x > w || p.y > h) {
                    p.x = Math.random() * w;
                    p.y = -20;
                }
            }
        }

        setInterval(draw, 30);
    }
});
