$(document).ready(function(event){
console.log("Getting called");
	$("#form-login").submit(function (event) {
    	console.log("All data captured from Login Page");
    	var username = $("#username").val();
   		var pass = $("#password").val();
   		console.log(username);
    });
});