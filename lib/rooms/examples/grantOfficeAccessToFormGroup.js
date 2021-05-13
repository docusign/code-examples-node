/**
 * @file
 * Example 008: Grant office access to form group
 * @author DocuSign
 */

const docusignRooms = require("docusign-rooms")

const grantOfficeAccessToFormGroup = exports

/**
 * Get form groups
 * @param {object} args
 */
grantOfficeAccessToFormGroup.getFormGroups = async (args) => {
    // Create an API with headers
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

    // GET Form Groups via FormGroupsAPI
    // Step 4 start
    const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
    const results = await formsGroupsApi.getFormGroups(args.accountId);
    // Step 4 end

    return results.formGroups
}

/**
 * Get offices
 * @param {object} args
 */
grantOfficeAccessToFormGroup.getOffices = async (args) => {
    // Create an API with headers
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);

    // GET offices via OfficesApi
    // Step 3 start 
    const officesApi = new docusignRooms.OfficesApi(dsApiClient);
    const results = await officesApi.getOffices(args.accountId);
    // Step 3 end

    return results.officeSummaries
}

/**
 * Grant office access to form group
 * @param {object} args
 */
grantOfficeAccessToFormGroup.grantAccess = async (args) => {
    // Create an API with headers
    // Step 2 start
    let dsApiClient = new docusignRooms.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
    // Step 2 end

    // Post the form object using SDK
    // Step 5 start
    const formsGroupsApi = new docusignRooms.FormGroupsApi(dsApiClient);
    const results = await formsGroupsApi.grantOfficeAccessToFormGroup(args.accountId, args.formGroupId, args.officeId);
    // Step 5 end

    console.log(`Office ${args.officeId} has been assigned to Form Group ID ${args.formGroupId}`);
    return results;
}

/**
 * Form page for this application
 */
grantOfficeAccessToFormGroup.getFormGroupsAndOffices = async (args) => {
    let formGroups, offices;
  
    formGroups = await grantOfficeAccessToFormGroup.getFormGroups(args);
    offices = await grantOfficeAccessToFormGroup.getOffices(args);
    
    return ({formGroups, offices})
}
