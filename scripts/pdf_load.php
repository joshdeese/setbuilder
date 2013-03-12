<html>
	<head>
		<?php include_once('../includes/headfiles.php');?>
	</head>
<?php
	if(file_exists('../content/pdf/'.$_GET['type'].'/'.$_GET['id'].'.pdf')){
		header('Content-type: application/pdf');
		header('Content-disposition: inline; filename='.$_GET['id'].'.pdf');
		@readfile('../content/pdf/'.$_GET['type'].'/'.$_GET['id'].'.pdf');
	} else {
		// todo: this is where users can upload new content
		echo "This content doesn't yet exist";
	}
?>
<script type="text/javascript">
	<?php 
		if($_GET['type'] == 'play'){
			echo "youtube_link();";
		} else {
			echo "upload_file();";
		}
	?>
	function upload_file(){
		var uploader = $('<div>').append('Upload File:').append($('<form>').attr('id', 'imageform').attr('method', 'post').attr('enctype', 'multipart/form-data').attr('action', '/scripts/ajaximage.php').append($('<input>').attr('type', 'file').attr('name', 'photoimg').attr('id', 'photoimg').css('width', 250))).append($('<div>').attr('id', 'preview'));
		$('body').append(uploader);
		$('#photoimg').live('change', function(){ 
			$("#preview").html('');
			//$("#preview").html('<img src="/das/img_files/loader.gif" alt="Uploading...."/>');
			
			var uploadFolder = "<?php echo $_GET['type']; ?>";
			
			$("#imageform").ajaxForm({type: 'GET', async: false, data: {opt1: uploadFolder}, success: function(data){
				if(data.indexOf('<img')!=-1){
					$('#preview').html(data);
					$('#'+$(data).attr('id')).click(function(){
						myScope.addImg($(this).attr('src'), true);
					});
				} else {
					$('#preview').html(data);
				}
			}}).submit();
		});
	}
	
	function youtube_link(){
		var linker = $('<div>').append('YouTube Link:').append($('<input>').attr('type', 'text').attr('id', 'link')).append($('<div>').attr('id', 'btnLinkSave').append('Save')).append($('<div>').attr('id', 'youtube_done'));
		$('#btnLinkSave', linker).button().click(function(){
			var myURI = parseUri($('#link').val());
			var vidID = myURI.queryKey.v;
			$.ajax({
				type: "GET",
				url: "/scripts/put_data.php",
				data: {key: <?php echo $_GET['id']; ?>, update: 'YouTube', myData: vidID},
				success: function(data){
					//alert(data);
					$('#youtube_done').append('Done');
				}
			});
		});
		$('body').append(linker);
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
	};
</script>
</html>

<!--
<div>
	YouTube Link:
	<input type="text" id="link" />	
</div>
-->