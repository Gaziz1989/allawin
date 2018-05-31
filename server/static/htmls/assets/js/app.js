$(document).ready(function() {
    $('.category').slick({
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 6,
        slidesToScroll: 6,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    //range slider
    $( function() {
        $( "#slider-range" ).slider({
            range: true,
            min: 1,
            max: 30,
            values: [ 1, 30 ],
            slide: function( event, ui ) {
                $( "#amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
            }
        });
        $( "#amount" ).val($( "#slider-range" ).slider( "values", 0 ) +
            " - " + $( "#slider-range" ).slider( "values", 1 ) );
    } );

    $( function() {
        $( "#slider-range2" ).slider({
            range: true,
            min: 0,
            max: 5,
            values: [ 0, 5 ],
            slide: function( event, ui ) {
                $( "#amount2" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
            }
        });
        $( "#amount2" ).val($( "#slider-range2" ).slider( "values", 0 ) +
            " - " + $( "#slider-range2" ).slider( "values", 1 ) );
    } );
});

//Modal window
// var modal = document.getElementById('myModal');
// var btn = document.getElementById("myBtn");
// var span = document.getElementsByClassName("modal__content__close")[0];
//
// btn.onclick = function() {
//     modal.style.display = "block";
// }
//
// span.onclick = function() {
//     modal.style.display = "none";
// }
//
// window.onclick = function(event) {
//     if (event.target == modal) {
//         modal.style.display = "none";
//     }
// }






//data picker
// var myPicker = document.getElementById('myPicker');

// myPicker.onclick = function () {
//     dataPicker.style.display = 'block';
// }


// myPicker.onclick = function () {
//     var dataPicker = document.getElementById('dataPicker');
//     if(dataPicker.display.style === 'none'){
//         dataPicker.display.style = 'block'
//     } else {
//         dataPicker.display.style = 'none'
//     }
// }



/*Add photo*/
var readURL = function (input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('.profile-pic').attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
};

$(".file-upload").on('change', function () {
    readURL(this);
});

$(".upload-button").on('click', function () {
    $(".file-upload").click();
});



// $(".choose-account").parents('div, main').css({'min-height': '100%', 'height': '100%'});
// $(".mainFilter-wrap__result").parents('div,  section').css({'min-height': '100%', 'height': '100%'});
// $(".mainFilter-wrap__result").parents('main').css({'min-height': '100%'});



$(function() {

    var transEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition' : 'transitionend',
            'OTransition' : 'oTransitionEnd',
            'msTransition' : 'MSTransitionEnd',
            'transition' : 'transitionend'
        },
        transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
        $wrapper = $( '#custom-inner' ),
        $calendar = $( '#calendar' ),
        cal = $calendar.calendario( {
            onDayClick : function( $el, $contentEl, dateProperties ) {

                if( $contentEl.length > 0 ) {
                    showEvents( $contentEl, dateProperties );
                }

            },
            caldata : codropsEvents,
            displayWeekAbbr : true
        } ),
        $month = $( '#custom-month' ).html( cal.getMonthName() ),
        $year = $( '#custom-year' ).html( cal.getYear() );

    $( '#custom-next' ).on( 'click', function() {
        cal.gotoNextMonth( updateMonthYear );
    } );
    $( '#custom-prev' ).on( 'click', function() {
        cal.gotoPreviousMonth( updateMonthYear );
    } );

    function updateMonthYear() {
        $month.html( cal.getMonthName() );
        $year.html( cal.getYear() );
    }

    // just an example..
    function showEvents( $contentEl, dateProperties ) {

        hideEvents();

        var $events = $( '<div id="custom-content-reveal" class="custom-content-reveal"><h4>Events for ' + dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year + '</h4></div>' ),
            $close = $( '<span class="custom-content-close"></span>' ).on( 'click', hideEvents );

        $events.append( $contentEl.html() , $close ).insertAfter( $wrapper );

        setTimeout( function() {
            $events.css( 'top', '0%' );
        }, 25 );

    }
    function hideEvents() {

        var $events = $( '#custom-content-reveal' );
        if( $events.length > 0 ) {

            $events.css( 'top', '100%' );
            Modernizr.csstransitions ? $events.on( transEndEventName, function() { $( this ).remove(); } ) : $events.remove();

        }

    }

});


$(document).ready(function() {
$( ".click-modal" ).click(function() {
    $( ".calendar-modal" ).toggle();
});
});