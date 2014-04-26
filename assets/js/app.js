$(document).ready(function(){
	
	/**
	 * Magnific pop up
	 */
	$('.portfolio-img').magnificPopup({
		type: 'image',
		mainClass: 'mfp-with-zoom',
		image: {
            verticalFit: true
          },
		zoom: {
			enabled: true,
			duration: 300 // don't foget to change the duration also in CSS
		}
	});
});