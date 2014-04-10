<div id="nav">
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/portfolio">Portfolio</a>
	<a href="/contact">Contact</a>
	<a href="/mymoviesonline">Movies</a>
	<a href="/ProjectEuler">Project Euler</a>
	<?php
		if($_SESSION["user_group"]==5)
		{
			echo '<a href="/admin">Admin</a>';
		}
	?>
</div> <!-- end #nav -->