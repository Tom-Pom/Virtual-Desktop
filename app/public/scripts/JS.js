var alertFallback = false;
if (typeof console === "undefined" || typeof console.log === "undefined") {
	console = {};
	if (alertFallback) {
		console.log = function(msg) {
			alert(msg);
		};
	} else {
		console.log = function() {};
	}
}

// console.log("document.URL : "+document.URL);
// console.log("document.location.href : "+document.location.href);
// console.log("document.location.origin : "+document.location.origin);
// console.log("document.location.hostname : "+document.location.hostname);
// console.log("document.location.host : "+document.location.host);
// console.log("document.location.pathname : "+document.location.pathname);

var idDivContent = 0;
var topDivContent =null;
var templateExplorer = null;
var templateStat = null;
var templateEtab = null;
var divWaiter = $("#waiter");
var meter = divWaiter.children(".meter").children("span");
var percentMeter = divWaiter.children(".meter").children("h3").children("text");
divWaiter.draggable();
var meterObject =
{
	uStep:0,
	curent:0,
	init:function(pTotal){
		divWaiter.css("display","block");
		meter.css("width","0%");
		this.curent=0;
		this.uStep=100/pTotal;
		percentMeter.html((this.curent+"").substring(0,2)+"%")
	},
	step:function(){
		this.curent+=this.uStep;
		meter.css("width",this.curent+"%");
		percentMeter.html((this.curent+"").substring(0,2)+"%")
		if (this.curent>=100){
			divWaiter.css("display","none");
		}
	}
}


getData("/xslt/explorer.xsl",{},undefined,function(xslResponse){
	templateExplorer=xslResponse.responseXML;
	console.log("Template explo chargée");
});
getData("/xslt/statTemplate2.xsl",{},undefined,function(xslResponse){
	templateStat=xslResponse.responseXML;
	console.log("Template stat chargée");
});

getData("/xslt/etablissement.xsl",{},undefined,function(xslResponse){
	templateEtab=xslResponse.responseXML;
	console.log("Template etablissement chargée");
});
function divContentTopIndex(sender)
{
	topDivContent=sender;
	$( ".divContent" ).css("z-index",500);
	sender.parent().css("z-index",600);	
}

$(document).on('keyup',function(evt) {
	if (evt.keyCode == 27) {
		topDivContent.remove();
	}
});
$(".divFrame").mousedown(divContentTopIndex);
$(".appicon").click(function()
{
	var decalage = 60+(idDivContent*10)%100;
	var divContent = $( "#divContent" ).clone().appendTo( "#content" ).attr("id","divContent" +idDivContent).css("display","block").css("position","absolute")
	.css("top",decalage+"px").css("left",decalage+"px").draggable({
		handle:".divFrame>nav"
	}).resizable().click(function()
	{
		$( ".divContent" ).css("z-index",500);
		$(this).css("z-index",600);
	});



	divContentTopIndex(divContent);

	var tailleAdapter = idDivContent%10;
	if ($(this).attr("id")=="linkMap") 
	{
		divContent.css("width",90-tailleAdapter/2+"vw").css("height",80-tailleAdapter+"vh");
		initMap(divContent.find(".divFrame"));
	}
	if ($(this).attr("id")=="linkExplorer") 
	{
		divContent.css("width",90-tailleAdapter/2+"vw").css("height",80-tailleAdapter+"vh");
		initDataExplorer(divContent.find(".divFrame"));
	}
	if ($(this).attr("id")=="linkStatistic") 
	{
		divContent.css("width",90-tailleAdapter/2+"vw").css("height",80-tailleAdapter+"vh");
		initStatistic(divContent.find(".divFrame"));
	}
	idDivContent++;
});
function initMap(divFrame) {
	if(divFrame==undefined)divFrame=$('#content');
	var map = document.createElement('div');
	map.className = 'map';
	divFrame[0].appendChild(map);
	map = new google.maps.Map(map, {
		center: {lat: 48.8534100, lng: 2.3488000},
		zoom: 6
	});
	getData("/xmlData",{"queryName":"NOM_LAT_LON"},map,placeAllPointsOn);
}

var groupes = {
	"type":"Type"
	,"statut":"Statut"
	,"tutelle":"Tutelle"
	,"region":"Région"
	,"universite":"Université"
	,"academie":"Académie"
	,"commune":"Commune"
	,"nom":"Nom"
	,"sigle":"Sigle"
	,"cp":"Code Postal"
}
var ordres = {
	"UAI":"UAI",
	"type":"Type",
	"nom":"Nom",
	"sigle":"Sigle",
	"statut":"Statut",
	"tutelle":"Tutelle",
	"universite":"Université",
	"cp":"Code Postal",
	"commune":"Commune",
	"departement":"Département",
	"academie":"Académie",
	"region":"Région",
	"longitude_X":"Longitude",
	"latitude_Y":"Latittude"
}
function initDataExplorer(divFrame)
{
	divFrame.append("<div class='form-group' ><div class='container'><table><tr><td><label>Grouper les établissement par..</label><select class='selectDataClassement form-control'></select></td>"
		+"<td><label>Ordonner les résultats par..</label><select class='selectDataOrder form-control'></select></td></tr></table></div></div>");

	var selectDataClassement =  divFrame.find(".selectDataClassement");
	var selectDataOrder =  divFrame.find(".selectDataOrder");

	
	for (var k in groupes){
		selectDataClassement.append($('<option>', {
			value: k,
			text: groupes[k]
		}));
	}
	for (var k in ordres){
		selectDataOrder.append($('<option>', {
			value: k,
			text: ordres[k]
		}));
	}
	xsltreceiver= document.createElement("div");
	xsltreceiver.className ="xsltReceiver";
	xsltreceiver.id="xsltReceiver"+idDivContent;
	divFrame.append(xsltreceiver);
	var changeEvent= function()
	{
		majDataExplorer(xsltreceiver,selectDataClassement.val(),selectDataOrder.val());
	}
	selectDataClassement.change(changeEvent);
	selectDataOrder.change(changeEvent);
	changeEvent();
}

function majDataExplorer(xsltreceiver,groupby,orderby)
{
	getData("/xmlData",{"queryName":"UAI_NOM_GROUP","groupeEtab":groupby,"ordreEtab":orderby},xsltreceiver,function(xmlResponse,xsltreceiver)
	{
		writeXML(xsltreceiver,templateExplorer,xmlResponse.responseXML,true)
		});
}
function initStatistic(divFrame)
{
	divFrame.append('<div class="container" style="position: absolute;top: 0px;">'
		+'<h1>Statistiques de la base de données</h1>'
		+'<h3>Afficher les statistiques en forme de ...</h3>'
		+'<div class="btn-group" data-toggle="buttons">'
		+'<label class="btn btn-primary active">'
		+'<input type="radio" name="options" value="camembert" autocomplete="off" checked><span class="glyphicon glyphicon-dashboard" aria-hidden="true"></span>&nbsp;Camembert</label>'
		+'<label class="btn btn-primary"><input type="radio" name="options" value="histogramme" autocomplete="off"><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>&nbsp;Histogramme </label>'
		+'<button class="btn btn-primary dwnStatBtn" ><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span>&nbsp;Télécharger ces statistiques au format PDF</button></div></div>');
	var xsltreceiver = document.createElement("div");
	xsltreceiver.className ="xsltReceiver";
	xsltreceiver.id="xsltReceiver"+idDivContent
	$(xsltreceiver).masonry();
	divFrame.append(xsltreceiver);
	var dwLink = divFrame.find('.dwnStatBtn');
	divFrame.find("input[type='radio']").change(function()
	{
		var statType=$(this).val();
		changeDwURL(statType,dwLink)
		majStatistiques(xsltreceiver,statType);
	});
	var statType=divFrame.find("input[checked]").val();
	changeDwURL(statType,dwLink)
	majStatistiques(xsltreceiver,statType);
}
function changeDwURL(statType,dwLink)
{
	var url = "/pdfStat?"
	for (var k in groupes){
		url+=k+"="+statType+"&";
	}
	dwLink.attr("onclick",'location.href=\''+url+'\'');
}
function majStatistiques(xsltreceiver,statType)
{
	xsltreceiver.innerHTML="";
	var asyncRunning=0;
	var total=0;
	var stepForStat= function(){

		meterObject.step();
		asyncRunning--;
		if(asyncRunning==0)
		{
			console.log("Masonry")
			$(xsltreceiver).masonry('destroy').masonry();
		}
	}

	for (var k in groupes){
		asyncRunning++;
		total++;
		getData("/xmlData",{"queryName":"STATISTIQUE","statType":statType,"groupEtab":k},k,function(xmlData,retourK)
		{

			writeXMLAsync(xsltreceiver,templateStat,xmlData.responseXML,false,"resultDocument",
				function(resultDocument){
					resultDocument.innerHTML+='<button class="btn btn-primary inDwButton" onclick="location.href=\'/pdfStat?'+retourK+'='+statType+'\'"><span class="glyphicon glyphicon-download-alt" aria-hidden="true">&nbsp;PDF</span></button>';
			
					stepForStat();
				});
			// writeXML(xsltreceiver,templateStat,xmlData.responseXML);
			 //stepForStat();
			});
	}
	console.log("WILL INIT");
	meterObject.init(total);
	meterObject.step();
}


function viewEtab(sender)
{
	xsltreceiver=$(sender).children(".collapse").children(".panel-body")[0];
	if (/\S/.test(xsltreceiver.innerHTML)) {
		return;
	}
	getData("/xmlData",{"queryName":"UN_ETABLISSEMENT","UAI":sender.title},undefined,function(xmlData)
	{
		writeXML(xsltreceiver,templateEtab,xmlData.responseXML);
	});
}

function formatDataIE(data){
	if(data.responseXML.firstElmentChild==undefined);
	{
		console.log("Données converties pour ie");
		return {'responseXML':$.parseXML(data.responseText)};
	}
	return data;
}

////////////////////////FONCTION DE PLACEMENTS DES POINTS DANS {DATA} SUR {MAP}
function placeAllPointsOn(data,map)
{
	data=formatDataIE(data);
	console.log(" placeAllPointsOn(data,map)");
	var etablissements= data.responseXML.firstChild.firstElementChild;
	var etablissementlenght = etablissements.childElementCount*2;
	for (var i = 1; i < etablissementlenght; i+=2) {
		var etablissement = etablissements.childNodes[i];
		var nom = etablissement.childNodes[1].firstChild.nodeValue;
		var latitude = etablissement.childNodes[3].firstChild.nodeValue;
		var longitude = etablissement.childNodes[5].firstChild.nodeValue;
		createPointOnMap(map,latitude,longitude,nom)
	}
}

///////////////////////Get data utilisant JAVASCRIPT
function getData(URL,args,callBackArg,callback)
{
	var req=null;
	console.log("getData(qName,callback,arg)");
	var argString="?";
	for (var k in args){
		argString+=k+"="+args[k]+"&";
	}
	ready = function() {
		if (req.readyState == 4) {
			if(req.status == 200) {
				console.log("getData(URL,qName,callback,arg)--->interval--->callback");
				callback(req,callBackArg);
			}
		}
	}
	if ("ActiveXObject" in window)
	{            
		req = new ActiveXObject("Msxml2.XMLHTTP.6.0");
	}
	else 
	{
		req = new XMLHttpRequest();	
	}
	req.onreadystatechange = ready;
	req.open("GET", URL+argString, true);
	req.send("");
	return;

}

//////////////FONCTION ECRITURE DE {XML DOC} parsé avec {XSLDOC} dans {DATA DIV}
function writeXML(dataDiv,xslDoc,xmlDoc,replace)
{
	if(replace) dataDiv.innerHTML="";
	var tmp = document.createElement('div');
	var child =undefined;
	var result =undefined;
	if ("ActiveXObject" in window || window.ActiveXObject)
	{
		xslDoc.setProperty("AllowDocumentFunction", true);
		ex = xmlDoc.transformNode(xslDoc);
		tmp.innerHTML +=ex;
		
	}
	else if (document.implementation && document.implementation.createDocument)
	{
		xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(xslDoc);
		resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);
		tmp.appendChild(resultDocument);
	}

	firstchild=tmp.firstElementChild;
	$(dataDiv).append( $(tmp).children());
	return firstchild;

}
function createPointOnMap(map,latitude,longitude,name)
{
	var contentString = '<h2>'+name+'</h2>';
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	var marker = new google.maps.Marker({
		position: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
		map: map,
		title: name
	});
	marker.addListener('click', function() {
		infowindow.open(map, marker);
	});
}
 //FONCTION ECTITURE XML DOC ASYNC
 var ecritureEncours=false;
 function writeXMLAsync(dataDiv,xslDoc,xmlDoc,replace,callBackArg,callback)
 {
 	var interval =	setInterval(function(){
 		if(!ecritureEncours){
 			ecritureEncours=true;
 			clearInterval(interval);
 			
 			var resultDocument = writeXML(dataDiv,xslDoc,xmlDoc,replace);
 			ecritureEncours=false;
 			if (callBackArg = "resultDocument") callback(resultDocument);
 			else callback(callBackArg);

 		}
 		else{
 			console.log("wait writing ! ")
 		}
 	},100);
 }

/*
///////////////////FONCTION CONVERSION D'ANGLES[ABANDONNE CAUSE FONCTIONS UTILISANT ABBANDONNEES]
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}

///////////////////FONCTION DESCRIPTION DE QUART DE CERCLE [ABANDONNE CAUSE FONCTIONS UTILISANT ABBANDONNEES]
function describeArc(x, y, radius, startAngle, endAngle){

	var start = polarToCartesian(x, y, radius, endAngle);
	var end = polarToCartesian(x, y, radius, startAngle);

	var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

	var d = [
	"M", start.x, start.y, 
	"A", radius, radius, 0, arcSweep, 0, end.x, end.y,
	"L", x,y,
	"L", start.x, start.y
	].join(" ");

	return d;       
}*/
/*
document.getElementById("arc1").setAttribute("d", describeArc(200, 400, 100, 0, 220));*/


// function writeXML2(dataDiv, qName,templateName)
// {
// 	$.get( "/xmlData",{ queryName: qName}).done(function(xmlFile)
// 	{
// 		$.get( "/xslt/"+templateName+".xsl").done(function(xmlTemplate){
// 			new Transformation().setXml(xmlFile.responseText)
// 			.setXslt(xmlTemplate.responseText).transform(dataDiv.id);
// 		});
// 	}
// 	);
// }

///////////////////FONCTION DESSIN ARC DE CERCLE DE TEMPLATE#1 [ABANDONNE CAUSE INCOMPATIBILITES NAVIGATEURS]
/*function drawCamemberts(xsltreceiver)
{
	var statistiques=xsltreceiver.getElementsByTagName("camembert");
	var stats = $(xsltreceiver).children("camembert");

	stats.each(function(){
		var svg = $(this).children("svg");
		var cercle = svg.children("circle");
		var total=parseFloat(cercle.html());
		var decalage=0;
		svg.children("path").each(function()
		{
		var portion = parseFloat($(this).html());
		var pourcentage = portion/total *360;
		$(this).attr("fill",'#'+Math.random().toString(16).substr(2,6));
		$(this).attr("d", describeArc(parseFloat(cercle.attr("cx")), parseFloat(cercle.attr("cy")), parseFloat(cercle.attr("r")), decalage, decalage+pourcentage));
		decalage=decalage+pourcentage;
		$(this).mouseenter(function(){
			oldcolor=$(this).attr("fill");
			$(this).attr("fill","darkgray")
			$(this).attr("stroke-width","5px")

		}).mouseleave(function(){
			$(this).attr("fill",oldcolor)
			$(this).attr("stroke-width","0px")
		});
	});

	//	$(this).children("")
});
}
*/
///////////////////////Get data utilisant JQUERY [ABANDONNE CAUSE : INCOMPATIBLE INTERNET EXPLORER] 
/*function getData(URL,qName,arg,callback)
{
	console.log("getData(qName,callback,arg)");
	var data = $.get( URL,{ queryName: qName}).done(function( data ) {
	}, 0);
	var interval = setInterval(function(){ 
		
		if(data.statusText=='OK')
		{
			clearInterval(interval);
			console.log("getData(URL,qName,callback,arg)--->interval--->callback");
			callback(data,arg);
		}
		else{
			console.log("getData(URL,qName,callback,arg)--->interval--->else " + data.statusText );
			
		}
	},0);

}
*/
//////FONCTION DE COLORISATION DE CAMEMBERT[ABANDONNE CAUSE REPLACE FULL XSLT]
/*
function drawCamembertsXsL(xsltreceiver)
{
	$(xsltreceiver).find("camembert").each(function(){
		$(this).children("svg").children("circle").each(function(){
			$(this).css("stroke",'#'+Math.random().toString(16).substr(2,6))
		});
	});
}*/
