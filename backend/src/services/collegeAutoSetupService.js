const { google } = require('googleapis');
const College = require('../models/College');

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

async function createFolder(drive, name, parentId = null) {
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {}),
  };

  const response = await drive.files.create({
    resource: metadata,
    fields: 'id',
  });

  return response.data.id;
}

async function givePublicPermission(drive, folderId) {
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
}

async function setupCollegeFolders(collegeId, collegeName) {
  const drive = google.drive({
    version: 'v3',
    auth,
  });

  const mainRootFolderId = process.env.GOOGLE_COLLEGES_ROOT_FOLDER_ID;

  const rootFolderId = await createFolder(drive, collegeName, mainRootFolderId);

  const queueFolderId = await createFolder(drive, 'Queue', rootFolderId);

  const postedFolderId = await createFolder(drive, 'Posted', rootFolderId);

  const rejectedFolderId = await createFolder(drive, 'Rejected', rootFolderId);

  const editArchiveFolderId = await createFolder(
    drive,
    'Archive',
    rootFolderId,
  );

  const smallConfessionFolder = await createFolder(
    drive,
    'Small Confessions',
    rootFolderId,
  );

  await givePublicPermission(drive, rootFolderId);

  await College.updateOne(
    { collegeId },
    {
      $set: {
        drive: {
          rootFolderId,
          queueFolderId,
          postedFolderId,
          rejectedFolderId,
          editArchiveFolderId,
          smallConfessionFolder,
        },
      },
    },
  );

  return {
    success: true,
    drive: {
      rootFolderId,
      queueFolderId,
      postedFolderId,
      rejectedFolderId,
      editArchiveFolderId,
      smallConfessionFolder,
    },
  };
}

module.exports = {
  setupCollegeFolders,
};
