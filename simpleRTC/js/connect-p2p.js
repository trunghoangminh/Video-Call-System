$(document).ready(function() {

	var x = '';
	accept = 0;
	clientID = '';
	users = null;

	var room = location.search && location.search.split('?')[1];
	var webrtc = new SimpleWebRTC({
		localVideoEl: 'localVideo',
		remoteVideosEl: '',
		autoRequestMedia: true,
		debug: false,
		detectSpeakingEvents: true,
		autoAdjustMic: false,
	});

	function star() {
		webrtc.startLocalVideo();
	}
    //------------------------------------------------------------------------------------------------------------

    socket.on("serverguiIDuser", function(data) {
    	clientID = data.socketID;
    	console.log(clientID);

    	$('#login').click(function() {
    		if($('#sessionName').val() == ""){
    			alert("Tên đăng nhập không được để trống!")
    		}
    		else{
    			$(".popup").fadeOut(1000);
    			$(".overlay").css('display', 'none');
    			users = {
    				usename: $('#sessionName').val(),
    				clientID: clientID
    			};
    			socket.emit("new user", users);
    			$('#sessionName').remove();
    			console.log(users);
    		}
    	});

    });
	
    var lstUser = [];
    socket.on("server-return-listUer", function(data) {
    	console.log(data);

    	lstUser = data.danhsach;
    	console.log('online list: ' + lstUser.length);
    	for (var i = 0; i < lstUser.length; i++) {
    		nameUser = lstUser[i].usename;
			if(lstUser[i].clientID != clientID){
				$(".chat-sidebar").append('<div id="' + i + '"></div>');
				$('.chat-sidebar #' + i + '').html('<div style="width:100%"><a class="socketID_Client" data-id="' + lstUser[i].clientID + '" href="javascript:void(0);"><div class="user-name"><img src="../../user.jpg" class="text-center"/>' + nameUser + '<span class="user-status">Onl</span></div></a></div><div class="clr"></div>');
				$('.chat-sidebar #' + i + '').addClass("sidebar-name");
			}
    		flag = true;
    	}

    });
	
    $(document).on('click', '.socketID_Client', function() {
    	var id = $(this).data('id');
    	var text;
    	var call = confirm("Bạn sẽ gọi cho ID : " + id+" ?");
    	if (call == true) {

    		socket.emit("call", id);
    		console.log('~~~~~~~~~~~~~|~|~|~~~');
    		if (room) webrtc.joinRoom(room);
    	} else {
    	}
    	$('#callClient').text(text);
			
		/*$( ".socketID_Client" ).each(function( index, item ) {
			console.log($(this).data('id') );
			console.log(index );
					
			if ( $(this).data('id') == '/#q7v9zmGCcHjCP5fJAAAE'){
				console.log(index );
			}
		});*/

    });
	
	socket.on("server-send-user-exit", function(data){
		var exit = data.userExit;
		console.log('~~~~~> :',data.userExit);
		
		$( ".socketID_Client" ).each(function( index, item ) {
			console.log('data id : ' ,$(this).data('id') );
			console.log(index );
					
			if ( $(this).data('id') == exit){
				console.log("++++ bang+++",exit );
				console.log("++++ ViTri+++",index );
				var theID = $(this).data('id');
				$("div a[data-id='" + theID + "']").remove();
			}
		});
	
	});
	


    socket.on("server_return_call", function(data) {
        //alert(data.request);
        var accept_join = confirm(data.request + '. Đồng ý tham gia ?');
        if (accept_join == true) {
        	accept = 1;
        	if (accept == 1) console.log('~~~~~~~~~~~~~~~~~~');
        	if (room) webrtc.joinRoom(room);
        }

    })


    $("#load_home").on("click", function() {
		if($("#URL").val()){
			$("#content").load($("#URL").val());
		}else{
			alert("Bạn chưa điền vào 1 URL");
		}
    });

    $('.subjectContent').scroll(function(){
    	console.log( $('.subjectContent').scrollTop()); 
    	socket.emit("scroll", $('.subjectContent').scrollTop() );
    });

    socket.on("serverguiScroll", function(data){
        //io.sockets.emit("new message",{msg:data});
        console.log(data ); 
        $('.subjectContent').scrollTop(data.pos);

    })
    //--------------------------------------------------------------------------------------------
    // popup
    $(".overlay-room").fadeToggle('fast');
    $(".popup-room").fadeIn(1000);
    // sound
    $("#sound").click(function(event) {
        if($("#sound").val() == 1){
            $("#sound").text('Bật âm thanh')
            $("#sound").val("0");
            webrtc.mute();
        }else{
             $("#sound").text('Tắt âm thanh')
             $("#sound").val("1"); 
             webrtc.unmute();
        }
    });
    //--------------------------------------------------------------------------------------------

    webrtc.on('videoAdded', function(video, peer) {
    	console.log('video added', peer);
    	console.log(peer.nick);
    	var remotes = document.getElementById('remotes');
    	if (remotes) {
    		var d = document.createElement('div');
    		d.className = 'videoContainer';
    		d.id = 'container_' + webrtc.getDomId(peer);
    		d.appendChild(video);
    		var vol = document.createElement('div');
    		vol.id = 'volume_' + peer.id;
    		vol.className = 'volume_bar';
    		d.appendChild(vol);
    		remotes.appendChild(d);

    		x = d.id;
    	}
    	console.log(x);
    	$('#outP').text(x);

    });


    webrtc.on('videoRemoved', function(video, peer) {
    	console.log('video removed ', peer);
    	var remotes = document.getElementById('remotes');
    	var el = document.getElementById('container_' + webrtc.getDomId(peer));
    	if (remotes && el) {
    		remotes.removeChild(el);
    	}
    });

    function setRoom(name) {
    	$('#sessionInput').remove();
    	$('h1').text(name);
    	$('#subTitle').text('Link to join: ' + location.href);
    	$('body').addClass('active');
    }

    if (room) {
    	setRoom(room);
    	$(".popup-room").fadeOut(1000);
		$(".overlay-room").css('display', 'none');
		$(".overlay").fadeToggle('fast');
		$(".popup").fadeIn(1000);
    } else {
    	$('#createRoom').click(function() {
    		var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
    		if(val != ""){
    			webrtc.createRoom(val, function(err, name) {
    				console.log(' create room cb', arguments);
    				var newUrl = location.pathname + '?' + name;
    				if (!err) {
    					history.replaceState({
    						foo: 'bar'
    					}, null, newUrl);
    					setRoom(name);
    				} else {
    					console.log(err);
    				}
    			});
    			$(".popup-room").fadeOut(1000);
    			$(".overlay-room").css('display', 'none');
    			$(".overlay").fadeToggle('fast');
    			$(".popup").fadeIn(1000);
    			return false;
    		}
    		else{
    			alert("Tên phòng của bạn không được để trống!");
    		}
    	});
    }
});