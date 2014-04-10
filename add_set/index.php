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
		<script src="../scripts/addSetPage.js" type="text/javascript"></script>
		<title>New Set</title>
		<script type="text/javascript">
			$(document).ready(function(){		
				pageSetup();
			});	
		</script>
	</head>
	<body>
		<div id="wrapper">
			<?php include('../includes/header.php'); ?>
			<?php include('../includes/nav.php'); ?>
			<div id="content" style="width: 940px;">
				<div id="left_bar" style="width: 440px; float: left;">
					<div id="filters">
						<table>
							<tr>
								<td>Filters:</td>
							</tr>
							<tr>
								<td>
									<input type="text" id="txtSearch" />
								</td>
							</tr>
							<tr>
								<td>
									<select id="artist_filter">
										<option value=0>All</option>
									</select>
								</td>
							</tr>
						</table>
					</div>
					<div id="song_list_container"></div>
				</div>
				<div id="setlist" style="width: 490px; float: right;">
					<div id="set_details">
						<table>
							<tr>
								<td>Title:</td>
								<td>
									<input type="text" id="mail_subject" />
								</td>
								<td>Date:</td>
								<td>
									<input type="text" id="set_date" />
								</td>
							</tr>
							<tr>
								<td>Message:</td>
								<td colspan="3">
									<textarea rows="3" cols="50" id="mail_message"></textarea>
								</td>
							</tr>
						</table>
					</div>
					<div id="set_songs">
						<table id="set_songs_table">
							<tr class="table_head">
								<th width="200">Title</th>
								<th width="150">Lead Vocals</th>
								<th width="75">Key</th>
							</tr>
							<tr class="table_body empty">
								<td colspan="3"></td>
							</tr>
							<tr class="table_body empty">
								<td colspan="3"></td>
							</tr>
							<tr class="table_body empty">
								<td colspan="3"></td>
							</tr>
							<tr class="table_body empty">
								<td colspan="3"></td>
							</tr>
							<tr class="table_body empty">
								<td colspan="3"></td>
							</tr>
						</table>
						
						<div id="btnSend">Send</div>
						<div id="btnSave">Save</div>
					</div>
				</div>
			</div> <!-- end #content -->
			<?php include('../includes/sidebar.php'); ?>
			<?php include('../includes/footer.php'); ?>
		</div> <!-- End #wrapper -->
		<!-- Templates -->
		<script type="text/template" id="tmplt-Songs">
			<div id="song_list_container"></div>
		</script>
		<script type="text/template" id="tmplt-Song">
			<div class="song_container" id="<%= id %>" title="<%= title %>" artist="<%= artist %>">
				<div class="song_info">
					<span class="song" contenteditalbe="false"><%= title %></span>
					</div>
			</div>
		</script>
	</body>
</html>