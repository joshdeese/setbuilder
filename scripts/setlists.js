var template = $('<tr>').addClass('set_container');
template.append($('<td>').addClass('date')).append($('<td>').addClass('title'));

function load_sets(){
	// ID, Date, Title, Notes
	var sets = new Array();
	
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/scripts/getSets.php",
		async: false,
		success: function(data){
			sets = data;
		}
	});
	
	for(var i=0; i<sets.length; i++){
		write_set(sets[i]);
	};
}

function write_set(objSet){
	var mySet = template.clone();
	
	mySet.attr('setID', objSet.id).attr('title', objSet.Title).attr('date', objSet.Date).attr('notes', objSet.Notes);
	
	$('.date', mySet).append(objSet.Date);
	$('.title', mySet).append(objSet.Title);
		
	$('#set_list_table').append(mySet);
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

$.fn.choose_set = function(){
	window.location.href = '/view_set?id='+$(this).attr('setID');
}