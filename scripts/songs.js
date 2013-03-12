var template = $('<div>').addClass('song_container');
template.append($('<div>').addClass('song_info').append($('<span>').addClass('song')));
template.append($('<div>').addClass('icon play').append($('<a>').addClass('various iframe').attr('href', 'http://www.youtube.com/embed/vidid?autoplay=1')));
template.append($('<div>').addClass('icon pdf lyrics').append($('<a>').addClass('iframe')));
template.append($('<div>').addClass('icon pdf chord').append($('<a>').addClass('iframe')));

function load_songs(){
	// Title, Artist, YouTubeID, PDFID
	var songs = new Array();
	
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/scripts/getSongs.php",
		async: false,
		success: function(data){
			songs = data;
		}
	});
	
	
	
	$('.icon.play a', template).fancybox({ type: 'iframe'});
	$('.icon.pdf a', template).fancybox({ 
		type: 'iframe',
		autoSize : false,
		//height: $(window).height(),
		beforeShow : function(){
			// code to resize fancybox goes here
		} 
	});
	
	for(var i=0; i<songs.length; i++){
		write_song(songs[i]);
	};

	$('#btnAdd').button().click(function(){
		$('#song_list').css('display', 'none');
		$('#btnAdd').css('display', 'none');
		$('#new_song').css('display', '');
		$('#btnSave').css('display', '');
	});
	
	$('#btnSave').button().click(function(){
		var mySong = new Array();
		
		mySong.push($('#txtTitle').val());
		mySong.push($('#txtArtist').val());
		mySong.push("");
		mySong.push(/* todo: unique ID*/"");
		
		$.ajax({
			type:"GET",
			url: "/scripts/addSong.php",
			data: { songData: mySong },
			success: function(data){
				alert(data);
				write_song(mySong);
			}
		});
		
		$('#song_list').css('display', '');
		$('#btnAdd').css('display', '');
		$('#new_song').css('display', 'none');
		$('#btnSave').css('display', 'none');
	});
	
	$('#txtSearch').keyup(function(){
		if($(this).val() != ''){
			var search_string = $(this).val().toLowerCase();
			$('.song_container').each(function(){
				var myTitle = $(this).attr('title').toLowerCase();
				var myArtist = $(this).attr('artist').toLowerCase();
				if(myTitle.indexOf(search_string) == -1 && myArtist.indexOf(search_string) == -1){
					$(this).css('display', 'none');
				} else {
					$(this).css('display', '');
				}
			});
		} else {
			$('.song_container').css('display', '');
		}
	});
}

function write_song(objSong){
	var mySong = template.clone();
	
	mySong.attr('title', objSong.title).attr('artist', objSong.artist);
	
	$('.song', mySong).append(objSong.title + ' - ' + objSong.artist);
	
	var youtube = 'http://www.youtube.com/embed/' + objSong.YouTube + '?autoplay=1';
	var lyrics = '/scripts/pdf_load.php?id=' + objSong.id + '&type=lyrics';
	var chord = '/scripts/pdf_load.php?id=' + objSong.id + '&type=chord';
	
	$('.play a', mySong).attr('href', youtube);
	$('.lyrics a', mySong).attr('href', lyrics);
	$('.chord a', mySong).attr('href', chord);
	
	$('#song_list').append(mySong);
}