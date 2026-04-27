const axios = require('axios');
const College = require('../../models/College');

// =========================
// GET IG CONFIG FROM DB
// =========================
async function getInstagramConfig(collegeId) {
  const college = await College.findOne({
    collegeId,
    isActive: true,
  });

  if (!college?.instagram?.igUserId || !college?.instagram?.accessToken) {
    throw new Error(`Instagram config missing for ${collegeId}`);
  }

  return {
    IG_USER_ID: college.instagram.igUserId,
    ACCESS_TOKEN: college.instagram.accessToken,
  };
}

// =========================
// SINGLE IMAGE POST
// =========================
async function postSingleImage(imageUrl, caption, collegeId) {
  const { IG_USER_ID, ACCESS_TOKEN } = await getInstagramConfig(collegeId);

 // console.log('📸 SINGLE POST →', collegeId);

  let container;

  try {
    container = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
      null,
      {
        params: {
          image_url: imageUrl,
          caption,
          access_token: ACCESS_TOKEN,
        },
      },
    );
  } catch (err) {
    console.error('❌ IG ERROR:', err.response?.data || err.message);
    throw err;
  }

  const creationId = container.data.id;

  await waitForMediaReady(creationId, ACCESS_TOKEN);

  let publishRes;

  try {
    publishRes = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: ACCESS_TOKEN,
        },
      },
    );

   // console.log('📤 PUBLISH RESPONSE:', publishRes.data);
  } catch (err) {
    console.error('❌ IG PUBLISH ERROR:', err.response?.data || err.message);
    throw err;
  }

  if (!publishRes?.data?.id) {
    throw new Error('Instagram publish failed');
  }

 // console.log('✅ SINGLE POST SUCCESS:', publishRes.data.id);
  return true;
}

// =========================
// CAROUSEL POST
// =========================
async function postCarousel(images, caption, collegeId) {
  const { IG_USER_ID, ACCESS_TOKEN } = await getInstagramConfig(collegeId);

  const children = [];

  for (const url of images) {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
      null,
      {
        params: {
          image_url: url,
          is_carousel_item: true,
          access_token: ACCESS_TOKEN,
        },
      },
    );

    const id = res.data.id;

    await waitForMediaReady(id, ACCESS_TOKEN);

    children.push(id);
  }

  const carousel = await axios.post(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
    null,
    {
      params: {
        children: children.join(','),
        caption,
        media_type: 'CAROUSEL',
        access_token: ACCESS_TOKEN,
      },
    },
  );

  const creationId = carousel.data.id;

  let publishRes;

  try {
    publishRes = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: ACCESS_TOKEN,
        },
      },
    );

   // console.log('📤 PUBLISH RESPONSE:', publishRes.data);
  } catch (err) {
    console.error('❌ IG PUBLISH ERROR:', err.response?.data || err.message);
    throw err;
  }

  if (!publishRes?.data?.id) {
    throw new Error('Instagram publish failed - no media id');
  }

 // console.log('🚀 CAROUSEL POST SUCCESS:', publishRes.data.id);
  return true;
}
async function waitForMediaReady(creationId, accessToken) {
  for (let i = 0; i < 20; i++) {
    const res = await axios.get(
      `https://graph.facebook.com/v19.0/${creationId}`,
      {
        params: {
          fields: 'status_code',
          access_token: accessToken,
        },
      },
    );

    const status = res.data.status_code;

   // console.log('⏳ MEDIA STATUS:', status);

    if (status === 'FINISHED') return true;

    if (status === 'ERROR') {
      throw new Error('Media processing failed');
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error('Media not ready timeout');
}
// =========================
// MAIN FUNCTION
// =========================
async function postToInstagram(images, caption, collegeId) {
  if (!images || !images.length) {
    throw new Error('No images provided');
  }

  //console.log('🔥 POSTING FOR COLLEGE:', collegeId);

  if (images.length === 1) {
    return await postSingleImage(images[0], caption, collegeId);
  }

  return await postCarousel(images, caption, collegeId);
}

module.exports = {
  postToInstagram,
};
