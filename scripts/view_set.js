function set_data(setID){
	var setData;
	var template = $('<tr>');
	template.append($('<td>').addClass('song_title'));
	template.append($('<td>').addClass('singer'));
	template.append($('<td>').addClass('song_key'));
	template.append($('<td>').append($('<div>').attr('class', 'icon play').append($('<a>').attr('class', 'various iframe'))));
	template.append($('<td>').append($('<div>').attr('class', 'icon pdf lyrics').append($('<a>').attr('class', 'iframe'))));
	template.append($('<td>').append($('<div>').attr('class', 'icon pdf chord').append($('<a>').attr('class', 'iframe'))));
	
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/scripts/getSetData.php",
		data: {setID: setID},
		async: false,
		success: function(data){
			$('#title').append(data[0].Title);
			$('#date').append(data[0].Date);
			$('#message').append(data[0].Notes);
			
			for(var i=1; i<data.length; i++){
				var mySong = template.clone();
				
				$('.song_title', mySong).append(data[i].title);
				$('.singer', mySong).append(data[i].FName);
				$('.song_key', mySong).append(data[i].Key);
				$('.play a', mySong).attr('href', 'http://www.youtube.com/embed/' + data[i].YouTube + '?autoplay=1');
				$('.lyrics a', mySong).attr('href', '/scripts/pdf_load.php?id=' + data[i].songID + '&type=lyrics');
				$('.chord a', mySong).attr('href', '/scripts/pdf_load.php?id=' + data[i].songID + '&type=chord');
				
				$('#songs').append(mySong);
			}
		}
	});
}