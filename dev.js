var canvas, stage, exportRoot, anim_container, dom_overlay_container, comp, fnStartAnimation;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var stageWidth = 820;
var stageHeight = 570;
var startX, startY, stageScale;

dragNames = new Array(
	"Atrial cells",
"Decreased sodium reabsorption",
"Decreased blood volume",
"Angiotensin II",
"Increased water reabsorption",
"Collecting ducts",
" Hypothalamic cells ",
"Hormonal negative feedback loops");

var dragNamesForTab = new Array();
var placeNamesForTab = new Array();
var hintForTab = new Array();

var it = [];
var hints = new Array(1, 0, 0, 0, 0, 1, 1, 0);


var placeNum = 7;

var dragCont = new Array();
var placeCont = new Array();
//var dragContF = new Array();

var dragXY = [];
var placeXY = [];

var allDragCont = new Array();

var ansNum;
var drag;
var newDrag;
var loadingComplete = false;
var currentTween;
var currentPlace;
var currentHint;

var navBtnArray = ["submitF", "resetF", "showF", "printF"];
var canvasBtnArray = ["submit_btn", "reset_btn", "showAll_btn", "print_btn"];
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function init() {
	canvas = document.getElementById("canvas");
	anim_container = document.getElementById("animation_container");
	dom_overlay_container = document.getElementById("dom_overlay_container");
	var comp=AdobeAn.getComposition("BC15243C7AE14A41AC7976E667750435");
	var lib=comp.getLibrary();
	var loader = new createjs.LoadQueue(false);
	loader.addEventListener("fileload", function(evt){handleFileLoad(evt,comp)});
	loader.addEventListener("complete", function(evt){handleComplete(evt,comp)});
	var lib=comp.getLibrary();
	loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
	var images=comp.getImages();	
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }	
}
function handleComplete(evt,comp) {
	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
	var lib=comp.getLibrary();
	var ss=comp.getSpriteSheet();
	var queue = evt.target;
	var ssMetadata = lib.ssMetadata;
	for(i=0; i<ssMetadata.length; i++) {
		ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
	}
	var preloaderDiv = document.getElementById("_preload_div_");
	preloaderDiv.style.display = 'none';
	canvas.style.display = 'block';
	exportRoot = new lib.content();
	stage = new lib.Stage(canvas);
	stage.enableMouseOver();	
	//Registers the "tick" event listener.
	fnStartAnimation = function() {
		stage.addChild(exportRoot);
		createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.addEventListener("tick", stage);
	}	    
	//Code to support hidpi screens and responsive scaling.
	AdobeAn.makeResponsive(true,'both',true,1,[canvas,preloaderDiv,anim_container,dom_overlay_container]);	
	AdobeAn.compositionLoaded(lib.properties.id);
	fnStartAnimation();

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	exportRoot.hint_mc.backGroundH.cursor = "default";
	exportRoot.reset_btn.addEventListener("click", reset);
	exportRoot.submit_btn.addEventListener("click", submit);
	exportRoot.showAll_btn.addEventListener("click", showAll);
	exportRoot.print_btn.addEventListener("click", printF);
	exportRoot.rbutton.addEventListener("click", switchF); 
	exportRoot.rbutton.cursor = "pointer";
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	for (let i = 0; i <= placeNum; i++) {
		dragXY.push({ xD: exportRoot["drag" + i].x, yD: exportRoot["drag" + i].y });
    placeXY.push({ xP: exportRoot["place" + i].x, yP: exportRoot["place" + i].y });
	  }

	
	reset();

}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function indexList1() {
    document.getElementById("instraction").tabIndex = "-1";
	//document.getElementById("dragFocus").tabIndex = "-1";
	document.getElementById("hints_group").tabIndex = "-1";
	document.getElementById("keepF").tabIndex = "-1";
	if(exportRoot.submit_btn.alpha === 0.5) {
		document.getElementById("submitF").tabIndex = "-1";
	}
	if(exportRoot.reset_btn.alpha === 0.5) {
		document.getElementById("resetF").tabIndex = "-1";
	}
	if(exportRoot.showAll_btn.alpha === 0.5) {
		document.getElementById("showF").tabIndex = "-1";
	}
	if(exportRoot.print_btn.alpha === 0.5) {
		document.getElementById("printF").tabIndex = "-1";
	}
}

function indexList0() {
    document.getElementById("instraction").tabIndex = "0";
	document.getElementById("dragFocus").tabIndex = "0";
	document.getElementById("hints_group").tabIndex = "0";
	document.getElementById("keepF").tabIndex = "0";
	
}

function showHint(evt) {
    blurAll();
	let hintFrame = Number(evt.currentTarget.name.substr(4,evt.currentTarget.name.length));

	exportRoot.hint_mc.gotoAndStop(hintFrame + 1);
	exportRoot.hint_mc.return_btn.addEventListener("click", closeHint);
	stage.addChild(exportRoot.hint_mc);
	document.getElementById("hintClose").tabIndex = "1";
	indexList1();
}

function closeHint(evt) {
	blurAll();
	exportRoot.hint_mc.gotoAndStop(0);
	stage.removeChild(exportRoot.hint_mc);
	indexList0();
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


function newSet() {

	//exportRoot.submit_btn.alpha = 0.5;
	exportRoot.reset_btn.alpha = 0.5;

	//exportRoot.submit_btn.mouseEnabled = false;
	exportRoot.reset_btn.mouseEnabled = false;

	ansNum = placeNum+1;
	it.length = 0;
	dragNamesForTab.length = 0;
	placeNamesForTab.length = 0;
	hintForTab.length = 0;

	for (let i = 0; i < dragNames.length; i++) {

		it.push(i);

	}

	let labNum = it.length;
	for (let i = 0; i <= labNum; i++) {
		r1 = Math.round((Math.random() * (labNum - 1)));
		r2 = Math.round((Math.random() * (labNum - 1)));

		tmp = it[r1];
		it[r1] = it[r2];
		it[r2] = tmp;
	}

	let hintCounter = 0;

	for (let i = 0; i < dragNames.length; i++) {

		dragNamesForTab.push({ id: "drag" + i, name: "d" + i, ind: "-1", alt: dragNames[it[i]]});

		if (hints[it[i]] == 1) {

			hintForTab.push({ id: "hint" + i, name: "h" + hintCounter, ind: "0", alt: "hint for" + " " + dragNames[it[i]]});

			hintCounter++;
		}

		placeNamesForTab.push({ id: "place" + i, ind: "-1", alt: "place for drag and drop" });

	}
	

}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $timeout) {
	$timeout(function () {
	$scope.hintsArr = hintForTab;
	$scope.places = placeNamesForTab;
	$scope.dragArr = dragNamesForTab;
}, 1000);
 
	$scope.dragGroup = function (event) {		
		if(event.keyCode =='13'){
			
		if (document.activeElement.id === "dragFocus") {
			for (let i = 0; i <= placeNum; i++) {
				
				if (!exportRoot["drag" + i].onPlace) {
                 
					//document.getElementById("drag" + i).tabIndex = "0";
					document.getElementById("drag" + i).focus();
					break;
				}
			}
			document.getElementById("instraction").tabIndex = "-1";
		}
	  }
	}


	$scope.hintsGroup = function () {	
		if(event.keyCode =='13'){	
		if (document.activeElement.id === "hints_group") {
			document.getElementById(hintForTab[0].id).focus();
		}
	}
}
	$scope.hintOpen = function (event) {
	
		let currElement;
		
		if(event.keyCode =='13'){	
		for (let i = 0; i < hintForTab.length; i++) {
			document.getElementById(hintForTab[i].id).tabIndex = "-1";
		}
		currentHint = event.target;
		let hintFrame = Number(event.target.id.substr(4,event.target.id.length));	

		exportRoot.hint_mc.gotoAndStop(it[hintFrame] + 1);
		exportRoot.hint_mc.return_btn.addEventListener("click", closeHint);
		stage.addChild(exportRoot.hint_mc);

		document.getElementById("hintClose").tabIndex = "0";
		document.getElementById("hintClose").focus();
		indexList1();
	  }
	  
	 
	  currElement = document.activeElement.id;
	  

	   for (let i = 0; i <hintForTab.length; i++) {
	   if(hintForTab[i].id==currElement)currElement = i;
	}
      
	  if (event.keyCode == '38') {
        for (let i = currElement - 1; i >= 0; i--) {
			document.getElementById(hintForTab[i].id).focus();
			break;
		}
	  }
	 
	  if (event.keyCode == '40' ) {
		
		
		for (let i = currElement + 1; i < hintForTab.length; i++) {
			document.getElementById(hintForTab[i].id).focus();
			break;
		}
	}
	}

	$scope.closeHintA = function (event) {
		
		if (event.keyCode == '13') {
		exportRoot.hint_mc.gotoAndStop(0);

		for (let i = 0; i < hintForTab.length; i++) {
			document.getElementById(hintForTab[i].id).tabIndex = 0;
			break;
		}

		currentHint.focus();

		document.getElementById("hintClose").tabIndex = "-1";
        indexList0();
		}
}

	$scope.dragDrop = function (event) {

let currElement;

		if(event.keyCode =='13'){
		if (document.activeElement.id.substr(0, 2) === "pl") {


			currentPlace = exportRoot[document.activeElement.id];
			tweenDrag();
		}
		if (document.activeElement.id.substr(0, 4) === "drag") {

			currentTween = exportRoot[document.activeElement.id];

			dragtoPlace();

		}
	  }
      if (event.keyCode == '38') {
		if (document.activeElement.id.substr(0, 4) === "drag") {
			currElement = Number(document.activeElement.id.substr(4, document.activeElement.id.length));
		
			for (let i = currElement - 1; i >= 0; i--) {
			if (exportRoot["drag" + i].onPlace === false) {
			  document.getElementById("drag" + i).focus();
			  break;
		  }

		}
	  }
      if (document.activeElement.id.substr(0, 5) === "place") {
		currElement = Number(document.activeElement.id.substr(5, document.activeElement.id.length));
		  for (let i = currElement - 1; i >= 0; i--) {
			if (!exportRoot["place" + i].occup) {
			  document.getElementById("place" + i).focus();
			  break;
			  
			}
		  }
		}


	 }
	  if (event.keyCode == '40' ) {
		
		if (document.activeElement.id.substr(0, 4) === "drag") {
			currElement = Number(document.activeElement.id.substr(4, document.activeElement.id.length));
			for (let i = currElement +1; i <= placeNum; i++) {
				
				if (exportRoot["drag" + i].onPlace === false) {
				  document.getElementById("drag" + i).focus();
				  break;
				}
			  }
			
		}
		if (document.activeElement.id.substr(0, 5) === "place") {
			currElement = Number(document.activeElement.id.substr(5, document.activeElement.id.length));
			for (let i = currElement+1; i <= placeNum; i++) {
				if (!exportRoot["place" +i].occup) {
				  document.getElementById("place" + i ).focus();
				  break;
				}
			  }
		
		}
	 }

	}


	$scope.submitFunc = function (event) {
		if (event.keyCode == '13') {
			navGFocus();
		submit();
		}

		if (event.keyCode == '38') {
			navButtonUp();
		}

		if (event.keyCode == '40') {
			navButtonDown();
		}
	}

	$scope.resetFunc = function (event) {
		if (event.keyCode == '13') {
			navGFocus();
		reset();
		}
		if (event.keyCode == '38') {
			navButtonUp();
			}
			if (event.keyCode == '40') {
				navButtonDown();
				}

	}

	$scope.showAllFunc = function (event) {
		if (event.keyCode == '13') {
			navGFocus();
		showAll();
		}
		if (event.keyCode == '38') {
			navButtonUp();
			}
			if (event.keyCode == '40') {
				navButtonDown();
				}


	}

	$scope.printFunc = function (event) {
		if (event.keyCode == '13') {
			navGFocus();
		printF();
		}
		if (event.keyCode == '38') {
			navButtonUp();
			}
			if (event.keyCode == '40') {
				navButtonDown();
				}
	
	}
	
	$scope.switchFunc = function () {
		switchF();
		if (event.keyCode == '38') {
			navButtonUp();
			}
			if (event.keyCode == '40') {
				navButtonDown();
				}

	}

	$scope.navGroup = function (event) {
		let a = true;
		if (event.keyCode == '13' ) { 
		if (event.target.id === "navigationF") {

		  switch (a) {
			case exportRoot.submit_btn.mouseEnabled:
			//  document.getElementById("submitF").tabIndex = "0";
			  document.getElementById("submitF").focus();
			  break;
	
			case exportRoot.reset_btn.mouseEnabled:
			 // document.getElementById("resetF").tabIndex = "0";
			 document.getElementById("resetF").focus();
	
			  break;
	
			case exportRoot.showAll_btn.mouseEnabled:
			 // document.getElementById("showF").tabIndex = "0";
			  document.getElementById("showF").focus();
			  break;
	
			case exportRoot.print_btn.mouseEnabled:
			//  document.getElementById("printF").tabIndex = "0";
			 document.getElementById("printF").focus();
			  break;
		  }
		}
	  }
	
	
	
	
	}
});


function navGFocus(){
	document.getElementById("navigationF").focus();
	document.getElementById("resetF").tabIndex = "-1";
	document.getElementById("showF").tabIndex = "-1";
	document.getElementById("printF").tabIndex = "-1";
	document.getElementById("submitF").tabIndex = "-1";

}

function navButtonUp(){
      let currElement;
	for (let i = 0; i < navBtnArray.length; i++) {
		if (navBtnArray[i] === document.activeElement.id) {

		  currElement = i;
		  break;
		}
	  }

for (let i = currElement - 1; i >= 0; i--) {
	if (exportRoot[canvasBtnArray[i]].mouseEnabled) {
		document.getElementById(navBtnArray[i]).index = "0";
	  document.getElementById(navBtnArray[i]).focus();
	  document.getElementById(navBtnArray[currElement]).index = "-1";
	  break;
	}
   }
  }


  function navButtonDown(){
	let currElement;
	for (let i = 0; i < navBtnArray.length; i++) {
		if (navBtnArray[i] === document.activeElement.id) {

		  currElement = i;
		  break;
		}
	  }
	  for (let i = currElement +1; i < navBtnArray.length; i++) {
		
		if (exportRoot[canvasBtnArray[i]].mouseEnabled) {
			document.getElementById(navBtnArray[i]).index = "0";
		  document.getElementById(navBtnArray[i]).focus();
		  document.getElementById(navBtnArray[currElement]).index = "-1";
		  break;
		}

	}
  }

function dragtoPlace() {

	exportRoot[document.activeElement.id].gotoAndStop(0);
	yellowDrag = exportRoot[document.activeElement.id].dragFrame;
    
	for (let i = 0; i <= placeNum; i++) {
		document.getElementById("drag" + i).tabIndex = "-1";
        document.getElementById("drag" + i).blur();
	}
	yellowDrag.gotoAndStop(1);

	for (let i = 0; i <= placeNum; i++) {

		if (!exportRoot["place" + i].occup) {
			//exportRoot["place" + i].occup = true;
			document.getElementById("place" + i).tabIndex = "0";
			document.getElementById("place" + i).focus();
			break;
		}

	}


}

function tweenDrag() {
	let a = currentTween.name;
	currentPlace.occup = true;
	
	newDrag = currentTween;
	exportRoot.addChild(newDrag);
	//newDrag.x = currentTween.x;
	//newDrag.y = currentTween.y;
	newDrag.txt.text = dragNames[a];
	if (newDrag.txt.getMeasuredHeight() < 20) {
		newDrag.txt.y = -5;
	}


	createjs.Tween.get(newDrag)
		.to({ x: currentPlace.x, y: currentPlace.y }, 200, createjs.Ease.get(1))
		.call(onComplete);

}

function onComplete() {

	dragCont.push(newDrag);
    allDragCont.push(newDrag); 
        exportRoot.submit_btn.mouseEnabled = true;
		exportRoot.submit_btn.alpha = 1;
		ansNum--;
	placeCont.push(currentPlace);

	for (let i = 0; i <= placeNum; i++) {
		document.getElementById("place" + i).tabIndex = "-1";
		document.getElementById("drag" + i).tabIndex = "-1";
		
	  }

	  document.getElementById("dragFocus").focus();
  currentTween.onPlace = true;
  currentPlace.occup = true;
 
	yellowDrag.gotoAndStop(0);   


	//______________________________________
	exportRoot.submit_btn.alpha = 1;
	exportRoot.submit_btn.mouseEnabled = true;
	
}



function drawFrame() {
	let element = event.currentTarget.id;
	if(document.activeElement.id != "aInstr"){
        exportRoot[element].gotoAndStop(1);
	}


	if(document.activeElement.id === "aInstr"){
		for (let i = 0; i < hintForTab.length; i++) {
			document.getElementById(hintForTab[i].id).tabIndex = "-1";
			break;
		}
	}

	if(element === "dragFocus" || element === "hints_group"){
		for (let i = 0; i <= placeNum; i++) {
			exportRoot["drag" + i].dragFrame.gotoAndStop(0);
			document.getElementById("place" + i).tabIndex = "-1";
			
		}
	}

}

function clearFrame(event) {
	let elementBlur = event.target.id;
	if(document.activeElement.id != "aInstr"){
	exportRoot[elementBlur].gotoAndStop(0);
    }

}




function drawCloseFrame() {
	
	exportRoot.hint_mc.return_btn.gotoAndStop(1);
}

function clearCloseFrame(event) {

	exportRoot.hint_mc.return_btn.gotoAndStop(0);
}


function clearPlaceFrame(event) {
	let elementBlur = event.target.id;
	exportRoot[elementBlur].frame.gotoAndStop(0);
}



function drawReplayFrame() {
	exportRoot.replay.rFrame.gotoAndStop(1);
}

function clearReplayFrame(event) {
	exportRoot.replay.rFrame.gotoAndStop(0);
}


function switchF() {
	blurAll();
      if(exportRoot.rbutton.currentFrame === 0){
		exportRoot.rbutton.gotoAndStop(1); 
	
	  }else{
		exportRoot.rbutton.gotoAndStop(0); 

	  }

	}

function printF(){
	blurAll();
	window.print();
}

function showAll(){
	exportRoot.show_mc.gotoAndStop(0);
	blurAll();
	for (let i = 0; i <= placeNum; i++) {
		exportRoot["drag" +i].x  = exportRoot["place" +it[i]].x;
		exportRoot["drag" +i].y  = exportRoot["place" +it[i]].y;
		exportRoot["drag" +i].mouseEnabled = false;
	}
	exportRoot.showAll_btn.alpha = 0.5;
	exportRoot.showAll_btn.mouseEnabled = false;

	exportRoot.submit_btn.alpha = 0.5;
    exportRoot.submit_btn.mouseEnabled = false;

	exportRoot.reset_btn.alpha = 1;
	exportRoot.reset_btn.mouseEnabled = true;
	document.getElementById("dragFocus").tabIndex = "-1";
}


function reset() {
	blurAll();
	document.getElementById("dragFocus").tabIndex = "0";
	exportRoot.showAll_btn.alpha = 0.5;
	exportRoot.showAll_btn.mouseEnabled = false;
	exportRoot.reset_btn.alpha = 0.5;
	exportRoot.reset_btn.mouseEnabled = false;

	exportRoot.submit_btn.alpha = 1;
	exportRoot.submit_btn.mouseEnabled = true;

	exportRoot.print_btn.alpha = 0.5;
	exportRoot.print_btn.mouseEnabled = false;

	newSet();
	document.getElementById("submitF").tabIndex = "-1";
	document.getElementById("resetF").tabIndex = "-1";
	//placeXY.length = 0;
	//dragXY.length = 0;

	for (let i = 0; i < dragNames.length; i++) {
		//exportRoot.removeChild(dragContF[i]);
		exportRoot["drag" + i].mouseEnabled = true;
		exportRoot["drag" + i].addEventListener("mousedown", startDrag);
		if (exportRoot["place" + i].currentFrame != 0) exportRoot["place" + i].gotoAndStop(0);
		exportRoot["place" + i].name = i;
		if (exportRoot["drag" + i].currentFrame != 0) exportRoot["drag" + i].gotoAndStop(0);
		exportRoot["drag" + i].currentFrame = 0;
		exportRoot["drag" + i].alpha = 1;
		exportRoot["place" + i].occup = false;
        exportRoot["drag" + i].onPlace = false;
	}
	//dragContF.length = 0;
	

	for (let i = 0; i < dragNames.length; i++) {
		exportRoot["drag" + i].txt.y = -11.35;
		exportRoot["drag" + i].txt.text = "";
		exportRoot["drag" + i].txt.textAlign = "center";
		exportRoot["drag" + i].txt.textBaseline = "top";
		exportRoot["drag" + i].txt.text = dragNames[it[i]];

		exportRoot.drags_mc["drag" + i].txt.y = -11.35;
		exportRoot.drags_mc["drag" + i].txt.text = "";
		exportRoot.drags_mc["drag" + i].txt.textAlign = "center";
		exportRoot.drags_mc["drag" + i].txt.textBaseline = "top";
		exportRoot.drags_mc["drag" + i].txt.text = dragNames[it[i]];


		exportRoot["drag" + i].name = it[i];
		exportRoot["drag" + i].order = i;

        exportRoot["drag" + i].x= dragXY[i].xD;
		exportRoot["drag" + i].y= dragXY[i].yD;


		if (exportRoot["drag" + i].txt.getMeasuredHeight() < 20) {
			exportRoot["drag" + i].txt.y = -5;
			exportRoot.drags_mc["drag" + i].txt.y = -5;
		}

		exportRoot["hint" + i].name = "hint" + it[i];
		exportRoot["hint" + i].visible = hints[it[i]];
		exportRoot["hint" + i].addEventListener("click", showHint);

	}
    
	document.getElementById("showFrame").innerHTML= "";
	if(exportRoot.show_mc.currentFrame !=0)exportRoot.show_mc.gotoAndStop(0);
	document.getElementById("showFrame").tabIndex = "-1";

	firstTime = false;

}

function submit() {
	blurAll();
	//document.getElementById("submitF").tabIndex = "-1";
//	exportRoot.submit_btn.alpha = 0.5;
	//exportRoot.submit_btn.mouseEnabled = false;
	//exportRoot.printF.mouseEnabled = false;

	exportRoot.print_btn.alpha = 1;
	exportRoot.print_btn.mouseEnabled = true;
	document.getElementById("printF").tabIndex = "0";
	
	exportRoot.showAll_btn.alpha = 1;
	exportRoot.showAll_btn.mouseEnabled = true;
	document.getElementById("showF").tabIndex = "0";
	
	exportRoot.reset_btn.alpha = 1;
	exportRoot.reset_btn.mouseEnabled = true;
    document.getElementById("resetF").tabIndex = "0";

	document.getElementById("dragFocus").tabIndex = "0";
	for (let k = 0; k < placeCont.length; k++) {

		if (dragCont[k].name != placeCont[k].name) {
			ansNum++;
			
		}
	}

if(exportRoot.rbutton.currentFrame === 0){
	allDragCont.length = 0;
	  for (let k = 0; k < placeCont.length; k++) {

		if (dragCont[k].name != placeCont[k].name) {
			dragCont[k].x= dragXY[dragCont[k].order].xD;
			dragCont[k].y= dragXY[dragCont[k].order].yD;
            dragCont[k].onPlace = false;

			for (var j = 0; j <= placeNum; j++) {
				if (placeCont[k].name === exportRoot["place" + j].name) {
					exportRoot["place" + j].occup = false;

				}

			}

		} else {
            dragCont[k].mouseEnabled = false;
			allDragCont.push(dragCont[k]);
		}

	}

	placeCont.length = 0;
	dragCont.length = 0;
	if (ansNum === 0) {
		exportRoot.show_mc.gotoAndStop(2);
		exportRoot.reset_btn.alpha = 1;
		exportRoot.reset_btn.mouseEnabled = true;
		document.getElementById("resetF").tabIndex = "0";
		document.getElementById("showFrame").innerHTML= "Excellent! You've got it right!"; 
	} else {
		exportRoot.show_mc.gotoAndStop(1);
		document.getElementById("showFrame").innerHTML= "That's incorrect! Try again! Click Continue to proceed with the activity.";

	}
	document.getElementById("showFrame").tabIndex = "0";
}else{

	if (ansNum != 0) {
	for (let i = 0; i <= placeNum; i++) {

			exportRoot["drag" + i].addEventListener("mousedown", startDrag);
			exportRoot["drag" + i].addEventListener("pressmove", pressMoveDrag);
			exportRoot["drag" + i].x= dragXY[i].xD;
			exportRoot["drag" + i].y= dragXY[i].yD;
			exportRoot["place" + i].occup = false;
			exportRoot["drag" + i].onPlace = false;
			exportRoot["drag" + i].mouseEnabled = true;
	}
	ansNum = placeNum+1;
	placeCont.length = 0;
	dragCont.length = 0;
	allDragCont.length = 0;
	exportRoot.show_mc.gotoAndStop(1);
 document.getElementById("showFrame").innerHTML= "That's incorrect! Try again! Click Continue to proceed with the activity.";


}else{
        exportRoot.show_mc.gotoAndStop(2);
		exportRoot.reset_btn.alpha = 1;
		exportRoot.reset_btn.mouseEnabled = true;
		document.getElementById("resetF").tabIndex = "0";
		document.getElementById("showFrame").innerHTML= "Excellent! You've got it right!"; 
		for (let i = 0; i <= placeNum; i++) {
            exportRoot["drag" + i].mouseEnabled = false;
		}


}

}

}



function startDrag(evt) {
	blurAll();
	evt.nativeEvent.preventDefault();
	//if(newDrag != undefined)exportRoot.removeChild(newDrag);
	newDrag = evt.currentTarget;
/*	var a = drag.name;
	var lib = comp.getLibrary();
	newDrag = new lib.drag_mc();

	exportRoot.addChild(newDrag).name = a;
  
	newDrag.txt.text = dragNames[a];
	if (newDrag.txt.getMeasuredHeight() < 20) {
		newDrag.txt.y = -5;
	}
*/
	startX = newDrag.x;
	startY = newDrag.y;
	if(newDrag.dragFrame.currentFrame !=0) newDrag.dragFrame.gotoAndStop(0);

	//var p = evt.currentTarget.parent.globalToLocal(stage.mouseX, stage.mouseY);

	//newDrag.x = p.x;
	//newDrag.y = p.y;
	

	exportRoot.addChild(evt.currentTarget);
	newDrag.addEventListener("pressmove", pressMoveDrag);
	newDrag.addEventListener("pressup", pressUpDrag);

	for (let k = 0; k <= placeNum; k++) {
		var p = exportRoot["place" + k].globalToLocal(stage.mouseX, stage.mouseY);
        if (exportRoot["place" + k].hitTest(p.x, p.y)) {
			exportRoot["place" + k].occup = false;
			ansNum++;
			for (let i = 0; i <= placeCont.length; i++) {
				if(placeCont[i] === exportRoot["place" + k]){
					placeCont.splice(i,1);
				}
			}
			for (let i = 0; i <= dragCont.length; i++) {
				if(dragCont[i] === evt.currentTarget){
					dragCont.splice(i,1);
				}
			}
			for (let i = 0; i <= allDragCont.length; i++) {
				if(allDragCont[i] === evt.currentTarget){
					allDragCont.splice(i,1);
				}
			}
		}
	}
}


function pressMoveDrag(evt) {
	evt.nativeEvent.preventDefault();

	var p = evt.currentTarget.parent.globalToLocal(stage.mouseX, stage.mouseY);

	evt.currentTarget.x = p.x;
	evt.currentTarget.y = p.y;
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  

	for (var k = 0; k <= placeNum; k++) {
		var pt = exportRoot["place" + k].globalToLocal(stage.mouseX, stage.mouseY);

		if (exportRoot["place" + k].hitTest(pt.x, pt.y)) {
			exportRoot["place" + k].gotoAndStop(2);

		} else {
			exportRoot["place" + k].gotoAndStop(0);
            //exportRoot["place" + k].occup = false;
		}
	}

}


function pressUpDrag(evt) {
	evt.nativeEvent.preventDefault();
	exportRoot.submit_btn.alpha = 1;
	exportRoot.submit_btn.mouseEnabled = true;
	
	var correct = false;

	for (let k = 0; k <= placeNum; k++) {

		var pt = exportRoot["place" + k].globalToLocal(stage.mouseX, stage.mouseY);
		if (newDrag.hitTest(pt.x, pt.y)) {
            
			if (exportRoot["place" + k].occup) {				
				correct = true;
				newDrag.x = dragXY[newDrag.order].xD;
		        newDrag.y = dragXY[newDrag.order].yD;
				exportRoot["drag" + k].onPlace = false;
				break;
			}

			newDrag.x = exportRoot["place" + k].x;
			newDrag.y = exportRoot["place" + k].y;
			newDrag.onPlace = true;
			dragCont.push(newDrag);
			allDragCont.push(newDrag); 
			
			placeCont.push(exportRoot["place" + k]);

			//_____________________________________________________


			ansNum--;

			correct = true;
			exportRoot["place" + k].occup = true;
			
			exportRoot["place" + k].gotoAndStop(0);
			//drag.removeEventListener("mousedown", startDrag);
			//drag.removeEventListener("pressmove", pressMoveDrag);
			//drag.alpha = 0.5;
			evt.remove();


			if (ansNum == 0) {
				exportRoot.submit_btn.mouseEnabled = true;
				exportRoot.submit_btn.alpha = 1;
				document.getElementById("submitF").tabIndex = "0";
				//document.getElementById("submitF").focus();
				document.getElementById("dragFocus").tabIndex = "-1";
				
				//for (let i = 0; i <= placeNum; i++) {
					//document.getElementById("place" + i).tabIndex = "-1";
					//document.getElementById("drag" + i).tabIndex = "-1";
			 //}
                
			}

			return;
		}

	}

	if (!correct) {

		newDrag.x = dragXY[newDrag.order].xD;
		newDrag.y = dragXY[newDrag.order].yD;
        newDrag.onPlace = false;
		for (var k = 0; k <= placeNum; k++) {
			exportRoot["place" + k].gotoAndStop(0);
		}

	}

}

function blurAll(){
	document.activeElement.blur();	
	document.getElementById("showFrame").tabIndex = "-1";
	for (var k = 0; k <= placeNum; k++) {
		exportRoot["drag" + k].dragFrame.gotoAndStop(0);
	}
}


