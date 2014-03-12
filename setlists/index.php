<?php session_start(); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<meta name="description" content="" />
		<meta name="keywords" content="" />
		<meta name="author" content="" />
		<link rel="stylesheet" type="text/css" href="../style.css" media="screen" />
		<link rel="stylesheet" type="text/css" href="style.css" media="screen" />
		<?php include('../includes/headfiles.php'); ?>
		<script type="text/javascript" src="../scripts/setlists.js"></script>
		<title>Set Lists</title>
		
		<script type="text/javascript">
			$(document).ready(function(){
				load_sets();
				
				$('#add_set').button().click(function(){
					var new_setlist = $('<div>').attr('id', 'dialog_form').attr('title', 'New Setlist');
					new_setlist.append("Enter a name for this setlist.").append($('<input>').attr('id', 'new_set_name').attr('type', 'text'));
					
					new_setlist.keypress(function(e) {
				    if (e.keyCode == $.ui.keyCode.ENTER) {
				    	$(this).parent().find("button:eq(1)").trigger("click");
				    }
					});
					
					new_setlist.dialog({
						buttons: {
							"Cancel": function(){},
							"Save": function(){
								$(this).dialog('close');
								window.location.href = "../add_set";
							} 
						}
					});
				});
			});
		</script>
		
	</head>
	<body>
		<div id="wrapper">
	
		<?php include('../includes/header.php'); ?>
		
		<?php include('../includes/nav.php'); ?>
		
		<div id="content">
			
			<h2>Set Lists</h2>
			
			<div id="add_set">New</div>
			
			<div id="sets_list">
				<div id="searchbox">
					<input type="text" id="txtSearch" />
				</div>
				<div id="sets_list_header">
					<div class="list_date">Date</div>
					<div class="list_title">Title</div>
				</div>
			</div>
		</div> <!-- end #content -->
		
		<?php include('../includes/sidebar.php'); ?>
		
		<?php include('../includes/footer.php'); ?>
	
	    </div> <!-- End #wrapper -->
	</body>
</html>