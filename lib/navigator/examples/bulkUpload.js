/**
 * @file
 * Example 003: Bulk upload
 * @author DocuSign
 */

const iam = require('@docusign/iam-sdk');
const fs = require('fs-extra');
const nf = require('node-fetch');
const path = require('path');

const createBulkUploadJob = async (args) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });

  return await client.agreementManager.bulkJob.createBulkUploadJob({
    accountId: args.accountId,
    createBulkJob: {
      jobName: args.jobName,
      expectedNumberOfDocs: 5,
      language: 'en-US',
    }
  });
};

const uploadDocuments = async (uploadUrls, filePaths) => {
  const count = Math.min(uploadUrls.length, filePaths.length);

  for (let i = 0; i < count; i++) {
    const uploadUrl = uploadUrls[i];
    const filePath = filePaths[i];
    const fileName = path.basename(filePath);

    if (!fs.pathExistsSync(filePath)) {
      console.log(`Skipping ${fileName} - file not found: ${filePath}`);
      continue;
    }

    if (!uploadUrl || uploadUrl.trim() === '') {
      console.log(`Skipping ${fileName} - no upload URL found`);
      continue;
    }

    const fileBuffer = await fs.readFile(filePath);
    const contentType = getContentType(fileName);

    const response = await nf(uploadUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'x-ms-meta-filename': fileName,
        'Content-Type': contentType,
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const error = await response.text();

      console.log(
        `Failed to upload ${fileName}. ` +
          `Status: ${response.status} ${response.statusText}. ` +
          `Response: ${error}`
      );

      continue;
    }
  }
};

const completeBulkUploadJob = async (args) => {
  const client = new iam.IamClient({ accessToken: args.accessToken });

  return await client.agreementManager.bulkJob.uploadCompleteBulkJob({
    accountId: args.accountId,
    jobId: args.jobId,
  });
};

const getContentType = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.html':
      return 'text/html';
    case '.txt':
      return 'text/plain';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.csv':
      return 'text/csv';
    default:
      return 'application/octet-stream';
  }
};

module.exports = { createBulkUploadJob, uploadDocuments, completeBulkUploadJob };
