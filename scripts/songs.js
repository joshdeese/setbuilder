var template = $('<div>').addClass('song_container');
template.append($('<div>').addClass('song_info').append($('<span>').addClass('song')));
template.append($('<div>').addClass('icon play').append($('<a>').addClass('various iframe')));
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

	$('.icon.play a').each(function(){
		if($(this).attr('href')){
			$(this).fancybox({ type: 'iframe'});
		} else {
			$(this).click(function(){
				var myBtn = $(this);
				var linker = $('<div>').append('YouTube Link:').append($('<input>').attr('type', 'text').attr('id', 'link')).append($('<div>').attr('id', 'btnLinkSave').append('Save')).append($('<div>').attr('id', 'youtube_done'));
				$('#btnLinkSave', linker).button().click(function(){
					var songID = $(myBtn).attr('songID');
					var myURI = parseUri($('#link').val());
					var vidID = myURI.queryKey.v;
					$.ajax({
						type: "GET",
						url: "/scripts/put_data.php",
						data: {key: songID, update: 'YouTube', myData: vidID},
						async: false,
						success: function(data){
							$('#youtube_done').append('Done');
							$('.icon.play a', $('#'+songID)).attr('href', 'http://www.youtube.com/embed/' + vidID + '?autoplay=1');
							$('.icon.play a', $('#'+songID)).unbind('click');
							$('.icon.play a', $('#'+songID)).fancybox({type: 'iframe'});
							linker.dialog('close');
							$('.icon.play a', $('#'+songID)).click();
						}
					});
				});
				linker.dialog();
			});
		}
	});


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
	
	mySong.attr('id', objSong.id).attr('title', objSong.title).attr('artist', objSong.artist);
	
	$('.song', mySong).append(objSong.title + ' - ' + objSong.artist);
	
	var youtube = 'http://www.youtube.com/embed/' + objSong.YouTube + '?autoplay=1';
	var lyrics = '/scripts/pdf_load.php?id=' + objSong.id + '&type=lyrics';
	var chord = '/scripts/pdf_load.php?id=' + objSong.id + '&type=chord';
	
	if(objSong.YouTube){
		$('.play a', mySong).attr('href', youtube);
	} else {
		$('.play a', mySong).removeAttr('href').attr('songID', objSong.id);
	}
	
	$('.lyrics a', mySong).attr('href', lyrics);
	$('.chord a', mySong).attr('href', chord);
	
	$('#song_list').append(mySong);
}

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri(str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
}