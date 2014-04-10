<div id="header">

	<!--<h2>Cornerstone Fellowship</h2>-->
	
	<img id="header_logo" src="/content/images/logo.png" />
	
	<?php
		session_start();
	?>
	
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
</div>