function renewalProcessLC() {	
		var fastTrack = true;
		var parentCapId = getParent();
		var licAltId = parentCapId.getCustomID();
	// Check License Cases to see if renewal can be fast tracked
		var caseReview = false;
		childIds  = getChildren("Licenses/Cultivator/License Case/*",parentCapId);
		if (childIds){
			for(c in childIds) {
				childCapId = childIds[c];
				cCap = aa.cap.getCap(childCapId).getOutput();
				cStatus = cCap.getCapStatus();
				if (!matches(cStatus,"Resolved","Closed")){
					if(matches(getAppSpecific("Case Renewal Type",childCapId),"Renewal Review","Renewal Hold")) {
						caseReview = true;
					}
				}
			}
		}
		if (!caseReview){
			var renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
			if (renewalCapProject != null) {
				var renCapId = renewalCapProject.getCapID();
				if (!renCapId.toString().contains("EST")){
					var renewalCap = aa.cap.getCap(renCapId).getOutput();
					var altId = String(renewalCap.getCapID().getCustomID());
					var capDetailObjResult = aa.cap.getCapDetail(renCapId);
					if (capDetailObjResult.getSuccess()){
						capDetail = capDetailObjResult.getOutput();
						var balanceDue = capDetail.getBalance();
						if (balanceDue == 0){
							// Get current expiration date.
							vLicenseObj = new licenseObject(null, parentCapId);
							vExpDate = new Date(vExpDate);
							// Extend license expiration by 1 year
							vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
							// Update license expiration date
							if (AInfo['License Expiration Date Change'] == "Yes" && !matches(AInfo['New Expiration Date'],null,undefined,"")){
									newExpDate = new Date(AInfo['New Expiration Date']);
									logDebug("Updating Expiration Date to: " + newExpDate);
									vLicenseObj.setExpiration(dateAdd(newExpDate,0));
									editAppSpecific("Expiration Date Changed","CHECKED",parentCapId);
							}else{
								logDebug("Updating Expiration Date to: " + vNewExpDate);
								vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
							}
							// Set license record expiration and status to active
							vLicenseObj.setStatus("Active");
							if (aa.cap.getCap(parentCapId).getOutput().getCapStatus() != "Inactive"){
								updateAppStatus("Active","License Renewed",parentCapId);
							}
							limitedOp = AInfo['Limited Operation'] == "Yes";
							if(limitedOp){
								if(appHasCondition_rev("Application Condition","Applied","Suspension Lift Notice","Notice",parentCapId)){
									editCapConditionStatus("Application Condition","Suspension Lift Notice","Condition Met","Not Applied",parentCapId);
								}
							}
							savedCapStatus = getAppSpecific("Saved License Status",parentCapId);
							if (savedCapStatus == "Suspended"){
								updateAppStatus("Suspended","License Renewed",parentCapId);
								if(limitedOp){
									if(!appHasCondition_rev("Application Condition","Applied","Suspension Lift Notice","Notice",parentCapId)){
				 		 				addStdCondition("Application Condition","Suspension Lift Notice".parentCapId);
				 		 			}
				 		 		}
							}
							// Update Canopy Size on the license record
							if(getAppSpecific("License Change",renCapId) == "Yes"){
								editAppSpecific("License Type",getAppSpecific("New License Type",renCapId),parentCapId);
								editAppSpecific("Aggregate square footage of noncontiguous canopy",getAppSpecific("Aggragate Canopy Square Footage",renCapId),parentCapId);
								editAppSpecific("Canopy Plant Count",getAppSpecific("Canopy Plant Count",renCapId),parentCapId);
								var licType = getAppSpecific("New License Type",renCapId);
							}else{
								var licType = getAppSpecific("License Type",renCapId);
							}
							// Update the Cultivation Type on the license record
							var licIssueType = getAppSpecific("License Issued Type",renCapId);
							var desChange = getAppSpecific("Designation Change",renCapId);
							if(desChange == "Yes") {
								var cultType = getAppSpecific("Designation Type",renCapId);
								editAppSpecific("Cultivator Type",cultType ,parentCapId);
							}else{
								var cultType = getAppSpecific("Cultivator Type",renCapId);
							}
							editAppName(licIssueType + " " + cultType + " - " + appLicType,parentCapId);
							// Update Financial Interest Table
							if (typeof(FINANCIALINTERESTHOLDERNEW) == "object"){
								if(FINANCIALINTERESTHOLDERNEW.length > 0){
									finTable = new Array();
									for(xx in FINANCIALINTERESTHOLDERNEW){
										var finNewRow = FINANCIALINTERESTHOLDERNEW[xx];
										finRow = new Array();
										finRow["Type of Interest Holder"] = finNewRow["Type of Interest Holder"];
										finRow["Legal First Name"] = finNewRow["Legal First Name"];
										finRow["Legal Last Name"] = finNewRow["Legal Last Name"];
										finRow["Email Address"] = finNewRow["Email Address"];
										finRow["Contact Phone Number"] = finNewRow["Contact Phone Number"];
										finRow["Type of Government ID"] = finNewRow["Type of Government ID"];
										finRow["Government ID Number"] = finNewRow["Government ID Number"];
										finRow["Legal Business Name"] = finNewRow["Legal Business Name"];
										finRow["Primary Contact Name"] = finNewRow["Primary Contact Name"];
										finRow["Primary Contact Phone Number"] = finNewRow["Primary Contact Phone Number"];
										finRow["Primary Contact Email Address"] = finNewRow["Primary Contact Email Address"];
										finRow["FEIN"] = finNewRow["FEIN"];
										finTable.push(finRow);
									}
									removeASITable("FINANCIAL INTEREST HOLDER",vLicenseID);
									addASITable("FINANCIAL INTEREST HOLDER",finTable,vLicenseID);
								}
							}
							// Update Electricity Usage Table
							if (typeof(ELECTRICITYUSAGE) == "object"){
								if(ELECTRICITYUSAGE.length > 0){
									elecTable = new Array();
									for(jj in ELECTRICITYUSAGE){
										var elecNewRow = ELECTRICITYUSAGE[jj];
										elecRow = new Array();
										elecRow["Reporting Year"] = "" + elecNewRow["Reporting Year"];
										elecRow["Usage Type"] = "" + elecNewRow["Usage Type"];
										elecRow["Type of Off Grid Renewable Source"] = "" + elecNewRow["Type of Off Grid Renewable Source"];
										elecRow["Type of Other Source"] = "" + elecNewRow["Type of Other Source"];
										elecRow["Other Source description"] = "" + elecNewRow["Other Source description"];
										elecRow["Name of Utility Provider"] = "" + elecNewRow["Name of Utility Provider"];
										elecRow["Total Electricity Supplied (kWh)"] = "" + elecNewRow["Total Electricity Supplied (kWh)"];
										elecRow["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"] = "" + elecNewRow["Total Electricity Supplied by Zero Net Energy Renewable (kWh)"];
										elecRow["GGEI (lbs CO2e/kWh)"] = "" + elecNewRow["GGEI (lbs CO2e/kWh)"];
										elecTable.push(elecRow);
									}
									addASITable("ELECTRICITY USAGE",elecTable,vLicenseID);	
								}
							}
							// Update AVERAGE WEIGHTED GGEI Table
							if (typeof(AVERAGEWEIGHTEDGGEI) == "object"){
								if(AVERAGEWEIGHTEDGGEI.length > 0){
									weigtedTable = new Array();
									for(pp in AVERAGEWEIGHTEDGGEI){
										var weightedNewRow = AVERAGEWEIGHTEDGGEI[pp];
										weigtedRow = new Array();
										weigtedRow["Reporting year"] = "" + weightedNewRow["Reporting year"];
										weigtedRow["Average Weighted GGEI"] = "" + weightedNewRow["Average Weighted GGEI"];
										weigtedTable.push(weigtedRow);
									}
									addASITable("AVERAGE WEIGHTED GGEI",weigtedTable,vLicenseID);
								}
							}				
							//Set renewal to complete, used to prevent more than one renewal record for the same cycle
							renewalCapProject.setStatus("Complete");
							renewalCapProject.setRelationShip("R");  // move to related records
							aa.cap.updateProject(renewalCapProject);
							//Update Renewal Workflow and Record Status to Approved
							var workflowResult = aa.workflow.getTasks(renCapId);
							if (workflowResult.getSuccess()){
								var wfObj = workflowResult.getOutput();
							}else{ 
								logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
							}
							var fTask;
							var stepnumber;
							var dispositionDate = aa.date.getCurrentDate();
							var wfnote = " ";
							var wfcomment = "";
							var wftask;
							var taskArray = ['Renewal Review','Provisional Renewal Review','Annual Renewal Review'];
							for (i in wfObj) {
								fTask = wfObj[i];
								wftask = fTask.getTaskDescription();
								stepnumber = fTask.getStepNumber();
								dispositionDate = aa.date.getCurrentDate();
								if (exists(wftask,taskArray)) {
									if(fTask.getActiveFlag() == "Y") {
										aa.workflow.handleDisposition(renCapId, stepnumber, "Approved", dispositionDate, wfnote, wfcomment, systemUserObj, "Y");
										logDebug("Results: "  + fTask.getTaskDescription() + " " + fTask.getDisposition());
									}
								}
							}
							updateAppStatus("Approved","",renCapId);				
							//Run Official License Certificate and Annual/Provisional Renewal Approval Email and Set the DRP		
							if (licIssueType == "Provisional"){
								var approvalLetter = "Provisional Renewal Approval";
							}else{
								var approvalLetter = "Approval Letter Renewal";
							}
							var scriptName = "asyncRunOfficialLicenseRpt";
							var envParameters = aa.util.newHashMap();
							envParameters.put("licType", "");
							envParameters.put("appCap",altId);
							envParameters.put("licCap",licAltId); 
							envParameters.put("reportName","Official License Certificate");
							envParameters.put("approvalLetter", approvalLetter);
							envParameters.put("emailTemplate", "LCA_RENEWAL_APPROVAL");
							envParameters.put("reason", "");
							envParameters.put("currentUserID",currentUserID);
							envParameters.put("contType","Designated Responsible Party");
							envParameters.put("fromEmail",sysFromEmail);
							aa.runAsyncScript(scriptName, envParameters);
							
							var priContact = getContactObj(parentCapId,"Designated Responsible Party");
							// If DRP preference is Postal add license record to Annual/Provisional Renewal A set
							if(priContact){
								var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
								if(!matches(priChannel, "",null,"undefined", false)){
									if(priChannel.indexOf("Postal") > -1 ){
										
										if (licIssueType == "Provisional") {
											var sName = createSet("PROVISIONAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
										}
										if (licIssueType == "Annual"){
											var sName = createSet("ANNUAL_LICENSE_RENEWAL_ISSUED","License Notifications", "New");
										}
										if(sName){
											setAddResult=aa.set.add(sName,parentCapId);
											if(setAddResult.getSuccess()){
												logDebug(parentCapId.getCustomID() + " successfully added to set " +sName);
											}else{
												logDebug("Error adding record to set " + sName + ". Error: " + setAddResult.getErrorMessage());
											}
										}
									}
								}
							}
							// Add record to the CAT set
							addToCat(parentCapId);
						}
					}
				}
			}
		}else {
			fastTrack = false;
		}
}