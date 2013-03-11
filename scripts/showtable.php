<?php
	function showTable($result)
	{
		$rows = mysql_num_rows($result);
		$fields = mysql_num_fields($result);
?>
	<table border="1" cellspacing="0" cellpadding="4">
<?php
		for($i=0; $i < $rows; $i++)
		{
?>
	<tr>
<?php
			for($x=0; $x < $fields; $x++)
			{
				$val = mysql_result($result, $i, $x);
?>
		<td><?php echo $val; ?>
<?php
			}
?>
	</tr>
<?php
		}
?>
	</table>
<?php
	}
?>