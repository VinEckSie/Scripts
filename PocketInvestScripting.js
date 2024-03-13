///<reference path="typings/globals/xrm/index.d.ts" />

this.platformOnLoad = function (executionContext)
{
	var formContext = executionContext.getFormContext(); 

	formContext.ui.setFormNotification("Welcome to Pocket Invest. :). Here, you have a list of your loan platforms (Dev Version v033)","INFO","0001");  
    
}

this.BlacklistPlatform = function (primaryControl)
{
	var formContext = primaryControl;
    var confirmStrings = { text:"Do you really want blacklist".concat(primaryControl.getAttribute("cr471_name").getValue()) + " ?", title:"Blacklist confirmation"};
    var confirmOptions = { height: 200, width: 450 };

    Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
    function (success) {    
        if (success.confirmed)
        {
            primaryControl.getAttribute("statecode").setValue(1);
            Xrm.Page.data.save();
        }
    });    
}


this.loanOnLoad = function (executionContext)
{
	var formContext         = executionContext.getFormContext();    

	formContext.ui.setFormNotification("Welcome to Pocket Invest. :). Here, you have a list of your loans  (API " + Xrm.Utility.getGlobalContext().getVersion() + ", Dev Version v071)","INFO","0002");

    //Default values management
    (formContext.getAttribute("cr471_collateralvalue").getValue()) ? "": formContext.getAttribute("cr471_collateralvalue").setValue("No collateral value for this loan.");

    //Default visibility management
    (formContext.getAttribute("cr471_dateofclosing").getValue()) ? "": Xrm.Page.getControl("cr471_dateofclosing").setVisible(false);

    SetUpRecommendation(executionContext);

    //     let myDates =
    // `${control.toString()}
    // ${controlOpts.toString()}
    // ${control.setValue(controlOpts[0].value)}
    // ${control.setValue(controlOpts[0].value)}
    // ${control.setValue(controlOpts[0].value)}`;

    //  formContext.getAttribute("cr471_collateral").setValue(myDates);    
}

this.loanOnSave = function (executionContext)
{
    SetUpRecommendation(executionContext);
}


function SetUpRecommendation(executionContext)
{
	var formContext = executionContext.getFormContext(); 

    var reviewStatusControl = Xrm.Page.getControl('cr471_reviewstatus');
    var todayDate  = new Date();
    var issuedate   = new Date(formContext.data.entity.attributes.get('cr471_dateofissue').getValue());
    var initialTerm = formContext.data.entity.attributes.get('cr471_initialterm').getValue();
    var isTermOver = new Boolean();

    issuedate.setDate(issuedate.getDate() + initialTerm);
    isTermOver = issuedate < todayDate;

    if (isTermOver) {
        var actionCollection = {
            message: 'This loan is overdue.Set this loan on survey status ?',
            actions: null
        };

        actionCollection.actions = [function () {
            SetOptionSet("cr471_reviewstatus","On survey");                
            reviewStatusControl.clearNotification('0003');
        }];

        reviewStatusControl.addNotification({
            messages: ['Intial term is over'],
            notificationLevel: 'RECOMMENDATION',
            uniqueId: '0003',
            actions: [actionCollection]
        });
    }
    else
    {
        SetOptionSet("cr471_reviewstatus",null);   
        reviewStatusControl.clearNotification('0003');
    }
}

// *** FUNCTION: SetOptionSet
// *** PARAMS:
// ***  fieldName = The name of the optionset field
// ***  setText = The text to set the optionset with
function SetOptionSet(fieldName, setText) {
	try {
		var control = Xrm.Page.getAttribute(fieldName);

		if (control.getAttributeType() == 'optionset') {
			if (setText == "" || setText == null || setText == undefined) {
				control.setValue(null);
			}
			else {
				var controlOpts = control.getOptions();
				for (var i = 0; i <= controlOpts.length - 1; i++) {
					if (controlOpts[i].text.toLowerCase() == setText.toLowerCase()) {
						control.setValue(controlOpts[i].value);
						return ;
					}
				}
			}
		}
		else {
			alert("Invalid field type or field not found. Field type should be OptionSet");
			return ;
		}
	}
	catch (e) {
		alert("Error in SetOptionSet: fieldName = " + fieldName + " setText = " + setText + " error = " + e);
	}
}