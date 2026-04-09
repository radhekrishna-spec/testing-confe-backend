const { google } = require('googleapis');
const { Readable } = require('stream');
const store = require('../../store/store');
const College = require('../../models/College');

function getDriveClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({
    version: 'v3',
    auth,
  });
}

function getDriveDirectImageUrl(fileId) {
  return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
}

async function getCollegeFolders(collegeId) {
  const college = await College.findOne({
    collegeId,
    isActive: true,
  });

  if (!college) {
    throw new Error('College not found for drive config');
  }

  return {
    root: college?.drive?.rootFolderId,
    queue: college?.drive?.queueFolderId,
    posted: college?.drive?.postedFolderId,
    rejected: college?.drive?.rejectedFolderId,
    edited: college?.drive?.editArchiveFolderId,
  };
}

async function uploadImagesToDrive(
  imageBuffers,
  confessionNo,
  collegeId,
  folderType = 'root',
) {
  const drive = getDriveClient();

  const folderMap = await getCollegeFolders(collegeId);

  const folderId = folderMap[folderType] || folderMap.root;

  let storedImages = [];
  let ids = store.get(`fileIds_${confessionNo}`) || [];

  for (let index = 0; index < imageBuffers.length; index++) {
    const imgName =
      imageBuffers.length === 1
        ? `c_${confessionNo}.png`
        : `c_${confessionNo}_part${index + 1}.png`;

    const stream = Readable.from(imageBuffers[index]);

    const res = await drive.files.create({
      requestBody: {
        name: imgName,
        parents: [folderId],
      },
      media: {
        mimeType: 'image/png',
        body: stream,
      },
      fields: 'id',
    });

    const fileId = res.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    ids.push(fileId);
    storedImages.push(getDriveDirectImageUrl(fileId));
  }

  store.set(`fileIds_${confessionNo}`, ids);

  return storedImages;
}

async function moveFileToFolder(fileId, folderType, collegeId) {
  const drive = getDriveClient();

  const folderMap = await getCollegeFolders(collegeId);

  const targetFolderId = folderMap[folderType];

  const file = await drive.files.get({
    fileId,
    fields: 'parents',
  });

  const previousParents = file.data.parents.join(',');

  await drive.files.update({
    fileId,
    addParents: targetFolderId,
    removeParents: previousParents,
    fields: 'id, parents',
  });
}

module.exports = {
  uploadImagesToDrive,
  moveFileToFolder,
  getDriveDirectImageUrl,
};
