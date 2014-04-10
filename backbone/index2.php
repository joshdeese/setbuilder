<script type="text/template" id="search_template">
	<label>Search</label>
	<input type="text" id="search_input" />
	<input type="button" id="search_button" value="Search" />
</script>

<div id="search_container"></div>

<script type="text/javascript">
	SearchView = Backbone.View.extend({
		initialize: function(){
			this.render();
		},
		render: function(){
			// Complie the template using underscore
			var template = _.template( $("#search_template").html(), {}\);
			// Load the compiled HTML into the Backbone "el"
			this.$el.html( template );
		}
	});
	
	var search_view = new SearchView({ el: $("#search_container")});
</script>