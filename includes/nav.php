<div id="nav">
	<a href="/">Home</a>
	<a href="/songs">Songs</a>
	<a href="/setlists">Set Lists</a>
	<a href="/members">Members</a>
	<?php
		if($_SESSION["user_group"]==5)
		{
			echo '<a href="/admin">Admin</a>';
		}
	?>
</div> <!-- end #nav -->