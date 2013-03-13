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
};
</script>
</html>

<!--
<div>
	YouTube Link:
	<input type="text" id="link" />	
</div>
-->