(function() {
	const localVideo = document.querySelector(".localVideo");
	localVideo.addEventListener("mouseover", video_over);
	localVideo.addEventListener("click", video_move);


	function video_over() {
		localVideo.classList.add("video_over");

	}
	function video_move() {
		localVideo.classList.remove("video_over");

	}

})();