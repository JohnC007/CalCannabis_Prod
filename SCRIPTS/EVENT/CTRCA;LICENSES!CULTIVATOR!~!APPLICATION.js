//lwacht
//remove conditions after documents are uploaded
try{
	var cType = "License Required Documents";
	var capCondResult = aa.capCondition.getCapConditions(capId,cType);
	if (!capCondResult.getSuccess()){
		logDebug("**WARNING: error getting cap conditions : " + capCondResult.getErrorMessage()) ; 
	}else{
		var ccs = capCondResult.getOutput();
		for (pc1 in ccs){
			var rmCapCondResult = aa.capCondition.deleteCapCondition(capId,ccs[pc1].getConditionNumber()); 
			if (rmCapCondResult.getSuccess())
				logDebug("Successfully removed condition to CAP : " + capId + "  (" + cType + ") ");
			else
				logDebug( "**ERROR: removing condition  (" + cType + "): " + rmCapCondResult.getErrorMessage());
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Remove Conditions: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Remove Conditions: "+ startDate, capId + br + err.message+ br+ err.stack + br + currEnv);
}
//mhart
//update work description with Legal Business Name
//lwacht: don't run for temporary app 
try {
	if(appTypeArray[2]!="Temporary"){
		updateLegalBusinessName();
		editAppName(AInfo["License Type"]);
		updateShortNotes(AInfo["Premise County"]);
	}
}catch (err){
	logDebug("A JavaScript Error occurred: CRTCA: Licenses/Cultivation/*/Application: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: CTRCA:Licenses/Cultivation/*/Application: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}

//lwacht
//add child if app number provided
try{
	if(!matches(AInfo["Temp App Number"],null,"", "undefined")){
		var tmpID = aa.cap.getCapID(AInfo["Temp App Number"]);
		if(tmpID.getSuccess()){
			var childCapId = tmpID.getOutput();
			var parId = getParentByCapId(childCapId);
			if(parId){
				var linkResult = aa.cap.createAppHierarchy(capId, parId);
				if (!linkResult.getSuccess()){
					logDebug( "Error linking to parent application parent cap id (" + capId + "): " + linkResult.getErrorMessage());
				}
			}else{
				var linkResult = aa.cap.createAppHierarchy(capId, childCapId);
				if (!linkResult.getSuccess()){
					logDebug( "Error linking to temp application(" + childCapId + "): " + linkResult.getErrorMessage());
				}
			}				
		}
	}
} catch(err){
	logDebug("An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Relate Temp Record: " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "An error has occurred in CTRCA:LICENSES/CULTIVATOR/*/APPLICATION: Relate Temp Record: "+ startDate, capId + br + err.message + br + err.stack + br + currEnv);
}