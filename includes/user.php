<?php session_start(); ?>

<div id="user">
	<?php
		if ($_SESSION["auth_username"]!=null)
		{
			echo "Welcome <a href='/user'>".$_SESSION["auth_username"]."</a>";
		} else
		{
			echo "<a href='/login'>Login</a>";
		}
	?>
</div>