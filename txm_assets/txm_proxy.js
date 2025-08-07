polyfillCustomEvent();

TXM = {};

var timeSpent = 0,
	timer = setInterval(function(){ 
		timeSpent++;		
		$('.timer').html(new Date(timeSpent * 1000).toISOString().substr(14, 5));
	}, 1000);



TXM.init = function(){
	
	document.addEventListener("INTERACTIVE_ASSET_READY", TXM.dispatcher.onAssetsReady);
	document.addEventListener("ENGAGEMENT_ASSET_LOADING_PROGRESS", TXM.dispatcher.onEngagementAssetLoadingProgress);
	
	TXM.dispatcher.addEventListenerOnce("ENGAGEMENT_STARTED", function(){
		TXM.api.getCurrentStep();
		TXM.api.track("timing", "initial", "js");
		$(TXM.ui.truex_content).on("click", function(e){
			
			TXM.params.interactions++;
			$(TXM.ui.interactionContainer).get(0).innerHTML = "Interactions: "+TXM.params.interactions;

			if(!$(TXM.ui.ico_interact).hasClass('ta-complete')) {
				$(TXM.ui.ico_interact).addClass('ta-complete');
				$(".interact-container").addClass('interact-container--complete');
				$(".interact-text").hide();
				
			}
			
			setTimeout(function(){
				if(TXM.params.preventAdContainerClick)
					TXM.params.preventAdContainerClick = false;
				else
					TXM.api.track("click", "interaction" ,e.pageX+","+e.pageY); 
			}, 500);
		});
	});
	
	TXM.dispatcher.addEventListenerOnce("ENGAGEMENT_CREDITED", TXM.ui.completion);
	//TXM.params.timeout_id = setTimeout(TXM.ui.completion, TXM.params.current_time*1000);
	
	TXM.params.interval_id = setInterval(function(){
		TXM.params.current_time--;

		if(!TXM.params.current_time)
		{
			console.log("Time reached 0");
			clearInterval(TXM.params.interval_id);
			
			TXM.api.true_attention.time_up = true;
			$(".progress-ring").hide();
			$(".progress-checkmark").show();
			
			if(!TXM.params.credited && TXM.params.interactions)
			{
				TXM.params.credited = true;
				TXM.api.true_attention.completed = true;
				TXM.dispatcher.dispatchEvent("ENGAGEMENT_CREDITED");
				$(".hd-container-header-relevance").addClass("show");
				$(".interact-container, .container-header__timer").addClass("remove");
				
			}
		}
		
		if(TXM.params.current_time >= 10) $(TXM.ui.timeContainer).get(0).innerHTML = TXM.params.current_time;
		else $(TXM.ui.timeContainer).get(0).innerHTML = "0"+TXM.params.current_time;
		
		updateRing();

	}, 1000);

	
	
}

TXM.params = {
	_savedData: "[ ]",
	currentStep: 1,
	current_time: 31,
	interval_id: null,
	timeout_id: null,
	credited: false,
	interactions: 0,
	preventContainerClick: false,
	desktop: true,
	autoplay_with_sound_disabled: true,
	location_json: { postal_code: "12754" }
}

TXM.dispatcher = {
	
	"ENGAGEMENT_STARTED" : new CustomEvent("ENGAGEMENT_STARTED"),
	"ENGAGEMENT_ENDED" : new CustomEvent("ENGAGEMENT_ENDED"),
	"ENGAGEMENT_CREDITED" : new CustomEvent("ENGAGEMENT_CREDITED"),
	"INTERACTIVE_ASSET_READY" : new CustomEvent("INTERACTIVE_ASSET_READY"),
	"ENGAGEMENT_ASSET_LOADING_PROGRESS" : new CustomEvent("ENGAGEMENT_ASSET_LOADING_PROGRESS"),
		
	addEventListenerOnce: function(event,callback){
		var handler = function(e)
			{ 
				console.log(event);
				callback.call();
				document.removeEventListener(event, handler);
			}
		document.addEventListener(event,handler, false);
	},
	
	addEventListener: function(event, callback){
		document.addEventListener(event, callback);
	},
	
	dispatchEvent : function(event, data){
		
		var evt = TXM.dispatcher[event];
		
		if(data){
			evt = new CustomEvent(event, {detail: data})
		}
		
		document.dispatchEvent(evt);
	},
	
	onAssetsReady : function(event){
		//console.log(event.type);
		TXM.dispatcher.dispatchEvent("ENGAGEMENT_STARTED");
	},
	
	onEngagementAssetLoadingProgress: function(event){
		console.log("loading "+Math.round(event.detail*100)+"%");
	}
	
}

TXM.api = {
	
	incrementCurrentStep : function(){
		TXM.api.track("navigation", "next", "step "+TXM.params.currentStep++);
		
		TXM.api.getCurrentStep();
		console.log("CURRENT_STEP: "+TXM.params.currentStep);
	},
	
	setCurrentStep : function(val){
		TXM.api.track("navigation", (val-TXM.params.currentStep == 1)?"next":"goto", "step "+val);
		TXM.params.currentStep = val;
		
		TXM.api.getCurrentStep();
		console.log("CURRENT_STEP: "+TXM.params.currentStep);
	},
	
	getCurrentStep: function() {
		$(TXM.ui.stepContainer).get(0).innerHTML = "Current Step: "+TXM.params.currentStep;
        return TXM.params.currentStep;
    },
	
	track : function(type, label, value){
		TXM.tracker.trackInteraction(type, label, value);
	},
	
	endEngage : function(){
		$(TXM.ui.truex_content).empty();
		TXM.dispatcher.dispatchEvent("ENGAGEMENT_ENDED");
		clearInterval(timer);
	},
	
	saveVoteData: function(category, label, vote){
		var data = "[{\"type\":\"vote\","+"\"vote\":"+vote+",\"label\":\""+label+"\",\"category\":\""+category+"\"}]";
		
		TXM.params._savedData = data;
		console.log(TXM.params._savedData);
	},
	
	/* getVoteSummary : function(){
		
		var ctr;
		var data = [];
		
		for(ctr=1; ctr <= 6; ctr++)
		{
			data.push({category:"1", vote:ctr, vote_count:Math.floor(Math.random() * 500) + 1});	
		}
		
		console.log(data);
		console.log("This creates dummy data for testing purposes. Modify it as you see fit.");
		
		return data;
	}, */
	
	saveCommentData : function(comment, label){
		
		console.log(comment+", "+label);
		
	},
	
	getRecentComments : function(){
		
		var ctr;
		var comments = [];
	
		for(ctr=1; ctr <= 5; ctr++)
		{
			data.push({body:"Lorem ipsum dolor sit amet...", ago:ctr+" minutes ago..."});	
		}
		
		console.log("This creates dummy comments for testing purposes. Modify it as you see fit.");
		
		return comments;
	},
	
	true_attention: {completed: false, one_interaction: false, time_up: false}
}

TXM.tracker = {
	trackInteraction : function(type, label, value){
		
		var markup = "<div class='txm_log'>";
		
		if(type != "initial")
		{
			if(!TXM.params.credited && !TXM.params.current_time)
			{
				TXM.params.credited = true;
				TXM.api.true_attention.completed = true;
				TXM.dispatcher.dispatchEvent("ENGAGEMENT_CREDITED");
			}
		}
		
		if(type != "initial")
			TXM.api.true_attention.one_interaction = true;
		
		if(type != "initial" && type != "click")
			TXM.params.preventAdContainerClick = true;
		
		console.log(type +", "+ label+((value)?", "+value:""));
		
		markup += "<span class='txm_interaction'>&nbsp[Interaction]&nbsp</span>";
		markup += "<span class='txm_step "+((type == "navigation")?"txm_navigation":"")+"'>&nbsp"+TXM.params.currentStep+"&nbsp</span>";
		markup += "<span class='txm_type'>&nbsp"+type+"&nbsp</span>";
		markup += "<span class='txm_label'>&nbsp"+label+"&nbsp</span>";
		
		if(value)
			markup += "<span class='txm_value'>&nbsp"+value+"&nbsp</span>";
		
		markup += "</div>";
		
		TXM.ui.log(markup);
		
	}
}

TXM.ui = {

	truex_content: "#truex_content",
	interactionContainer: "#interaction_count",
	stepContainer: ".current_step",
	timeContainer: ".progress-text",
	logsContainer: "#txm_logs",
	engagement: ".engagement",
	ico_interact: ".hd-container-header-interact",
	
	show : function (val){
		$(TXM.ui.truex_content).append(val);
	},
	
	log: function(val){
		$(TXM.ui.logsContainer).append(val);
	},
	
	completion: function(){
		
		var markup = "<div class='txm_log'>";
		
		markup += "<span class='txm_completion'>[Completion]</span>";
		markup += "<span class='txm_tagdata'>"+TXM.params._savedData+"</span>";
		
		markup += "</div>";
		
		TXM.ui.log(markup);
	}
}

TXM.utils = {
	
	popupWebsite : function(val, end){
	
		var pattern = /^(http(?:s)?\:\/\/[a-zA-Z0-9]+(?:(?:\.|\-)[a-zA-Z0-9]+)+(?:\:\d+)?(?:\/[\w\-]+)*(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
		
		if(pattern.test(val))
			window.open(val, "_blank");
		
		TXM.api.track("external_page", "website", val);
		
		if(end)
			TXM.api.endEngage();
		
	},
	
	shareToFacebook :function(url, title, caption, description, imageUrl){
		TXM.api.track("share", "facebook");
		console.log(url+", "+title+", "+caption+", "+description+", "+imageUrl);
	},
	
	shareToTwitter :function(tweet, url){
		TXM.api.track("share", "twitter");
		console.log(tweet+", "+url);
	},
	
	shareToPinterest :function(url, description, imageUrl){
		TXM.api.track("share", "pinterest");
		console.log(url+", "+description+", "+imageUrl);
	},
	
	loadExternalTracking : function(url){
		var markup = "<div class='txm_log'>";
		
		markup += "<span class='txm_tag'>[Tag]</span>";
		markup += "<span class='txm_tagdata'>"+url+"</span>";
		
		markup += "</div>";
		
		TXM.ui.log(markup);
		console.log(url);
	},
	
	loadExternalScript : function(url){
		
		var markup = "<div class='txm_log'>";
		
		markup += "<span class='txm_tag'>[Tag]</span>";
		markup += "<span class='txm_tagdata'>"+url+"</span>";
		
		markup += "</div>";
		
		TXM.ui.log(markup);
		console.log(url);
	},
	
	timeSpent : function(){
		return timeSpent*1000;
	}
	
}

function polyfillCustomEvent(){
	
	if ( typeof window.CustomEvent === "function" ) return false;
	
	 CustomEvent.prototype = window.Event.prototype;
	
	 function CustomEvent ( event, params ) {
			
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	
	}
	
	 window.CustomEvent = CustomEvent;
}



/* Timer Ring */
const circle = document.querySelector('.progress-ring-circle');
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

// Initial setup
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;
circle.style.transition = 'stroke-dashoffset 1s linear';

// Update function — call in your draw() or animation loop
function updateRing() {
	var per = TXM.params.current_time / 30; // 30 → 0
	per = Math.min(Math.max(per, 0), 1); // clamp between 0 and 1

	// Reverse percent for countdown fill-up
	let reversed = 1 - per;
	circle.style.strokeDashoffset = circumference * (1 - reversed); 
	// or just: circle.style.strokeDashoffset = circumference * per;
}


TXM.init();