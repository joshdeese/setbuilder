<?php	
	function sqlCheckBox($name, $results)
	{
		//loop through results and displays a CheckBox list
		for($i = 0; $i < mysql_num_rows($results); $i++)
		{
			?>
			<input type="checkbox" name="<?php echo $name; ?>" value="<?php echo mysql_result($results, $i, 0); ?>" /><?php echo mysql_result($results, $i, 1); ?><br/>
			<?php
		}
	}
?>