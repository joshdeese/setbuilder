<div id="nav">
	<a href="/">Home</a>
	<a href="/songs">Songs</a>
	<a href="/setlists">Set Lists</a>
	<?php
		if($_SESSION["user_group"]==1)
		{
	?>
		<a href="/members">Members</a>
		<a href="/admin">Admin</a>
	<?php
		}
	?>
</div> <!-- end #nav -->